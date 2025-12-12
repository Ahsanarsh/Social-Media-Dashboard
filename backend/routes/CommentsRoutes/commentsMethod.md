# Comments API Methods

**Authentication:** All endpoints require a valid Bearer Token in the `Authorization` header.

## 1. Get Post Comments

- **Endpoint:** `/api/posts/:postId/comments`
- **Method:** `GET`
- **Description:** Retrieve a list of comments for a specific post.
- **Query Params:** `page` (default 1), `limit` (default 20).

## 2. Add Comment

- **Endpoint:** `/api/posts/:postId/comments`
- **Method:** `POST`
- **Description:** Add a new comment to a specific post.
- **Body (JSON):**
  ```json
  {
    "content": "This is a comment!",
    "parent_comment_id": 123 // Optional, for nested replies
  }
  ```

## 3. Update Comment

- **Endpoint:** `/api/comments/:commentId`
- **Method:** `PUT`
- **Description:** Update the content of an existing comment. Users can only update their own comments.
- **Body (JSON):**
  ```json
  {
    "content": "Updated comment text"
  }
  ```

## 4. Delete Comment

- **Endpoint:** `/api/comments/:commentId`
- **Method:** `DELETE`
- **Description:** Delete a specific comment. Users can only delete their own comments.

## 5. Like Comment

- **Endpoint:** `/api/comments/:commentId/like`
- **Method:** `POST`
- **Description:** Like a specific comment.

## 6. Unlike Comment

- **Endpoint:** `/api/comments/:commentId/like`
- **Method:** `DELETE`
- **Description:** Remove a like from a specific comment.
