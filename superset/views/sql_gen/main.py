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
from dotenv import load_dotenv
from superset import app
config = app.config

from superset.views.sql_gen.schema import get_postgres_schema, get_schema

from superset.views.sql_gen.gen_sql_query import generate_sql_query

# Load environment variables (e.g., GEMINI_API_KEY, DATABASE_URL, SCHEMA_NAME)
load_dotenv()

database_url = config['DATABASE_URL']
schema_name = config['SCHEMA_NAME']
db_schema = get_postgres_schema(database_url, schema_name)


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

    @expose("/schema", methods=("GET",))
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
        return self.response(200, schema=db_schema)

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

        if not query_description:
            return self.response(400, message="Missing 'queryDescription'")

        try:
            sql_query = generate_sql_query(get_schema(), query_description)
            return self.response(200, query=sql_query)
        except Exception as ex:
            return self.response(500, message=f"Error generating SQL: {str(ex)}")
