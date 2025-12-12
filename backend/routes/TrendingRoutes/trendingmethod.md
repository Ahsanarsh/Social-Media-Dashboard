# Trending API Methods

**Authentication:** All endpoints require a valid Bearer Token in the `Authorization` header.

## 1. Trending Hashtags

- **Endpoint:** `/api/trending/hashtags`
- **Method:** `GET`
- **Description:** Get most popular hashtags.
- **Query Params:** `limit` (default 10).

## 2. Trending Posts

- **Endpoint:** `/api/trending/posts`
- **Method:** `GET`
- **Description:** Get popular posts based on engagement.
- **Query Params:** `limit` (default 10).

## 3. User Suggestions

- **Endpoint:** `/api/trending/suggestions/users`
- **Method:** `GET`
- **Description:** Get suggestions for users to follow.
- **Query Params:** `limit` (default 5).
