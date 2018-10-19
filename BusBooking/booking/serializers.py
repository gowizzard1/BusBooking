from .models import (
    Location,
    Brand,
    Bus,
    Schedule
)
from rest_framework import serializers


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = ('id', 'name', 'code')


class BrandSerializer(serializers.ModelSerializer):

    class Meta:
        model = Brand
        fields = ("id", "name", "code")


class BusSerializer(serializers.ModelSerializer):

    brand = BrandSerializer()

    class Meta:
        model = Bus
        fields = (
            'id', 'brand', 'code', 'rto_registration_number', 'type', 'ac',
            'double_berth', 'num_rows', 'num_lcols', 'num_rcols', 'rating'
        )


class ScheduleSerializer(serializers.ModelSerializer):

    bus = BusSerializer()
    from_location = LocationSerializer()
    to_location = LocationSerializer()

    class Meta:
        model = Schedule
        fields = (
            'id', 'bus', 'from_location', 'to_location',
            'departure_time', 'arrival_time', 'price'
        )
