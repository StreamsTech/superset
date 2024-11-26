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
from custom_security_manager import CustomSecurityManager
from flask_appbuilder.security.sqla.models import User
from flask_appbuilder.security.manager import AUTH_OAUTH

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

# Set up OAuth
AUTH_TYPE = AUTH_OAUTH
OAUTH_PROVIDERS = [
    {
        'name': 'google',
        'token_key': 'access_token',
        'icon': 'fa-google',
        'remote_app': {
            'client_id': '<your-client-id>',
            'client_secret': '<your-client-secret>',
            'api_base_url': 'https://www.googleapis.com/oauth2/v2/',
            'client_kwargs': {
                'scope': 'email profile',
            },
            'access_token_url': 'https://oauth2.googleapis.com/token',
            'authorize_url': 'https://accounts.google.com/o/oauth2/auth',
        },
    }
]

# Other configurations
AUTH_USER_REGISTRATION = True  # Automatically register users
AUTH_USER_REGISTRATION_ROLE = 'Public'  # Default role for new users

class CeleryConfig:
    broker_url = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_CELERY_DB}"
    imports = ("superset.sql_lab",)
    result_backend = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_RESULTS_DB}"
    worker_prefetch_multiplier = 1
    task_acks_late = False
    beat_schedule = {
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": crontab(minute="*", hour="*"),
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": crontab(minute=10, hour=0),
        },
    }

CUSTOM_SECURITY_MANAGER = CustomSecurityManager
CELERY_CONFIG = CeleryConfig
DEBUG = True

FEATURE_FLAGS = {"ALERT_REPORTS": True}
ALERT_REPORTS_NOTIFICATION_DRY_RUN = True
WEBDRIVER_BASEURL = "http://superset:8088/"
# The base URL for the email report hyperlinks.
WEBDRIVER_BASEURL_USER_FRIENDLY = WEBDRIVER_BASEURL

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



# Custom welcome message or HTML to add above the login form
APP_EXTRA_HTML = """
<div style="text-align: center; margin-bottom: 20px;">
    <h2>Welcome to My Superset</h2>
    <p>Please log in to access analytics</p>
</div>
"""


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
    "ENABLE_JAVASCRIPT_CONTROLS": True
}
# CORS_OPTIONS = {
#      'supports_credentials': True, 
#      'allow_headers': ['*'], 
#      'resources':['*'], 
#      'origins': ['*']
# }

# Path to custom templates
FAB_TEMPLATE_FOLDER = "/app/superset/templates"

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

