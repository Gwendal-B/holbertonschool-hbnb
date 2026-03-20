import re
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('users', description='User operations')

email_validation = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_create_payload(data):
    if not data:
        return "Payload is empty"
    for field in ('first_name', 'last_name', 'email', 'password'):
        value = data.get(field)
        if not value or not str(value).strip():
            return f"'{field}' is required and cannot be empty"
    if not email_validation.match(data['email']):
        return "Invalid email format"
    return None


def validate_self_update_payload(data):
    """Utilisateur normal — uniquement first/last name."""
    if not data:
        return "Payload is empty"
    if 'email' in data:
        return "You cannot modify your email address"
    if 'password' in data:
        return "You cannot modify your password here"
    for field in ('first_name', 'last_name'):
        value = data.get(field)
        if value is not None and not str(value).strip():
            return f"'{field}' cannot be empty"
    return None


def validate_admin_update_payload(data):
    """Admin — email et password autorisés."""
    if not data:
        return "Payload is empty"
    if 'email' in data:
        if not data['email'] or not str(data['email']).strip():
            return "'email' cannot be empty"
        if not email_validation.match(data['email']):
            return "Invalid email format"
    if 'password' in data:
        if not data['password'] or not str(data['password']).strip():
            return "'password' cannot be empty"
    for field in ('first_name', 'last_name'):
        value = data.get(field)
        if value is not None and not str(value).strip():
            return f"'{field}' cannot be empty"
    return None


# ---------------------------------------------------------------------------
# API models
# ---------------------------------------------------------------------------

# Création — admin only, is_admin peut être True ou False
user_model = api.model('User', {
    'first_name': fields.String(required=True,  description='First name'),
    'last_name':  fields.String(required=True,  description='Last name'),
    'email':      fields.String(required=True,  description='Email address'),
    'password':   fields.String(required=True,  description='Password'),
    'is_admin':   fields.Boolean(default=False,
                                 description='Admin flag — only honoured when sent by an admin'),
})

# Mise à jour par l'utilisateur lui-même (first/last name seulement)
user_update_model = api.model('UserUpdate', {
    'first_name': fields.String(description='First name'),
    'last_name':  fields.String(description='Last name'),
})

# Mise à jour complète par un admin (email + password inclus)
admin_update_model = api.model('AdminUserUpdate', {
    'first_name': fields.String(description='First name'),
    'last_name':  fields.String(description='Last name'),
    'email':      fields.String(description='Email address'),
    'password':   fields.String(description='New password (will be hashed)'),
})

# Réponse (jamais de password)
user_response_model = api.model('UserResponse', {
    'id':         fields.String(description='User ID'),
    'first_name': fields.String(description='First name'),
    'last_name':  fields.String(description='Last name'),
    'email':      fields.String(description='Email address'),
})


def user_to_dict(user):
    """Sérialise un User SANS exposer le password."""
    return {
        'id':         user.id,
        'first_name': user.first_name,
        'last_name':  user.last_name,
        'email':      user.email,
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@api.route('/')
class UserList(Resource):

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created', user_response_model)
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Admin privileges required')
    def post(self):
        """Create a new user — admin only."""
        claims = get_jwt()
        if not claims.get('is_admin', False):
            return {'error': 'Admin privileges required'}, 403

        user_data = dict(api.payload)

        error = validate_create_payload(user_data)
        if error:
            return {'error': error}, 400

        if facade.get_user_by_email(user_data['email']):
            return {'error': 'Email already registered'}, 400

        try:
            new_user = facade.create_user(user_data)
        except ValueError as e:
            return {'error': str(e)}, 400

        return user_to_dict(new_user), 201

    @api.response(200, 'List of users retrieved successfully')
    def get(self):
        """Retrieve all users (public)."""
        return [user_to_dict(u) for u in facade.get_all_users()], 200


@api.route('/<user_id>')
class UserResource(Resource):

    @api.response(200, 'User details retrieved successfully', user_response_model)
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID (public)."""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return user_to_dict(user), 200

    @jwt_required()
    @api.doc(security='BearerAuth')
    @api.response(200, 'User successfully updated', user_response_model)
    @api.response(400, 'Invalid input data')
    @api.response(401, 'Authentication required')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'User not found')
    def put(self, user_id):
        """Update a user.

        - **Regular users**: only first/last name. Email and password cannot be changed.
        - **Admins**: can update any user, including email and password.
        """
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)

        if current_user_id != user_id and not is_admin:
            return {'error': 'Unauthorized action'}, 403

        user_data = dict(api.payload)
        # is_admin ne peut pas être changé via ce endpoint
        user_data.pop('is_admin', None)

        if is_admin:
            error = validate_admin_update_payload(user_data)
        else:
            error = validate_self_update_payload(user_data)

        if error:
            return {'error': error}, 400

        try:
            updated_user = facade.update_user(user_id, user_data)
        except ValueError as e:
            return {'error': str(e)}, 400

        if not updated_user:
            return {'error': 'User not found'}, 404

        return user_to_dict(updated_user), 200
