# Backend API Service

This repository contains a backend API service built with Node.js, Express, and MongoDB. It provides the following functionalities:

- **User Authentication**: Users can register and login to the system.
- **JWT Token**: Authentication is implemented using JSON Web Tokens (JWT).
- **API Rate Limiting**: Rate limiting is enforced to prevent abuse of the API.
- **Request Validation**: Requests are validated using Joi, ensuring data integrity.

## Setup

Follow these steps to set up the project:

1. Clone the repository.
2. Install dependencies.
3. Configure environment variables.
4. Start the server.

## API Endpoints

The following endpoints are available:

- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/auth/login`: Login with existing credentials.
- `GET /api/v1/*/secured`: Example of a protected route requiring a valid JWT token.

## Folder Structure

The project structure is organized as follows:

- `routes/`: Route handlers for different endpoints.
- `controllers/`: Controller functions for handling business logic.
- `models/`: Mongoose models for interacting with MongoDB.
- `middleware/`: Middleware functions for authentication and rate limiting.
- `healpers/`: Utility functions, such as JWT utilities.
- `validators/`: Contains request validator.
- `.env`: Environment variables.
- `app.js`: Express app configuration.

