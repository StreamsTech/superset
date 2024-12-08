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
#
# This file is included in the final Docker image and SHOULD be overridden when
# deploying the image to prod. Settings configured here are intended for use in local
# development environments. Also note that superset_config_docker.py is imported
# as a final step as a means to override "defaults" configured here
#
import logging
import os

from celery.schedules import crontab
from flask_caching.backends.filesystemcache import FileSystemCache
from typing import Any

logger = logging.getLogger()

DATABASE_DIALECT = os.getenv("DATABASE_DIALECT")
DATABASE_USER = os.getenv("DATABASE_USER")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = os.getenv("DATABASE_PORT")
DATABASE_DB = os.getenv("DATABASE_DB")

EXAMPLES_USER = os.getenv("EXAMPLES_USER")
EXAMPLES_PASSWORD = os.getenv("EXAMPLES_PASSWORD")
EXAMPLES_HOST = os.getenv("EXAMPLES_HOST")
EXAMPLES_PORT = os.getenv("EXAMPLES_PORT")
EXAMPLES_DB = os.getenv("EXAMPLES_DB")

# The SQLAlchemy connection string.
SQLALCHEMY_DATABASE_URI = (
    f"{DATABASE_DIALECT}://"
    f"{DATABASE_USER}:{DATABASE_PASSWORD}@"
    f"{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_DB}"
)

SQLALCHEMY_EXAMPLES_URI = (
    f"{DATABASE_DIALECT}://"
    f"{EXAMPLES_USER}:{EXAMPLES_PASSWORD}@"
    f"{EXAMPLES_HOST}:{EXAMPLES_PORT}/{EXAMPLES_DB}"
)

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
REDIS_CELERY_DB = os.getenv("REDIS_CELERY_DB", "0")
REDIS_RESULTS_DB = os.getenv("REDIS_RESULTS_DB", "1")

RESULTS_BACKEND = FileSystemCache("/app/superset_home/sqllab")

CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_KEY_PREFIX": "superset_",
    "CACHE_REDIS_HOST": REDIS_HOST,
    "CACHE_REDIS_PORT": REDIS_PORT,
    "CACHE_REDIS_DB": REDIS_RESULTS_DB,
}
DATA_CACHE_CONFIG = CACHE_CONFIG


class CeleryConfig:
    broker_url = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_CELERY_DB}"
    imports = ("superset.sql_lab", "superset.tasks","superset.tasks.thumbnails")
    result_backend = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_RESULTS_DB}"
    worker_prefetch_multiplier = 10
    task_acks_late = True
    task_annotations = {
        "sql_lab.get_sql_results": {
            "rate_limit": "100/s",
        },
        'email_reports.send': {
            'rate_limit': '1/s',
            'time_limit': 1800,
            'soft_time_limit': 1800,
            'ignore_result': False,
        },
    }
    beat_schedule = {
        "email_reports.schedule_hourly": {
            "task": "email_reports.schedule_hourly",
            "schedule": crontab(minute=1, hour="*"),
        },
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": crontab(minute="*", hour="*"),
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": crontab(minute=10, hour=0),
        },
        "alerts.schedule_check": {
            "task": "alerts.schedule_check",
            "schedule": crontab(minute="*", hour="*"),
        },
    }


CELERY_CONFIG = CeleryConfig

SQLLAB_CTAS_NO_LIMIT = True

#
# Optionally import superset_config_docker.py (which will have been included on
# the PYTHONPATH) in order to allow for local settings to be overridden
#
try:
    import superset_config_docker
    from superset_config_docker import *  # noqa

    logger.info(
        f"Loaded your Docker configuration at " f"[{superset_config_docker.__file__}]"
    )
except ImportError:
    logger.info("Using default Docker config...")


######
#Streamstech Configuration
######
# SESSION_COOKIE_SAMESITE = "None" # Sufficient for Firefox
# SESSION_COOKIE_SECURE = True # Required for Google Chrome (at least from version 84) 
# SESSION_COOKIE_HTTPONLY= False 
#HTTP_HEADERS = {'X-Frame-Options': 'ALLOWALL'} 
# ENABLE_PROXY_FIX= True 
# # Uncomment to setup Public role name, no authentication needed
# AUTH_ROLE_PUBLIC = "Gamma"  Public
# # Will allow user self registration
# AUTH_USER_REGISTRATION = True
PUBLIC_ROLE_LIKE_GAMMA = True 
WTF_CSRF_ENABLED = False
TALISMAN_ENABLED = False
GUEST_ROLE_NAME = "Gamma"
FEATURE_FLAGS = { 
    "EMBEDDED_SUPERSET": True,
    "DASHBOARD_RBAC": True,
    "ENABLE_TEMPLATE_PROCESSING": True,
    "DRILL_TO_DETAIL":True,
    "DRILL_BY":True,
    "DASHBOARD_CROSS_FILTERS": True,
    "DYNAMIC_PLUGINS": True,
    "ENABLE_JAVASCRIPT_CONTROLS": True,
    "ALERT_REPORTS": True,
}

# CORS_OPTIONS = {
#      'supports_credentials': True, 
#      'allow_headers': ['*'], 
#      'resources':['*'], 
#      'origins': ['*']
# }

FAB_ADD_SECURITY_API = True
ENABLE_CORS = True
SECRET_KEY='4IETlIrDFFVmSr2OiKqT3WTsbpWALJBtSMuE2JfKEacp6p9WpBRZ4e49'

HTML_SANITIZATION = True
HTML_SANITIZATION_SCHEMA_EXTENSIONS: dict[str, Any] = {
    "attributes": {
        "*": ["style", "className"],
    },
    "tagNames": ["style"],
}


################################################################
# For report and schedule
################################################################

EMAIL_NOTIFICATIONS = True
# Email configuration
ENABLE_SCHEDULED_EMAIL_REPORTS = True
SMTP_HOST = "smtp.office365.com" # change to your host
SMTP_PORT = 587 # your port, e.g. 587
SMTP_STARTTLS = True
SMTP_SSL_SERVER_AUTH = True # If your using an SMTP server with a valid certificate
SMTP_SSL = False
SMTP_USER = "XXXXXXXX" # use the empty string "" if using an unauthenticated SMTP server
SMTP_PASSWORD = "XXXXXXXX" # use the empty string "" if using an unauthenticated SMTP server
SMTP_MAIL_FROM = "XXXXXXXX" # use the empty string "" if using an unauthenticated SMTP server
EMAIL_REPORTS_SUBJECT_PREFIX = "[Superset] " # optional - overwrites default value in config.py of "[Report] "


ALERT_REPORTS_NOTIFICATION_DRY_RUN = False
SCREENSHOT_LOCATE_WAIT = 1000
SCREENSHOT_LOAD_WAIT = 1600
ENABLE_ALERTS = True
ENABLE_SCHEDULED_EMAIL_REPORTS = True

# WebDriver configuration
# If you use Firefox, you can stick with default values
# If you use Chrome, then add the following WEBDRIVER_TYPE and WEBDRIVER_OPTION_ARGS
WEBDRIVER_TYPE = "chrome"
WEBDRIVER_OPTION_ARGS = [
    "--force-device-scale-factor=2.0",
    "--high-dpi-support=2.0",
    "--headless",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-extensions",
]

# This is for internal use, you can keep http
WEBDRIVER_BASEURL = "http://superset:8088" # When running using docker compose use "http://superset_app:8088'
# This is the link sent to the recipient. Change to your domain, e.g. https://superset.mydomain.com
WEBDRIVER_BASEURL_USER_FRIENDLY = "http://localhost:8088"