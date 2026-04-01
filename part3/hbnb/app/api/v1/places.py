from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

api = Namespace('places', description='Place operations')

amenity_model = api.model('PlaceAmenity', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(description='Name of the amenity')
})

user_model = api.model('PlaceUser', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name of the owner'),
    'last_name': fields.String(description='Last name of the owner'),
    'email': fields.String(description='Email of the owner')
})

place_model = api.model('Place', {
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'city': fields.String(required=True, description='City of the place'),
    'country': fields.String(required=True, description='Country of the place'),
    'max_guests': fields.Integer(required=True, description='Maximum number of guests'),
    'owner_id': fields.String(required=True, description='ID of the owner'),
    'amenities': fields.List(fields.String, required=True, description="List of amenities IDs")
})

place_update_model = api.model('PlaceUpdate', {
    'title': fields.String(description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(description='Price per night'),
    'latitude': fields.Float(description='Latitude of the place'),
    'longitude': fields.Float(description='Longitude of the place'),
    'city': fields.String(description='City of the place'),
    'country': fields.String(description='Country of the place'),
    'max_guests': fields.Integer(description='Maximum number of guests'),
    'amenities': fields.List(fields.String, description='List of amenity IDs')
})


def marshal_place(place):
    return {
        "id": place.id,
        "title": place.title,
        "description": place.description,
        "price": place.price,
        "latitude": place.latitude,
        "longitude": place.longitude,
        "city": place.city,
        "country": place.country,
        "max_guests": place.max_guests,
        "owner": {
            "id": place.owner.id,
            "first_name": place.owner.first_name,
            "last_name": place.owner.last_name,
            "email": place.owner.email
        },
        "amenities": [{"id": a.id, "name": a.name} for a in place.amenities],
        "reviews": [
            {
                "id": r.id,
                "text": r.text,
                "rating": r.rating,
                "user_id": r.user.id,
                "user_name": f"{r.user.first_name} {r.user.last_name}"
            }
            for r in place.reviews
        ]
    }


@api.route('/')
class PlaceList(Resource):
    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        return [marshal_place(p) for p in facade.get_all_places()], 200

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.expect(place_model)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(401, 'Authentication required')
    @api.response(403, 'Unauthorized action')
    def post(self):
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        data = api.payload

        if data.get('owner_id') != current_user_id and not claims.get('is_admin', False):
            return {'error': 'Unauthorized action — owner_id must match your user ID'}, 403

        try:
            new_place = facade.create_place(api.payload)
            return marshal_place(new_place), 201
        except ValueError as e:
            return {"error": str(e)}, 400


@api.route('/<place_id>')
class PlaceResource(Resource):
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")
        return marshal_place(place), 200

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.expect(place_update_model)
    @api.response(200, 'Place updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(401, 'Authentication required')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Place not found')
    def put(self, place_id):
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")

        if place.owner.id != current_user_id and not claims.get('is_admin', False):
            return {'error': 'Unauthorized action'}, 403

        allowed_fields = {
            'title', 'description', 'price', 'latitude', 'longitude',
            'city', 'country', 'max_guests', 'amenities'
        }
        data = {key: value for key, value in api.payload.items() if key in allowed_fields}

        try:
            updated_place = facade.update_place(place_id, data)
        except ValueError as e:
            return {"error": str(e)}, 400

        if not updated_place:
            api.abort(404, "Place not found")

        return marshal_place(updated_place), 200

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.response(200, 'Place deleted successfully')
    @api.response(401, 'Authentication required')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Place not found')
    def delete(self, place_id):
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        place = facade.get_place(place_id)
        if not place:
            api.abort(404, "Place not found")

        if place.owner.id != current_user_id and not claims.get('is_admin', False):
            return {'error': 'Unauthorized action'}, 403

        facade.delete_place(place_id)
        return {"message": f"Place {place_id} deleted"}, 200


@api.route('/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        if not facade.get_place(place_id):
            api.abort(404, "Place not found")
        reviews = facade.get_reviews_by_place(place_id)
        return [{
            "id": r.id,
            "text": r.text,
            "rating": r.rating,
            "user_id": r.user.id,
            "place_id": r.place.id
        } for r in reviews], 200