from django.db import models
from django.contrib.auth.models import AbstractUser as DefaultUser
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def mobile_number_validator(value):
    if value < 1000000000 or value > 9999999999:
        raise ValidationError(
            _('%(value)s not a valid phone number'),
            params={'value': value},
        )


class User(DefaultUser):

    # Add mobile number to user.
    mobile = models.IntegerField(
        blank=True,
        null=True,
        # Only 10 digit integers allowed
        validators=[
            mobile_number_validator,
        ]
    )
