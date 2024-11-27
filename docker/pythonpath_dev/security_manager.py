from flask import redirect, request
from flask_appbuilder.security.manager import AUTH_OID
from superset.security import SupersetSecurityManager
from flask_oidc import OpenIDConnect
from flask_appbuilder.security.views import AuthOIDView
from flask_login import login_user
from urllib.parse import quote
from flask_appbuilder.views import ModelView, SimpleFormView, expose
import logging
import urllib.parse

class OIDCSecurityManager(SupersetSecurityManager):

    def __init__(self, appbuilder):
        super(OIDCSecurityManager, self).__init__(appbuilder)
        if self.auth_type == AUTH_OID:
            self.oid = OpenIDConnect(self.appbuilder.get_app)
        self.authoidview = AuthOIDCView

class AuthOIDCView(AuthOIDView):

    @expose('/login/', methods=['GET', 'POST'])
    def login(self, flag=True):
        sm = self.appbuilder.sm
        oidc = sm.oid

        @self.appbuilder.sm.oid.require_login
        def handle_login():
            user = sm.auth_user_oid(oidc.user_getfield('email'))
            #  { 'name' : me['name'], 'email' : me['email'], 'id' : me['UserId'], 'username' : me['preferred_username']}
            if user is None:
                info = oidc.user_getinfo(['preferred_username', 'name', 'UserId', 'email'])
                user = sm.add_user(info.get('preferred_username'), info.get('name'), info.get('UserId'),
                                   info.get('email'), sm.find_role('Gamma'))

            login_user(user, remember=False)
            return redirect(self.appbuilder.get_url_for_index)

        return handle_login()

    @expose('/logout/', methods=['GET', 'POST'])
    def logout(self):
        oidc = self.appbuilder.sm.oid

        oidc.logout()
        super(AuthOIDCView, self).logout()
        redirect_url = urllib.parse.quote_plus(request.url_root.strip('/') + self.appbuilder.get_url_for_login)
        # https://nightly.binsight-idp.streamstech.com/connect/logout?request_id=oTqQWf1EaWU9KVUtOFyzSwI4bYV-xk5gnnCuMLfqq4U
        # +'&post_logout_redirect_uri=' + quote(redirect_url)
        return redirect(
            oidc.client_secrets.get('issuer') + '/connect/logout?request_id='+ oidc.client_secrets.get('request_id'))