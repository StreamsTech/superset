from flask import request, jsonify
from flask_appbuilder.api import expose, safe
from superset.views.base_api import BaseSupersetApi
from superset import db, event_logger
from superset.models.slice import Slice
from superset.models.dashboard import Dashboard
import json

class PromptDatasetToPromptTableApi(BaseSupersetApi):
    resource_name = "prompt_dataset_table"  # becomes part of /api/v1/prompt_dataset_table/
    openapi_spec_tag = "Prompt Dataset to Table"
    @event_logger.log_this
    @safe
    @expose("/create_viz", methods=["POST"])
    def create_viz(self):
        data = request.json
        dashboard_id = data["dashboard_id"]
        dataset_id = data["dataset_id"]
        columns = data["columns"]

        new_slice = Slice(
            slice_name="Dynamic Table",
            viz_type="table",
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
    
    @event_logger.log_this
    @safe
    @expose("/create_pie", methods=["POST"])
    def create_pie(self):
        """Creates a pie chart visualization"""
        data = request.json
        dashboard_id = data["dashboard_id"]
        dataset_id = data["dataset_id"]
        groupby = data["groupby"]         # string or list with column names
        metric = data["metric"]           # dict with 'column' and 'aggregate'

        new_slice = Slice(
            slice_name="Dynamic Pie",
            viz_type="pie",
            datasource_type="table",
            datasource_id=dataset_id,
            params=json.dumps({
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
            }),
        )
        db.session.add(new_slice)
        db.session.commit()

        dashboard = db.session.query(Dashboard).get(dashboard_id)
        dashboard.slices.append(new_slice)
        db.session.commit()

        return jsonify({"success": True})
    
    @event_logger.log_this
    @safe
    @expose("/create_bar", methods=["POST"])
    def create_bar(self):
        """Creates a bar chart visualization with multiple metrics (no series/grouping)"""
        data = request.json
        dashboard_id = data["dashboard_id"]
        dataset_id = data["dataset_id"]
        groupby = data["groupby"] 
        x_axis = data["x_axis"]               # categorical column for X-axis
        metrics = data["metrics"]             # list of dicts: [{column: ..., aggregate: ...}, ...]

        # Convert each metric to Superset-compatible format
        metric_objs = [
            {
                "label": metric["column"],
                "expressionType": "SIMPLE",
                "column": {"column_name": metric["column"]},
                "aggregate": metric["aggregate"].upper(),
            }
            for metric in metrics
        ]

        new_slice = Slice(
            slice_name="Dynamic Bar Chart",
            viz_type="echarts_timeseries_bar_extend",
            datasource_type="table",
            datasource_id=dataset_id,
            params=json.dumps({
                "viz_type": "echarts_timeseries_bar_extend",
                "datasource": f"{dataset_id}__table",
                "metrics": metric_objs,
                "groupby": groupby,
                "x_axis": x_axis,
                "columns": [],  # no series
                "row_limit": 1000,
                "show_legend": True,
                "bar_stacked": False,
                "orientation": "vertical",
            }),
        )

        db.session.add(new_slice)
        db.session.commit()

        dashboard = db.session.query(Dashboard).get(dashboard_id)
        dashboard.slices.append(new_slice)
        db.session.commit()

        return jsonify({"success": True})

