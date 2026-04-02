from app.persistence.repository import SQLAlchemyRepository, UserRepository


class HBnBFacade:
    def __init__(self):
        self._user_repo_instance = None
        self._amenity_repo_instance = None
        self._place_repo_instance = None
        self._review_repo_instance = None

    # ------------------------------------------------------------------ #
    #  Lazy repo properties
    # ------------------------------------------------------------------ #

    @property
    def user_repo(self):
        if self._user_repo_instance is None:
            self._user_repo_instance = UserRepository()
        return self._user_repo_instance

    @user_repo.setter
    def user_repo(self, value):
        self._user_repo_instance = value

    @property
    def amenity_repo(self):
        if self._amenity_repo_instance is None:
            from app.models.amenity import Amenity
            self._amenity_repo_instance = SQLAlchemyRepository(Amenity)
        return self._amenity_repo_instance

    @amenity_repo.setter
    def amenity_repo(self, value):
        self._amenity_repo_instance = value

    @property
    def place_repo(self):
        if self._place_repo_instance is None:
            from app.models.place import Place
            self._place_repo_instance = SQLAlchemyRepository(Place)
        return self._place_repo_instance

    @place_repo.setter
    def place_repo(self, value):
        self._place_repo_instance = value

    @property
    def review_repo(self):
        if self._review_repo_instance is None:
            from app.models.review import Review
            self._review_repo_instance = SQLAlchemyRepository(Review)
        return self._review_repo_instance

    @review_repo.setter
    def review_repo(self, value):
        self._review_repo_instance = value

    # ------------------------------------------------------------------ #
    #  Users
    # ------------------------------------------------------------------ #

    def create_user(self, user_data):
        """Crée un utilisateur — le password est hashé dans le modèle User."""
        from app.models.user import User
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_by_email(email)

    def get_all_users(self):
        return self.user_repo.get_all()

    def update_user(self, user_id, user_data):
        user = self.user_repo.get(user_id)
        if not user:
            return None

        if "email" in user_data and user_data['email'] != user.email:
            if self.get_user_by_email(user_data['email']):
                raise ValueError("Email already registered")

        # Si un nouveau password est fourni, le hacher via la méthode du modèle
        if "password" in user_data:
            user.hash_password(user_data.pop("password"))
            from app import db
            db.session.commit()

        if user_data:
            self.user_repo.update(user_id, user_data)

        return self.user_repo.get(user_id)

    # ------------------------------------------------------------------ #
    #  Amenities
    # ------------------------------------------------------------------ #

    def create_amenity(self, amenity_data):
        from app.models.amenity import Amenity
        amenity = Amenity(**amenity_data)
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def get_amenity_by_name(self, name):
        return self.amenity_repo.get_by_attribute('name', name)

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            return None

        if 'name' in amenity_data:
            existing = self.get_amenity_by_name(amenity_data['name'])
            if existing and existing.id != amenity_id:
                raise ValueError("Amenity already registered")

        self.amenity_repo.update(amenity_id, amenity_data)
        return self.amenity_repo.get(amenity_id)

    # ------------------------------------------------------------------ #
    #  Places
    # ------------------------------------------------------------------ #

    def create_place(self, place_data):
        owner = self.user_repo.get(place_data['owner_id'])
        if not owner:
            raise ValueError("Owner not found")

        if not place_data.get('title'):
            raise ValueError("Title is required")

        amenity_ids = place_data.pop('amenities', [])

        from app.models.place import Place
        new_place = Place(
            title=place_data['title'],
            description=place_data.get('description', ""),
            price=place_data['price'],
            latitude=place_data['latitude'],
            longitude=place_data['longitude'],
            city=place_data.get('city', ''),
            country=place_data.get('country', 'France'),
            max_guests=place_data.get('max_guests', 1),
            owner=owner
        )

        for amenity_id in amenity_ids:
            amenity = self.amenity_repo.get(amenity_id)
            if amenity:
                new_place.add_amenity(amenity)

        self.place_repo.add(new_place)
        return new_place

    def get_place(self, place_id):
        return self.place_repo.get(place_id)

    def get_all_places(self):
        return self.place_repo.get_all()

    def update_place(self, place_id, place_data):
        place = self.place_repo.get(place_id)
        if not place:
            return None

        amenities_ids = place_data.pop('amenities', None)

        allowed_fields = {
            'title', 'description', 'price', 'latitude', 'longitude',
            'city', 'country', 'max_guests'
        }
        filtered_data = {key: value for key, value in place_data.items() if key in allowed_fields}

        place.update(filtered_data)

        if amenities_ids is not None:
            place.amenities = []
            for amenity_id in amenities_ids:
                amenity = self.amenity_repo.get(amenity_id)
                if amenity:
                    place.add_amenity(amenity)

        from app import db
        db.session.commit()

        return self.place_repo.get(place_id)

    def delete_place(self, place_id):
        return self.place_repo.delete(place_id)

    # ------------------------------------------------------------------ #
    #  Reviews
    # ------------------------------------------------------------------ #

    def create_review(self, review_data):
        user = self.get_user(review_data['user_id'])
        place = self.get_place(review_data['place_id'])

        if not user:
            raise ValueError("User not found")
        if not place:
            raise ValueError("Place not found")

        from app.models.review import Review
        new_review = Review(
            text=review_data['text'],
            rating=review_data['rating'],
            place=place,
            user=user
        )
        self.review_repo.add(new_review)
        return new_review

    def get_review(self, review_id):
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        """Requête SQL directe — plus efficace qu'une boucle Python."""
        from app.models.review import Review
        return Review.query.filter_by(place_id=place_id).all()

    def get_review_by_user_and_place(self, user_id, place_id):
        """Requête SQL directe sur les deux foreign keys."""
        from app.models.review import Review
        return Review.query.filter_by(
            user_id=user_id,
            place_id=place_id
        ).first()

    def update_review(self, review_id, review_data):
        review = self.review_repo.get(review_id)
        if not review:
            return None

        allowed_fields = {'text', 'rating'}
        filtered_data = {key: value for key, value in review_data.items() if key in allowed_fields}

        review.update(filtered_data)

        from app import db
        db.session.commit()

        return self.review_repo.get(review_id)

    def delete_review(self, review_id):
        return self.review_repo.delete(review_id)
