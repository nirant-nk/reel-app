# CREATE NEXT APP USING TS
```bash
npx create-next-app@latest .
```
-----
## Q. How does NEXT work ?
```text
Unlike Express which provides the server through a single node.

NEXT run the application via multiple edges and hence it proves to be faster in production as the request can be entertained using any edge available.
```
## Q. How does database connection work ?
```text
Due to multiple edges we may get multiple connections everytime we make a req.

In order to address this issue we have:

global {} - an object know overall the project to keep chached info
```

```typescript
import {Connection} from "mongoose";

declare global{
    var mongoose: {
        conn:Connection | null, // connection exist
        promise: Promise<Connection> | null // connection in progress
    }
}

export {}
```


### Database Connection Algorithm

1. **Read `MONGODB_URI` from environment.**

2. **If missing, throw an error.**

3. **If connection is already cached, return it.**

4. **If a connection is not in progress:**
    - Start connecting to MongoDB and save the promise.

5. **Wait for the connection to finish.**

6. **On success:**  
    - Cache the connection.

7. **On failure:**  
    - Clear the promise and throw an error.

8. **Return the connected database object.**


-----
## Q. How types known throught the project ?
```text
Using tsconfig.json file
```
-----
-----
# CREATE SCHEMA & MODEL IN TypeScript + Next.js


### Steps

1. **Define a TypeScript interface `IUser` to represent a User document structure:**
    - Fields:
        - `_id`: ObjectId
        - `name`: string
        - `email`: string
        - `password`: string
        - `role`: 'user' | 'admin'
        - `createdAt`: Date
        - `updatedAt`: Date

2. **Create a Mongoose schema `userSchema` with the following fields:**
    - `name`: String, required
    - `email`: String, required, unique
    - `password`: String, required
    - `role`: String, enum ['user', 'admin'], default 'user'
    - Enable timestamps (`createdAt` and `updatedAt`)

3. **Define a pre-save hook (`userSchema.pre('save')`) that runs before saving a user document:**
    - If the `password` field was modified:
        - Hash the password using `bcrypt` with salt rounds = 10.

4. **Check if the `User` model already exists (important in development environments with hot-reloading):**
    - If yes → reuse the existing model.
    - If no → create a new Mongoose model named `'User'`.

5. **Export the `User` model to be used elsewhere in the application (e.g., API routes).**

-----