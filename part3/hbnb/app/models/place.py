from app.models.base_model import BaseModel
from app import db

# Table d'association many-to-many entre Place et Amenity
place_amenity = db.Table(
    'place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'), primary_key=True)
)


class Place(BaseModel):
    __tablename__ = 'places'

    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(1024), nullable=False, default='')
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    city = db.Column(db.String(100), nullable=False, default='')
    country = db.Column(db.String(100), nullable=False, default='France')
    max_guests = db.Column(db.Integer, nullable=False, default=1)

    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    # Relations
    owner = db.relationship(
        'User',
        back_populates='places',
        lazy='select'
    )
    reviews = db.relationship(
        'Review',
        back_populates='place',
        cascade='all, delete-orphan',
        lazy='select'
    )
    amenities = db.relationship(
        'Amenity',
        secondary=place_amenity,
        lazy='subquery',
        backref=db.backref('places', lazy=True)
    )

    def __init__(
        self,
        title,
        description,
        price,
        latitude,
        longitude,
        owner,
        city='',
        country='France',
        max_guests=1
    ):
        self._validate_title(title)
        self.validate_place_data(price, latitude, longitude, max_guests)
        self._validate_location(city, country)

        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.city = city
        self.country = country
        self.max_guests = max_guests
        self.owner = owner

    @staticmethod
    def _validate_title(title):
        if not title or not str(title).strip():
            raise ValueError("'title' is required and cannot be empty")
        if len(str(title)) > 100:
            raise ValueError("'title' must not exceed 100 characters")

    @staticmethod
    def _validate_location(city, country):
        if city is not None and len(str(city)) > 100:
            raise ValueError("'city' must not exceed 100 characters")
        if country is not None and len(str(country)) > 100:
            raise ValueError("'country' must not exceed 100 characters")

    @staticmethod
    def validate_place_data(price, latitude, longitude, max_guests=1):
        if price <= 0:
            raise ValueError("Price must be a positive value.")
        if not (-90.0 <= latitude <= 90.0):
            raise ValueError("Latitude must be between -90.0 and 90.0.")
        if not (-180.0 <= longitude <= 180.0):
            raise ValueError("Longitude must be between -180.0 and 180.0.")
        if int(max_guests) <= 0:
            raise ValueError("max_guests must be a positive integer.")

    def update(self, data):
        new_title = data.get('title', self.title)
        new_price = data.get('price', self.price)
        new_lat = data.get('latitude', self.latitude)
        new_long = data.get('longitude', self.longitude)
        new_city = data.get('city', self.city)
        new_country = data.get('country', self.country)
        new_max_guests = data.get('max_guests', self.max_guests)

        self._validate_title(new_title)
        self._validate_location(new_city, new_country)
        self.validate_place_data(new_price, new_lat, new_long, new_max_guests)

        super().update(data)

    def add_amenity(self, amenity):
        if amenity not in self.amenities:
            self.amenities.append(amenity)

    def add_review(self, review):
        if review not in self.reviews:
            self.reviews.append(review)