#!/usr/bin/python3

from app.models.base_model import BaseModel

class Review(BaseModel):
    def __init__(self, text, rating, place, user):
        super().__init__()
        self.text = text
        self.rating = rating  # Devrait être validé (1-5)
        self.place = place   # Instance de Place
        self.user = user     # Instance de User

    @staticmethod
    def validate_rating(rating):
        if not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1 and 5")

    def update(self, data):
        new_text = data.get('text', self.text)
        new_rating = data.get('rating', self.rating)
        self.validate_rating(new_text, new_rating)
        super().update(data)

