
# User Model Specification

## Fields and Validation Rules

| Field           | Rules                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| firstName       | Required                                                                                                               |
| lastName        | Required                                                                                                               |
| email           | Required, Valid email                                                                                                  |
| username        | Required                                                                                                               |
| password        | Min 6 characters and include at least one uppercase letter, one lowercase letter, one digit, and one special character |
| confirmPassword | Min 6 characters and must match password                                                                               |
| role            | One of: ADMIN, FARMER, GOVERNMENT                                                                                      |
| farmName        | Required if role is FARMER                                                                                             |
| farmAddress     | Required if role is FARMER                                                                                             |
| state           | Required if role is GOVERNMENT                                                                                         |
| city            | Required if role is GOVERNMENT                                                                                         |
| isEmailVerified | Boolean                                                                                                                |
| avatar          | Valid URL format                                                                                                       |
| createdAt       | Valid date-time format (ISO 8601)                                                                                      |
| updatedAt       | Valid date-time format (ISO 8601)                                                                                      |
| deletedAt       | Valid date-time format (ISO 8601) or null                                                                              |


# Authentication Controllers 

This document outlines the API endpoints related to the Authentication Module of our application. The Authentication Module is responsible for managing user authentication, including login, registration, password management, and token handling.

## Formatted as follows:
- **Endpoint:** The HTTP method and URL path for the API endpoint.
- **Description:** A brief description of the endpoint's purpose.
- **Request:** The expected request format, including headers and body parameters.
- **Response:** The expected response format, including status codes and body parameters.
- **Errors:** Possible error responses with status codes and messages.



## 1. `POST /auth/signup`

**Description:** Register a new user in the system.
**Route** `POST /api/auth/signup`
**Access** Public to all users.

### Request
```http
POST /api/auth/signup
Content-Type: application/json
```

```json
{
    "firstName": "Ahmed",
    "lastName": "Ezzeldeen",
    "email": "Ahmed.Mohamed.Ezzeldeen@gmail.com",
    "username": "ahmed3zzeldeen",
    "password": "123456@Aa",
    "role": "FARMER", // or GOVERNMENT
    // if Government we need his state and city else we need the farm name and farm address
    // "state": "Cairo",
    // "city": "Nasr City",
    "farmName": "Green Farm",
    "farmAddress": "123 Farm St, Cairo",
}
```

### Validation

| Field           | Rules                                                               |
| --------------- | ------------------------------------------------------------------- |
| email           | Required, Valid email                                               |
| username        | Required                                                            |
| password        | Min 6 characters and include at least one uppercase letter, one lowercase letter, one digit, and one special character |
| firstName       | Required                                                            |
| lastName        | Required                                                            |
| role            | One of: FARMER, GOVERNMENT, ADMIN                                   |
| farmName        | Required if role is FARMER                                          |
| farmAddress     | Required if role is FARMER                                          |
| state           | Required if role is GOVERNMENT                                      |
| city            | Required if role is GOVERNMENT                                      |


### Response (201 Created)

