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

from flask import request, jsonify
from flask_appbuilder.api import expose, safe
from superset.views.base_api import BaseSupersetApi
from superset import db, event_logger
from superset.models.slice import Slice
from superset.models.dashboard import Dashboard
import json
import requests

class QueryDatabaseApi(BaseSupersetApi):
    resource_name = "query_database"  # becomes part of /api/v1/query_database/
    openapi_spec_tag = "Prompt Dataset to Table"
    @event_logger.log_this
    @safe
    @expose("/generate", methods=["POST"])
    def generate_sql(self):
        question = request.json.get("question", "")
        if not question:
            return jsonify({"error": "Missing question"}), 400

        try:
            api_url = "http://118.179.215.4:4201/query"
            response = requests.post(api_url, json={"question": question})
            response.raise_for_status()

            result = response.json()
            return jsonify({"query": result.get("query") or result})
        except Exception as e:
            return jsonify({"error": str(e)}), 500