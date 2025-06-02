from flask import request, jsonify
from flask_appbuilder import expose
from superset.views.base import api, BaseSupersetView, handle_api_exception
from superset import db, event_logger
from flask_appbuilder.security.decorators import has_access_api
from superset.models.slice import Slice
from superset.models.dashboard import Dashboard
import json

class PromptDatasetToPromptTableApi(BaseSupersetView):
    route_base = "/prompt_dataset_table"
    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/create_viz", methods=["POST"])
    def create_viz(self):
        data = request.json
        dashboard_id = data["dashboard_id"]
        dataset_id = data["dataset_id"]
        columns = data["columns"]

        new_slice = Slice(
            slice_name="Dynamic Table",
            viz_type="table_from_prompt",
            datasource_type="table",
            datasource_id=dataset_id,
            params=json.dumps({
                "all_columns": columns,
                "row_limit": 1000,
                "viz_type": "table",
                "datasource": f"{dataset_id}__table",
            }),
        )
        db.session.add(new_slice)
        db.session.commit()

        dashboard = db.session.query(Dashboard).get(dashboard_id)
        dashboard.slices.append(new_slice)
        db.session.commit()

        return jsonify({"success": True})