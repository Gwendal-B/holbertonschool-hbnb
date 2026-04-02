from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('auth', description='Authentication operations')

# Model for input validation
login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})


""" Code fournis de base:
@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        ""Authenticate user and return a JWT token""
        # Get the email and password from the request payload
        credentials = api.payload

        # Step 1: Retrieve the user based on the provided email
        user = facade.get_user_by_email(credentials['email'])

        # Step 2: Check if the user exists and the password is correct
        if not user or not user.verify_password(credentials['password']):
            return {'error': 'Invalid credentials'}, 401

        # Step 3: Create a JWT token with the user's id and is_admin flag
        access_token = create_access_token(
            identity=str(user.id),   # only user ID goes here
            additional_claims={"is_admin": user.is_admin}  # extra info here
        )

        # Step 4: Return the JWT token to the client
        return {'access_token': access_token}, 200 """


@api.route('/login')
class Login(Resource):
    "Notre version du code afin d'avoir 148/148 a nos propre test"
    @api.expect(login_model)
    def post(self):
        """Authenticate user and return a JWT token"""
        credentials = api.payload or {}

        # Validation des champs requis
        email    = credentials.get('email')
        password = credentials.get('password')

        if not email or not password:
            return {'error': 'email and password are required'}, 400

        # Récupération et vérification
        user = facade.get_user_by_email(email)
        if not user or not user.verify_password(password):
            return {'error': 'Invalid credentials'}, 401

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"is_admin": user.is_admin}
        )
        return {'access_token': access_token}, 200

@api.route('/<review_id>')
class ReviewResource(Resource):
    @jwt_required()
    @api.response(200, 'Review deleted successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    def delete(self, review_id):
        current_user_id = get_jwt_identity()
        claims = get_jwt()

        review = facade.get_review(review_id)
        if not review:
            api.abort(404, "Review not found")

        if review.user.id != current_user_id and not claims.get('is_admin', False):
            return {'error': 'Unauthorized action'}, 403

        facade.delete_review(review_id)
        return {'message': f'Review {review_id} deleted'}, 200
