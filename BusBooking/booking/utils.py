import datetime


def parse_date(date):
    if date:
        date = str(date)
        return datetime.datetime.strptime(date, "%d/%m/%Y").date()
    return date
