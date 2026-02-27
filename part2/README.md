
# 🏗 HBnB Evolution — Part 2
## Business Logic & REST API Implementation

---

## 📑 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Business Logic Layer](#business-logic-layer)
- [REST API](#rest-api)
- [Serialization](#serialization)
- [Testing](#testing)
- [Installation & Environment Setup](#installation--environment-setup)
- [Project Structure](#project-structure)
- [Status](#status)
- [Conclusion](#conclusion)
- [Authors](#authors)

---

## Overview

Part 2 transitions the HBnB Evolution project from architectural design (Part 1) to a fully functional application.

This phase implements:

- The **Business Logic Layer**
- The **Presentation Layer (Flask + flask-restx)**
- An **In-Memory Persistence Layer**
- The **Facade Pattern**

⚠ JWT authentication and SQLAlchemy persistence will be implemented in **Part 3**.

---

# Architecture

## Layered Structure

```
Presentation Layer (Flask API)
        ↓
Facade
        ↓
Business Logic Layer
        ↓
Persistence Layer (In-Memory Repository)
```

## Responsibilities

| Layer | Role |
|--------|------|
| Presentation | Handle HTTP requests & responses |
| Facade | Orchestrate use cases |
| Business Logic | Enforce domain rules & relationships |
| Persistence | Store and retrieve objects |

---

# Business Logic Layer

## Core Entities

- `User`
- `Place`
- `Review`
- `Amenity`

All entities:

- Inherit from `BaseModel`
- Use `UUID4`
- Track `created_at` / `updated_at`
- Validate input
- Enforce relationships

## Relationships

- User → owns → Places
- User → writes → Reviews
- Place → belongs to → User
- Place ↔ Amenities (Many-to-Many)
- Review → belongs to → User & Place

---

# REST API

Base URL:

```
/api/v1/
```

## Users

| Method | Endpoint |
|--------|----------|
| POST | /users |
| GET | /users |
| GET | /users/<id> |
| PUT | /users/<id> |

❌ DELETE not implemented  
🔒 Password excluded from responses  

---

## Amenities

| Method | Endpoint |
|--------|----------|
| POST | /amenities |
| GET | /amenities |
| GET | /amenities/<id> |
| PUT | /amenities/<id> |

---

## Places

| Method | Endpoint |
|--------|----------|
| POST | /places |
| GET | /places |
| GET | /places/<id> |
| PUT | /places/<id> |

Validation:

- price
- latitude
- longitude

Includes owner & amenities in response.

---

## Reviews

| Method | Endpoint |
|--------|----------|
| POST | /reviews |
| GET | /reviews |
| GET | /reviews/<id> |
| PUT | /reviews/<id> |
| DELETE | /reviews/<id> |

Supports retrieving all reviews for a specific place.

---

# Serialization

- Nested related objects included when relevant
- Sensitive fields excluded
- Structured JSON responses

---

# Testing

The API was extensively tested using **Postman** with a complete dedicated collection.

## Postman Collection

A full Postman workspace was create in order to test:

It includes:

- All endpoints (Users, Amenities, Places, Reviews)
- Positive and negative test cases
- Automatic ID propagation via environment variables
- Validation of:
  - Status codes
  - JSON structure
  - UUID format
  - Business constraints
  - Relationship integrity

- cURL testing
- Swagger documentation (flask-restx)
- Validation checks
- Edge case handling
- Unit tests (`unittest` / `pytest`)

---

# Installation & Environment Setup

## 1️⃣ Create virtual environment

```bash
python3 -m venv .venv
```

## 2️⃣ Activate

```bash
source .venv/bin/activate
```

## 3️⃣ Install dependencies

```bash
pip install -r requirements.txt
```

## 4️⃣ Run application

```bash
python run.py
```

## 5️⃣ Deactivate

```bash
deactivate
```

---

# Project Structure

```
part2/
│
├── api/v1/
├── models/
├── persistence/
├── services/
└── run.py
```

---

# Status

| Phase | Status |
|-------|--------|
| Part 1 | Architecture |
| Part 2 | API + Business Logic |
| Part 3 | SQLAlchemy + JWT |

---

# Conclusion

Part 2 delivers a modular, scalable REST API architecture with clear separation of concerns and prepares the system for persistence and authentication integration in Part 3.

---

# Authors

- Antoine Gousset – GitHub: [Antgst](https://github.com/Antgst)
- Gwendal Boisard – GitHub: [Gwendal-B](https://github.com/Gwendal-B)
- Yonas Houriez – GitHub: [Ausaryu](https://github.com/Ausaryu)

See `AUTHORS`.
