from flask import request, jsonify
from flask_appbuilder import expose
from superset.views.base import api, handle_api_exception
from superset.views.base_api import BaseSupersetApi
from superset import db, event_logger
from flask_appbuilder.security.decorators import has_access_api
from superset.models.slice import Slice
from superset.models.dashboard import Dashboard
import json

class PromptTableApi(BaseSupersetApi):
    route_base = "/prompt_table"
    @event_logger.log_this
    @api
    @handle_api_exception
    @has_access_api
    @expose("/create_viz", methods=["POST"])
    def create_viz(self):
        data = request.json
        dashboard_id = data["dashboard_id"]
        dataset_id = data["dataset_id"]
        viz_type = data["viz_type"]
        groupby = data["groupby"]
        metric = data["metric"]
        slice_id = data["slice_id"]  # ✅ pass this from frontend
    
        slice_to_update = db.session.query(Slice).get(slice_id)
    
        if not slice_to_update:
            return jsonify({"success": False, "message": f"Slice with ID {slice_id} not found."}), 404
    
        if viz_type == "pie_extend":
            # ✅ Construct new params for pie_extend
            params = {
                "viz_type": "pie",
                "datasource": f"{dataset_id}__table",
                "groupby": groupby,
                "metric": {
                    "label": metric["column"],
                    "expressionType": "SIMPLE",
                    "column": {"column_name": metric["column"]},
                    "aggregate": metric["aggregate"].upper(),
                },
                "row_limit": 1000,
            }
    
            # ✅ Update the slice in place
            slice_to_update.slice_name = "Dynamic Pie Chart"
            slice_to_update.viz_type = "pie_extend"
            slice_to_update.datasource_id = dataset_id
            slice_to_update.params = json.dumps(params)
    
            db.session.commit()
    
            return jsonify({"success": True, "updated_slice_id": slice_id})
    
        return jsonify({"success": False, "message": "Unsupported chart type"})