```json
{
  "user": {
    "id": 1,
    "name": "أحمد محمد",
    "email": "ahmed@test.com",
    "username": "ahmed3zzeldeen",
    "gender": "male",
    "brithday": "15-08-2000",
    "role": "FARMER",
    "farmName": "Green Farm",
    "farmAddress": "123 Farm St, Cairo",
    "status": "active",
    "isEmailVerified": false,
    "isPhoneVerified": false,
    "avatar": "/avatars/default.png",
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

### Errors

| Status | Message                 |
| ------ | ----------------------- |
| 400    | Validation failed       |
| 400    | Email already exists    |
| 400    | Username already exists |
| 500    | Server error            |


---
## 2. `POST /auth/login`
**Description:** Authenticate a user and provide a JWT token.
### Request
```http
POST /api/auth/login
Content-Type: application/json
```
```json
{
    "email": "Ahmed.Mohamed.Ezzeldeen@gmail.com",
    "password": "123456@Aa"
}
```

### Response (200 OK)
```json
{
    "status": "success",
    "data": {
        "token": {
            "refresh": "<refresh_token_string>",
            "access": "<access_token_string>"
        },
        "user": {
            "id": "<uuid_string>",
            "firstName": "Ahmed",
            "lastName": "3zz",
            "email": "ahmed.mohamed.ezzeldeen@gmail.com",
            "username": "ahmed3zzeldeen",
            "role": "ADMIN",
            "avatar": "/profile.png"
        }
    }
}
```
### Errors
| Status | Message              |
| ------ | -------------------- |
| 400    | Invalid credentials  |
| 500    | Server error         |

---

## 3. `POST /auth/logout`
**Description:** Logout a user by invalidating the refresh token.
### Request
```http
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer <access_token_string>
```
```json
{
    "refreshToken": "<refresh_token_string>"
}
```
### Response (200 OK)
```json
{
    "status": "success",
    "message": "Logged out successfully."
}
```
### Errors
| Status | Message              |
| ------ | -------------------- |
| 400    | Invalid token        |
| 500    | Server error         |

---

## 4. `POST /auth/refresh-token`
**Description:** Refresh the access token using a valid refresh token.
### Request
```http
GET /api/auth/refresh-token
Authorization: Bearer <refresh_token_string>
```
### Response (200 OK)
```json
{
    "data": {
        "token": {
            "refresh": "<new_refresh_token_string>",
            "access": "<new_access_token_string>"
        },
        "user": {
            "id": "<uuid_string>",
            "firstName": "Ahmed",
            "lastName": "3zz",
            "email": "ahmed.mohamed.ezzeldeen@gmail.com",
            "username": "ahmed3zzeldeen",
            "role": "ADMIN",
            "avatar": "/profile.png"
        }
    },
    "status": "success",
    "message": "Token refreshed successfully"
}
```
### Errors
| Status | Message              |
| ------ | -------------------- |
| 400    | Invalid token        |
| 500    | Server error         |

---
## 5. `POST /auth/forgot-password`
**Description:** Send a password reset link and verification code to the user's email address.
### Request
```http
POST /api/auth/forgot-password
Content-Type: application/json
```
```json
{
    "email":"Ahmed.Mohamed.Ezzeldeen@gmail.com"
}
```
### Response (200 OK)
```json
{
    "status": "success",
    "message": "Password reset link has been sent to your email.",
    "data": null
}
```

### Errors
| Status | Message              |
| ------ | -------------------- |
| 400    | Email not found      |
| 500    | Server error         |

---

## 6. `POST /auth/reset-password`
**Description:** Initiate password reset process by sending a reset link to the user's email.
### Request
```http
POST /api/auth/reset-password
Content-Type: application/json
```
```json
{
    "password":"<new_password_string>",
    "resetPasswordToken": "<reset_token_string>"
}
```

### Response (200 OK)
```json
{
    "status": "success",
    "message": "Password has been reset successfully."
}
```

### Errors
| Status | Message                   |
| ------ | ------------------------- |
| 400    | Invalid reset token       |
| 500    | Server error              |



---


## 7. `GET /api/auth/send-verification-email`
**Description:** Send an email verification token to the user's email.
### Request
```http
GET /api/auth/send-verification-email
```
```json
{
    "email":"Ahmed.Mohamed.Ezzeldeen@gmail.com"
}
```
### Response (200 OK)
```json
{
    "status": "success",
    "message": "Email verification token sent successfully",
    "data": null,
}
```

### Errors
| Status | Message              |
| ------ | -------------------- |
| 400    | Email not found      |
| 500    | Server error         |

---

## 8. `POST /api/auth/confirm-email`
**Description:** Confirm user's email address using a verification token.
### Request
```http
POST /api/auth/confirm-email
Content-Type: application/json
```
```json
{
    "emailVerificationToken": "<verification_token_string>"
}
```
### Response (200 OK)
```json
{
    "status": "success",
    "message": "Email verified successfully",
    "data": null
}
```
### Errors
| Status | Message                   |
| ------ | ------------------------- |
| 400    | Invalid verification token|
| 500    | Server error              |

---

## 9. `POST /api/auth/change-password`
**Description:** Change the user's password.
### Request
```http
POST /api/auth/change-password
Content-Type: application/json
Authorization: Bearer <access_token_string>
```
```json
{
    "currentPassword": "old_password_string",
    "newPassword": "new_password_string"
}
```
### Response (200 OK)
```json
{
    "status": "success",
    "message": "Password changed successfully",
    "data": null
}
```
### Errors
| Status | Message              |
| ------ | -------------------- |
| 400    | Incorrect password   |
| 400    | Weak new password    |
| 500    | Server error         |

---
