# Search API Methods

**Authentication:** All endpoints require a valid Bearer Token in the `Authorization` header.

## 1. Search Users

- **Endpoint:** `/api/search/users`
- **Method:** `GET`
- **Description:** Search for users by name or username.
- **Query Params:**
  - `q`: Search query string
  - `page` (default 1)
  - `limit` (default 20)

## 2. Search Posts

- **Endpoint:** `/api/search/posts`
- **Method:** `GET`
- **Description:** Search for posts by content.
- **Query Params:**
  - `q`: Search query string
  - `page` (default 1)
  - `limit` (default 20)

## 3. Search Hashtags

- **Endpoint:** `/api/search/hashtags`
- **Method:** `GET`
- **Description:** Search for hashtags.
- **Query Params:**
  - `q`: Search query string
  - `page` (default 1)
  - `limit` (default 20)
