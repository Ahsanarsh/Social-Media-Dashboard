# Authentication API Methods

Base URL: `http://localhost:3000/api/auth`

## 1. Register User

- **Endpoint:** `/register`
- **Method:** `POST`
- **Description:** Register a new user account.
- **Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```

## 2. Verify Email

- **Endpoint:** `/verify-email`
- **Method:** `GET`
- **Description:** Verify user email address using the token sent via email.
- **Query Params:** `token` (The verification token).

## 3. Login

- **Endpoint:** `/login`
- **Method:** `POST`
- **Description:** Authenticate user and receive access/refresh tokens.
- **Body (JSON):**
  ```json
  {
    "email": "john@example.com",
    "password": "strongpassword123"
  }
  ```

## 4. Refresh Token

- **Endpoint:** `/refresh`
- **Method:** `POST`
- **Description:** specific refresh token to get a new access token.
- **Body (JSON):**
  ```json
  {
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }
  ```

## 5. Logout

- **Endpoint:** `/logout`
- **Method:** `POST`
- **Description:** Invalidate the refresh token (Requires Authentication).
- **Body (JSON):**
  ```json
  {
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }
  ```

## 6. Get Current User (Me)

- **Endpoint:** `/me`
- **Method:** `GET`
- **Description:** Retrieve the currently authenticated user's profile.
- **Headers:** `Authorization: Bearer <access_token>`
