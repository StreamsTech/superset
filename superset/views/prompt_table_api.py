from flask import request, jsonify
from flask_appbuilder import expose
from superset.views.base import api, BaseSupersetView, handle_api_exception
from superset import db, event_logger
from flask_appbuilder.security.decorators import has_access_api
from superset.models.slice import Slice
from superset.models.dashboard import Dashboard
import json

class PromptTableApi(BaseSupersetView):
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
    
        if viz_type == "pie":
            params = {
                "viz_type": "pie",
                "datasource": f"{dataset_id}__table",
                "groupby": groupby,
                "metric": {
                    "label": metric["column"],
                    "expressionType": "SIMPLE",
                    "column": {"column_name": metric["column"]},
                    "aggregate": metric["aggregate"],
                },
                "row_limit": 1000,
            }
        else:
            # fallback to table
            params = {
                "viz_type": "table",
                "datasource": f"{dataset_id}__table",
                "all_columns": groupby + [metric["column"]],
                "row_limit": 1000,
            }
    
        new_slice = Slice(
            slice_name=f"Dynamic {viz_type.title()} Chart",
            viz_type=viz_type,
            datasource_type="table",
            datasource_id=dataset_id,
            params=json.dumps(params),
        )
        db.session.add(new_slice)
        db.session.commit()
    
        dashboard = db.session.query(Dashboard).get(dashboard_id)
        dashboard.slices.append(new_slice)
        db.session.commit()
    
        return jsonify({"success": True})
