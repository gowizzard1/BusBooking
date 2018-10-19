from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


class EmailBackend(ModelBackend):
    def authenticate(self, username=None, password=None, **kwargs):
        user_model = get_user_model()
        # Login with email
        if '@' in username:
            username_args = {'email': username}
        # Login with username
        else:
            username_args = {'username': username}
        try:
            user = user_model.objects.get(**username_args)
        except user_model.DoesNotExist:
            return None
        else:
            if user.check_password(password):
                return user
        return None
