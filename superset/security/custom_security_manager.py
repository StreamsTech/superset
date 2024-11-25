# custom_security_manager.py
from superset.security.manager import SupersetSecurityManager
from flask_appbuilder.security.sqla.models import User

class CustomSecurityManager(SupersetSecurityManager):
    def get_user_query(self):
        user = self.get_user()
        return self.get_session.query(User).filter(User.created_by_fk == user.id)

    def get_users(self):
        return self.get_user_query().all()