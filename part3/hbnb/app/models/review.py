from app.models.base_model import BaseModel
from app import db


class Review(BaseModel):
    __tablename__ = 'reviews'

    text = db.Column(db.String(1024), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    place_id = db.Column(db.String(36), db.ForeignKey('places.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    # Relations
    place = db.relationship('Place', back_populates='reviews')
    user = db.relationship('User', back_populates='reviews')


    def __init__(self, text, rating, place, user):
        super().__init__()
        if not text or not str(text).strip():
            raise ValueError("'text' is required and cannot be empty")
        self.validate_rating(rating)
        self.text = text
        self.rating = rating  # Devrait être validé (1-5)
        self.place = place   # Instance de Place
        self.user = user     # Instance de User

    @staticmethod
    def validate_rating(rating):
        if not isinstance(rating, int) or not (1 <= rating <= 5):
            raise ValueError("Rating must be an integer between 1 and 5")

    def update(self, data):
        if 'text' in data:
            if not data['text'] or not str(data['text']).strip():
                raise ValueError("'text' is required and cannot be empty")
        if 'rating' in data:
            self.validate_rating(data['rating'])
        super().update(data)
