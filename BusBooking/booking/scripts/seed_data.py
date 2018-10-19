import random
import datetime
from custom_user.models import User
from booking.models import (
    Brand,
    Location,
    Bus,
    Schedule,
    BUS_TYPES
)


locations = [
    # Andra-Pradesh
    "Tirupati",
    "Anantapur",
    "Chittoor",
    "Hindupur",
    # Karnataka
    "Bangalore",
    "Mangalore",
    "Mysore",
    "Tumkur",
    # Goa
    "Mapusa",
    "Panaji",
    "Ponda",
    "Bicholim",
    # Kerala
    "Cochin",
    "Calicut",
    "Munnar",
    "Wayanad",
    # Tamil Nadu
    "Chennai",
    "Coimbatore",
    "Vellore",
    "Krishnagiri",
    # Dummy location for empty result testing
    "DummyLocation"
]


brands = [
    "Asian Xpress",
    "Dream Liner Travels",
    "Evacay Bus",
    "National travels",
    "Parveen Travels",
    "SMA Travels",
    "Jabbar Travels",
    "KGN Travels",
    "Lemon Travels",
    "Orange Tours & Travels",
    "YBM Travels",
    "Hebron Transports",
    "Orange Tours And Travels",
    "RKK Travels",
    "Royal Travels",
    "GreenLine Travels And Holidays"
]


def random_date(start, end):
    """Generate a random datetime between `start` and `end`"""
    return start + datetime.timedelta(
        # Get a random amount of seconds between `start` and `end`
        seconds=random.randint(0, int((end - start).total_seconds()))
    )


def run():
    promt_delete_all_data = input("All previous buses data will be deleted. Continue [y/n]? ")
    if not promt_delete_all_data:
        print("Aborted")
        return
    print("Deleting Existing Objects")
    Brand.objects.all().delete()
    Location.objects.all().delete()
    Bus.objects.all().delete()
    print("Existing Objects Deleted")

    print("Creating Seed Data")
    global locations, brands

    print("Creating Locations")
    location_objects = []
    for location in locations:
        name = location
        code = ''.join(x.lower() for x in location)
        location_objects.append(
            Location(
                name=name,
                code=code
            )
        )
    # Bulk create all locations at once.
    Location.objects.bulk_create(location_objects)

    # Create Brands
    print("Creating Brands")
    brand_objects = []
    for brand in brands:
        name = brand
        code = ''.join(x.lower() for x in name if x.isalnum())
        brand_objects.append(
            Brand(
                name=name,
                code=code
            )
        )
    # Bulk create all brands at once.
    Brand.objects.bulk_create(brand_objects)

    # Create Busses
    print("Creating Busses")
    brands = Brand.objects.all()
    bus_number_states = ['AP', 'GA', 'KA', 'KL', 'TN']
    bus_number_alpha_series = ['HK', 'JC', 'MN']
    bus_objects = []
    for i in range(100):
        brand = random.choice(brands)
        code = brand.code + "_bus_" + str(i)
        # Generate Bus Number.
        rto_registration_number = str(
            random.choice(bus_number_states) + " " +
            "0" + str(random.randint(1, 9)) + " " +
            random.choice(bus_number_alpha_series) + " " +
            str(random.randint(2045, 9087))
        )
        bus_type = random.choice(BUS_TYPES)[0]
        ac = random.choice([True, False])
        double_berth = True if bus_type == 'sleeper' else False
        num_rows = random.choice([6, 8, 12]) if bus_type != 'sleeper' else 4
        num_lcols = 2
        num_rcols = 2
        rating = random.randint(1, 5)
        bus_objects.append(
            Bus(
                brand=brand,
                code=code,
                rto_registration_number=rto_registration_number,
                type=bus_type,
                ac=ac,
                double_berth=double_berth,
                num_rows=num_rows,
                num_lcols=num_lcols,
                num_rcols=num_rcols,
                rating=rating
            )
        )
    # Bulk create all buses at once.
    Bus.objects.bulk_create(bus_objects)

    # Create Schedules
    print("Creating Schedules")
    # Bulk create does not return object DB ids, hence retrievel is needed.
    locations = Location.objects.all()
    busses = Bus.objects.all()
    schedule_objects = []
    for i in range(10000):
        bus = random.choice(busses)
        from_location = random.choice(locations)
        to_location = random.choice(list(filter(lambda x: x != from_location, locations)))
        today = datetime.datetime.now().replace(tzinfo=datetime.timezone.utc)
        ten_days_from_now = today + datetime.timedelta(hours=240)
        departure_time = random_date(today, ten_days_from_now)
        # Extra 10 hours for arrival time so the there is more room for choice
        # in case departure time is close to upper limit.
        arrival_time = random_date(departure_time, ten_days_from_now + datetime.timedelta(hours=10))
        price = random.randint(1100, 6000)
        schedule_objects.append(
            Schedule(
                bus=bus,
                from_location=from_location,
                to_location=to_location,
                departure_time=departure_time,
                arrival_time=arrival_time,
                price=price
            )
        )
        # Create 200 objects at a time to avoid DB choking.
        if(i % 200 == 0):
            Schedule.objects.bulk_create(schedule_objects)
            schedule_objects = []
    Schedule.objects.bulk_create(schedule_objects)
    # DummyLocation for empty schedule test case
    Schedule.objects.filter(from_location__name="DummyLocation").delete()
    Schedule.objects.filter(to_location__name="DummyLocation").delete()
    print("Data Seed Completed")

    # Create Superuser delete if already present.
    prompt_create_superuser = input(
        "Creating superuser with username `admin` and password `changeme`. "
        "If a username `admin` already exists, it will be deleted. Continue [y/n]? "
    )
    if prompt_create_superuser:
        User.objects.filter(username="admin").delete()
        User.objects.create_superuser(username='admin', password='changeme', email='admin@example.com')
