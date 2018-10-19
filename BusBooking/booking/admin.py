from django.contrib import admin
from .models import (
    Brand,
    Bus,
    Location,
    Schedule,
    Booking
)


class BusInline(admin.StackedInline):
    model = Bus
    extra = 1


class BrandAdmin(admin.ModelAdmin):
    fields = ['name', 'code']
    inlines = [BusInline]


admin.site.register(Brand, BrandAdmin)
admin.site.register(Bus)
admin.site.register(Location)
admin.site.register(Schedule)
admin.site.register(Booking)
