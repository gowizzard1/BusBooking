import datetime
# from django.db import connection, reset_queries
from django.db.models import prefetch_related_objects
from django.shortcuts import render
from rest_framework import (
    generics,
    status
)
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import (
    Location,
    Schedule
)
from .serializers import (
    LocationSerializer,
    ScheduleSerializer
)
from .utils import (
    parse_date
)


def index(request):
    return render(request, 'booking/search_results.html')


class LocationListAPIView(generics.ListAPIView):
    serializer_class = LocationSerializer
    queryset = Location.objects.all()


# Generics not used here as post does not create an object
# Hence using generics may be against the standards
class ScheduleSearchAPIView(APIView):

    def validate(self, request_data):
        if (
            'from_location' not in request_data or
            not request_data['from_location'] or
            'to_location' not in request_data or
            not request_data['to_location'] or
            'onward_date' not in request_data or
            not request_data['onward_date']
        ):
            return (
                False,
                Response(
                    "Invalid Request. Please ensure from_location, to_location " +
                    "and onward_date are present in the request",
                    status=status.HTTP_400_BAD_REQUEST
                )
            )

        field_error_dict = {}
        request_locations_available = Location.objects.filter(
            name__in=[request_data['from_location'], request_data['to_location']]
        ).values_list('name', flat=True)

        if request_data['from_location'] not in request_locations_available:
            field_error_dict['from_location'] = "From location not found"
        if request_data['to_location'] not in request_locations_available:
            field_error_dict['to_location'] = "To location not found"
        if request_data['to_location'] == request_data['from_location']:
            field_error_dict['to_location'] = "To location cannot be same as From location"
        if parse_date(request_data['onward_date']) < datetime.datetime.now().date():
            field_error_dict['onward_date'] = "Onward date cannot be Past"
        if 'return_date' in request_data and request_data['return_date']:
            if parse_date(request_data['return_date']) < datetime.datetime.now().date():
                field_error_dict['return_date'] = "Return date cannot be Past"
            elif parse_date(request_data['return_date']) < parse_date(request_data['onward_date']):
                field_error_dict['return_date'] = "Return date cannot be before onward date"
        if field_error_dict:
            status_code = status.HTTP_404_NOT_FOUND
            if "onward_date" in field_error_dict or "return_date" in field_error_dict:
                status_code = status.HTTP_400_BAD_REQUEST
            return (
                False,
                Response(
                    field_error_dict,
                    status=status_code
                )
            )
        return (True, "")

    def post(self, request, format=None):
        # reset_queries()
        request_data = request.data
        validated, error_response = self.validate(request_data)
        if not validated:
            return error_response
        # Retrieve journey start date schedule list
        filter_dict_onward = {
            'from_location__name': request_data['from_location'],
            'to_location__name': request_data['to_location'],
            'departure_time__contains': parse_date(request_data['onward_date'])
        }
        schedules_onward_objects = Schedule.objects.filter(**filter_dict_onward)
        prefetch_related_objects(schedules_onward_objects, 'from_location', 'to_location', 'bus', 'bus__brand')
        schedules_onward_data = ScheduleSerializer(schedules_onward_objects, many=True).data
        result = {
            'schedules_onward': schedules_onward_data,
            'schedules_return': []
        }

        # Retrieve journey end date schedule list if return date is present
        if request_data.get('return_date', None):
            filter_dict_return = {
                'from_location__name': request_data['to_location'],
                'to_location__name': request_data['from_location'],
                'arrival_time__contains': parse_date(request_data['return_date'])
            }
            schedules_return_objects = Schedule.objects.filter(**filter_dict_return)
            prefetch_related_objects(schedules_return_objects, 'from_location', 'to_location', 'bus', 'bus__brand')
            schedules_return_data = ScheduleSerializer(schedules_return_objects, many=True).data
            result['schedules_return'] = schedules_return_data
        # print(len(connection.queries))

        return Response(result)
