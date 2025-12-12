# User API Methods

**Authentication:** All endpoints require a valid Bearer Token in the `Authorization` header.

## 1. Get User Profile

- **Endpoint:** `/api/users/:username`
- **Method:** `GET`
- **Description:** Retrieve a user's profile details by username.

## 2. Get User Posts

- **Endpoint:** `/api/users/:id/posts`
- **Method:** `GET`
- **Description:** Retrieve posts created by a specific user.
- **Query Params:** `page` (default 1), `limit` (default 10).

## 3. Get Followers

- **Endpoint:** `/api/users/:id/followers`
- **Method:** `GET`
- **Description:** Retrieve a list of users following the specified user.
- **Query Params:** `page` (default 1), `limit` (default 20).

## 4. Get Following

- **Endpoint:** `/api/users/:id/following`
- **Method:** `GET`
- **Description:** Retrieve a list of users that the specified user follows.
- **Query Params:** `page` (default 1), `limit` (default 20).

## 5. Update Profile

- **Endpoint:** `/api/users/profile`
- **Method:** `PUT`
- **Description:** Update current user's profile information.
- **Body (form-data):**
  - `name` (text)
  - `bio` (text)
  - `location` (text)
  - `website` (text)
  - `avatar` (file)
  - `cover_photo` (file)

## 6. Follow User

- **Endpoint:** `/api/users/:id/follow`
- **Method:** `POST`
- **Description:** Follow a user.

## 7. Unfollow User

- **Endpoint:** `/api/users/:id/follow`
- **Method:** `DELETE`
- **Description:** Unfollow a user.
