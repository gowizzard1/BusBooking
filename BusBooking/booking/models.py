from django.db import models
from custom_user.models import User


BUS_TYPES = (
    ('seater', 'Seater'),
    ('semi-sleeper', 'Semi Sleeper'),
    ('sleeper', 'Sleeper')
)


class Brand(models.Model):

    name = models.CharField(
        max_length=256
    )

    code = models.CharField(
        max_length=256,
        unique=True
    )

    def __str__(self):
        return self.name


class Bus(models.Model):

    brand = models.ForeignKey(
        Brand,
        related_name='busses',
        on_delete=models.CASCADE
    )

    code = models.CharField(
        max_length=256,
        unique=True
    )

    rto_registration_number = models.CharField(
        max_length=256,
        unique=True
    )

    type = models.CharField(
        max_length=128,
        choices=BUS_TYPES
    )

    ac = models.BooleanField(
        default=False
    )

    double_berth = models.BooleanField(
        default=False
    )

    num_rows = models.IntegerField()

    num_lcols = models.IntegerField()

    num_rcols = models.IntegerField()

    rating = models.IntegerField(
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = "Bus"
        verbose_name_plural = "Busses"

    def __str__(self):
        brand_name = self.brand.name
        ac = "AC " if self.ac else ""
        bus_type = self.type
        return brand_name + "(" + ac + bus_type + ")"


class Location(models.Model):

    name = models.CharField(
        max_length=256
    )

    code = models.CharField(
        max_length=256,
        unique=True
    )

    def __str__(self):
        return self.name


class Schedule(models.Model):

    bus = models.ForeignKey(
        Bus,
        related_name='schedules',
        on_delete=models.CASCADE
    )

    from_location = models.ForeignKey(
        Location,
        related_name='from_schedules'
    )

    to_location = models.ForeignKey(
        Location,
        related_name='to_schedules'
    )

    departure_time = models.DateTimeField()

    arrival_time = models.DateTimeField()

    price = models.IntegerField()

    def __str__(self):
        return self.bus.brand.name + " - " + self.from_location.name + " to " + self.to_location.name


class Booking(models.Model):

    schedule = models.ForeignKey(
        Schedule,
        related_name='bookings'
    )

    seats = models.CharField(
        max_length=512
    )

    cancelled = models.BooleanField(
        default=False
    )

    user = models.ForeignKey(
        User,
        related_name='bookings',
        on_delete=models.CASCADE
    )

    rating = models.IntegerField(
        blank=True,
        null=True
    )

    def __str__(self):
        return str(
            self.bus.brand.name + " - " +
            self.from_location.name + " to " +
            self.to_location.name + "(" + self.seats + ")"
        )
