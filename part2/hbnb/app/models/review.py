#!/usr/bin/python3

from app.models.base_model import BaseModel

class Review(BaseModel):
    def __init__(self, text, rating, place, user):
        super().__init__()
        self.text = text
        self.rating = rating  # Devrait être validé (1-5)
        self.place = place   # Instance de Place
        self.user = user     # Instance de User
