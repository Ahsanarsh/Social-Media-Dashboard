# Post API Methods

Base URL: `http://localhost:3000/api/posts`

**Authentication:** All endpoints require a valid Bearer Token in the `Authorization` header.

## 1. Create Post

- **Endpoint:** `/`
- **Method:** `POST`
- **Description:** Create a new post with text content and an optional image.
- **Body (form-data):**
  - `content`: Text content of the post.
  - `image`: Image file (optional).

## 2. Get Feed

- **Endpoint:** `/feed`
- **Method:** `GET`
- **Description:** Retrieve a personalized feed of posts from users you follow.
- **Query Params:** `page` (default 1), `limit` (default 10).

## 3. Get Explore

- **Endpoint:** `/explore`
- **Method:** `GET`
- **Description:** Retrieve a global feed of recent posts (trending/explore).
- **Query Params:** `page` (default 1), `limit` (default 20).

## 4. Get Single Post

- **Endpoint:** `/:id`
- **Method:** `GET`
- **Description:** Retrieve details of a specific post by ID.

## 5. Delete Post

- **Endpoint:** `/:id`
- **Method:** `DELETE`
- **Description:** Delete a specific post by ID. Users can only delete their own posts.

## 6. Like Post

- **Endpoint:** `/:id/like`
- **Method:** `POST`
- **Description:** Like a specific post.

## 7. Unlike Post

- **Endpoint:** `/:id/like`
- **Method:** `DELETE`
- **Description:** Remove a like from a specific post.

## 8. Repost

- **Endpoint:** `/:id/repost`
- **Method:** `POST`
- **Description:** Repost (share) a specific post.

## 9. Bookmark Post

- **Endpoint:** `/:id/bookmark`
- **Method:** `POST`
- **Description:** Save a post to your bookmarks.
