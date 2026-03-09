from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

api = Namespace('reviews', description='Review operations')

review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})


def marshal_review(review):
    """Sérialise un objet Review en dict JSON."""
    return {
        "id": review.id,
        "text": review.text,
        "rating": review.rating,
        "user_id": review.user.id,
        "place_id": review.place.id
    }

def validate_review_payload(data):
    if not data:
        return "Payload is empty"
    if not data.get('text') or not str(data['text']).strip():
        return "'text' is required and cannot be empty"
    if data.get('rating') is None:
        return "'rating' is required"
    rating = data['rating']
    if not isinstance(rating, int) or not (1 <= rating <= 5):
        return "Rating must be an integer between 1 and 5"
    return None


@api.route('/')
class ReviewList(Resource):
    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        return [marshal_review(r) for r in facade.get_all_reviews()], 200

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(401, 'Authentication required')
    @api.response(403, 'Unauthorized action')
    def post(self):
        """Register a new review"""
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        data = api.payload

        error = validate_review_payload(data)
        if error:
            return {"error": error}, 400

        # user_id doit correspondre à l'utilisateur connecté (sauf admin)
        if data.get('user_id') != current_user_id and not claims.get('is_admin', False):
            return {'error': 'Unauthorized action — user_id must match your user ID'}, 403

        try:
            new_review = facade.create_review(data)
            return marshal_review(new_review), 201
        except ValueError as e:
            return {"error": str(e)}, 400


@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if not review:
            api.abort(404, "Review not found")
        return marshal_review(review), 200

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(400, 'Invalid input data')
    @api.response(401, 'Authentication required')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    def put(self, review_id):
        """Update a review's information"""
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        review = facade.get_review(review_id)
        if not review:
            api.abort(404, "Review not found")

        if review.user.id != current_user_id and not claims.get('is_admin', False):
            return {'error': 'Unauthorized action'}, 403

        data = api.payload
        error = validate_review_payload(data)
        if error:
            return {"error": error}, 400

        try:
            updated_review = facade.update_review(review_id, data)
        except ValueError as e:
            return {"error": str(e)}, 400
        if not updated_review:
            api.abort(404, "Review not found")
        return marshal_review(updated_review), 200

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.response(200, 'Review deleted successfully')
    @api.response(401, 'Authentication required')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    def delete(self, review_id):
        """Delete a review — only the author or admin"""
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        review = facade.get_review(review_id)
        if not review:
            api.abort(404, "Review not found")

        if review.user.id != current_user_id and not claims.get('is_admin', False):
            return {'error': 'Unauthorized action'}, 403

        facade.delete_review(review_id)
        return {"message": f"Review {review_id} deleted"}, 200
