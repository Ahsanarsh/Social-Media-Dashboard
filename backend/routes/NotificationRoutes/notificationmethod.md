# Notification API Methods

**Authentication:** All endpoints require a valid Bearer Token in the `Authorization` header.

## 1. Get Notifications

- **Endpoint:** `/api/notifications`
- **Method:** `GET`
- **Description:** Retrieve user notifications.
- **Query Params:**
  - `page` (default 1)
  - `limit` (default 20)

## 2. Mark as Read

- **Endpoint:** `/api/notifications/read`
- **Method:** `PUT`
- **Description:** Mark all of the user's unread notifications as read.

## 3. Delete Notification

- **Endpoint:** `/api/notifications/:id`
- **Method:** `DELETE`
- **Description:** Delete a specific notification.
