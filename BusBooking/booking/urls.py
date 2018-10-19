from django.conf.urls import url
from .views import (
    index,
    LocationListAPIView,
    ScheduleSearchAPIView
)

urlpatterns = [
    url(r'^$', index, name='index'),
    url(r'^api/locations/$', LocationListAPIView.as_view(), name='locations'),
    url(r'^api/schedules/$', ScheduleSearchAPIView.as_view(), name='locations')
]
