# HBnB – Business Logic Layer

## Overview

This layer defines the core domain entities for the HBnB rental-listing application. Every entity inherits from `BaseModel`, which provides auto-generated UUIDs and automatic timestamp management.

---

## Project Structure

```
app/
├── __init__.py
└── models/
    ├── __init__.py
    ├── base_model.py   # Shared base class
    ├── user.py         # User entity
    ├── amenity.py      # Amenity entity
    ├── place.py        # Place entity (with relationship helpers)
    └── review.py       # Review entity

tests/
└── test_models.py      # 33 unit / integration tests
```

---

## Entities

### BaseModel (`base_model.py`)

The root of the class hierarchy. All entities inherit from it.

| Attribute    | Type       | Description                              |
|-------------|------------|------------------------------------------|
| `id`        | `str`      | UUID4 string, set once at creation.      |
| `created_at`| `datetime` | Timestamp set when the object is created.|
| `updated_at`| `datetime` | Refreshed every time `save()` is called. |

**Key methods:**

```python
obj.save()             # Update updated_at to now
obj.update(dict)       # Bulk-set attributes (id/created_at are protected)
obj.to_dict()          # Serialisable dict (timestamps as ISO strings)
```

---

### User (`user.py`)

Represents a registered user — either a regular guest or an administrator.

| Attribute    | Type   | Constraints                               |
|-------------|--------|-------------------------------------------|
| `first_name`| `str`  | Required, max 50 characters               |
| `last_name` | `str`  | Required, max 50 characters               |
| `email`     | `str`  | Required, unique, valid e-mail format. Stored in lowercase. |
| `is_admin`  | `bool` | Defaults to `False`                       |

```python
user = User(first_name="Alice", last_name="Smith", email="alice@example.com")
user.is_admin  # False

admin = User(first_name="Bob", last_name="Admin",
             email="bob@example.com", is_admin=True)
```

---

### Amenity (`amenity.py`)

A named feature offered by a place (e.g. "Wi-Fi", "Parking").

| Attribute | Type  | Constraints                  |
|-----------|-------|------------------------------|
| `name`    | `str` | Required, max 50 characters  |

```python
wifi = Amenity(name="Wi-Fi")
parking = Amenity(name="Parking")
```

---

### Place (`place.py`)

A rental property listed on the platform.

| Attribute     | Type    | Constraints                                   |
|--------------|---------|-----------------------------------------------|
| `title`      | `str`   | Required, max 100 characters                  |
| `description`| `str`   | Optional                                      |
| `price`      | `float` | Must be > 0                                   |
| `latitude`   | `float` | −90.0 to 90.0                                 |
| `longitude`  | `float` | −180.0 to 180.0                               |
| `owner`      | `User`  | Must be a valid `User` instance               |
| `reviews`    | `list`  | `Review` instances (managed via `add_review`) |
| `amenities`  | `list`  | `Amenity` instances (managed via `add_amenity`)|

```python
place = Place(
    title="Cozy Apartment",
    description="A nice place to stay",
    price=100.0,
    latitude=37.7749,
    longitude=-122.4194,
    owner=user,
)

place.add_amenity(wifi)      # Attach an Amenity
place.add_review(review)     # Attach a Review
```

---

### Review (`review.py`)

A guest's rating and comment for a specific place.

| Attribute | Type    | Constraints                              |
|-----------|---------|------------------------------------------|
| `text`    | `str`   | Required, non-empty                      |
| `rating`  | `int`   | Integer 1–5 (inclusive)                  |
| `place`   | `Place` | Must be a valid `Place` instance         |
| `user`    | `User`  | Must be a valid `User` instance          |

```python
review = Review(text="Loved the location!", rating=5, place=place, user=guest)
place.add_review(review)
```

---

## Relationships

| Relationship      | Cardinality | How it works                                          |
|------------------|-------------|-------------------------------------------------------|
| User → Place      | 1 : many    | `Place.owner` holds the owning `User` instance.       |
| Place → Review    | 1 : many    | `Place.reviews` list; use `Place.add_review(review)`. |
| Place ↔ Amenity   | many : many | `Place.amenities` list; use `Place.add_amenity(a)`.   |
| Review → User     | many : 1    | `Review.user` holds the authoring `User` instance.    |

---

## Why UUIDs?

Each object uses a **UUID4** string as its identifier:

* **Global uniqueness** – no clashes when merging data from different systems.
* **Security** – non-sequential, impossible to guess or enumerate.
* **Scalability** – generated client-side without a central counter.

---

## Validation

Every attribute is guarded by a Python `@property` setter. Attempting to set an invalid value raises a descriptive `ValueError` (or `TypeError` for wrong types):

```python
User(first_name="X", last_name="Y", email="bad")     # ValueError: invalid email
Place(..., price=-10, ...)                             # ValueError: price must be positive
Review(..., rating=6, ...)                             # ValueError: rating must be 1–5
```

---

## Running the Tests

```bash
python tests/test_models.py
```

Expected output: **33 passed, 0 failed**.

You can also use pytest:

```bash
pip install pytest
pytest tests/ -v
```
