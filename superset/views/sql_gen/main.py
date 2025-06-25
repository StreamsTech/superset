# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import os
from flask import request, Response
from flask_appbuilder.api import expose, safe
from superset.views.base_api import BaseSupersetApi
from superset import db
from superset.models.core import Database
from sqlalchemy import text, inspect
from dotenv import load_dotenv
from superset import app
import logging
config = app.config

from superset.views.sql_gen.schema import get_postgres_schema, get_schema, get_postgres_schema_with_description

from superset.views.sql_gen.gen_sql_query import generate_sql_query

# Load environment variables (e.g., GEMINI_API_KEY, DATABASE_URL, SCHEMA_NAME)
load_dotenv()

logging.basicConfig(level=logging.INFO)

##database_url = config['DATABASE_URL']
##schema_name = config['SCHEMA_NAME']
##db_schema = get_postgres_schema(database_url, schema_name)


class GeminiSqlRestApi(BaseSupersetApi):
    """API to generate SQL from a natural language prompt using Google Gemini"""

    resource_name = "gemini_sql"
    openapi_spec_tag = "Gemini SQL"

    @expose("/", methods=("GET",))
    @safe
    def root(self) -> Response:
        """
        Root endpoint for health check or welcome.
        ---
        get:
          description: A simple hello world endpoint
          responses:
            200:
              description: Simple success message
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      message:
                        type: string
        """
        return self.response(200, message="Hello from Gemini SQL API")

    @expose("/schema", methods=("POST",))
    @safe
    def get_schema(self) -> Response:
        """
        Returns the current schema used to generate SQL.
        ---
        get:
          description: Returns the active database schema used by Gemini
          responses:
            200:
              description: The schema
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      schema:
                        type: string
        """
        data = request.get_json()
        db_id = data.get("dbId")
        schema_name = data.get("schemaName")

        if not db_id or not schema_name:
            return self.response(400, message="Missing 'dbId' or 'schemaName'")
        try:
            # Fetch the database connection info from Superset metadata
            database = db.session.query(Database).filter_by(id=db_id).first()
            if not database:
                return self.response(400, message=f"Database with id {db_id} not found")

            #engine = database.get_engine(schema=schema_name)
            database_url = database.sqlalchemy_uri_decrypted
            db_schema = get_postgres_schema_with_description(database_url, schema_name)
            logging.info(f"Using schema: {db_schema}")
            return self.response(200, schema=db_schema)
        except Exception as ex:
            return self.response(500, message=f"Error fetching schema: {str(ex)}")

    @expose("/generate", methods=("POST",))
    @safe
    def generate_query(self) -> Response:
        """
        Generate a SQL query from natural language description.
        ---
        post:
          description: Generate a SQL query from the input prompt using Gemini
          requestBody:
            required: true
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    queryDescription:
                      type: string
                      example: "List all orders placed in the last 30 days"
          responses:
            200:
              description: Generated SQL query
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      query:
                        type: string
            400:
              description: Bad request
            500:
              description: Internal server error
        """
        data = request.get_json()
        query_description = data.get("queryDescription")
        db_id = data.get("dbId")
        schema_name = data.get("schemaName")
        db_schema = data.get("dbSchema")

        if not query_description:
            return self.response(400, message="Missing 'queryDescription'")
        if not db_id or not schema_name:
            return self.response(400, message="Missing 'dbId' or 'schemaName'")
        if not db_schema:
            return self.response(400, message="Missing 'dbSchema'")
        try:
            # Fetch the database connection info from Superset metadata
            database = db.session.query(Database).filter_by(id=db_id).first()
            if not database:
                return self.response(400, message=f"Database with id {db_id} not found")
            table_alias_lines = []
            column_alias_lines = []
            with database.get_sqla_engine_with_context(schema=schema_name) as engine:
              inspector = inspect(engine)
          
              with engine.connect() as conn:
                  if "table_alias" in inspector.get_table_names(schema=schema_name):
                      result = conn.execute(f'SELECT * FROM "{schema_name}"."table_alias"')
                      for row in result:
                          original_table = row["original_name"]
                          aliases = row["alias"]
                          table_alias_lines.append(f"{original_table} as {aliases}")
          
                  if "column_alias" in inspector.get_table_names(schema=schema_name):
                      result = conn.execute(f'SELECT * FROM "{schema_name}"."column_alias"')
                      for row in result:
                          table_name = row["table_name"]
                          column_name = row["column_name"]
                          aliases = row["alias"]
                          column_alias_lines.append(f"{table_name}.{column_name} as {aliases}")

            table_alias = (
                "please consider the table alias:\n" + "\n".join(table_alias_lines)
                if table_alias_lines
                else ""
            )
            column_alias = (
                "please consider the table.column alias:\n"
                + "\n".join(column_alias_lines)
                if column_alias_lines
                else ""
            )

            #engine = database.get_engine(schema=schema_name)
            database_url = database.sqlalchemy_uri_decrypted
            #database_url = database.sqlalchemy_uri
            #db_schema = get_postgres_schema(database_url, schema_name)
            ##db_schema = get_postgres_schema_with_description(database_url, schema_name)
            logging.info(f"Using schema: {db_schema}")
            logging.info(f"Using dbURL: {database_url}")

            logging.info(table_alias)
            logging.info(column_alias)
            

            sql_query = generate_sql_query(db_schema, query_description, table_alias, column_alias)
            return self.response(200, query=sql_query)
        except Exception as ex:
            return self.response(500, message=f"Error generating SQL: {str(ex)}")
