# CREATE NEXT APP USING TS

```bash
npx create-next-app@latest .
```

---

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

```ts
import { Connection } from "mongoose";

declare global {
  var mongoose: {
    conn: Connection | null; // connection exist
    promise: Promise<Connection> | null; // connection in progress
  };
}

export {};
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

---

## Q. How types known throught the project ?

```text
Using tsconfig.json file
```

---

---

# CREATE SCHEMA & MODEL IN ts + Next.js

### Steps

1. **Define a ts interface `IUser` to represent a User document structure:**

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

---

# WRITING CONTROLLERS

## Q. Where to write controllers?

### Exactly within:

```bash
/app/api
```

Everything as a folder structure we define within '/app/api' is treated as a route and file must be named 'route.ts'

### Example below is a register route:

```bash
app/api/auth/register/route.ts
```

---

---

# NEXT-AUTH

```
if using ts -> setup '@/next-auth.d.ts'
```

```ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // add id property to user object in session
      role: string; // add role property to user object in session
      email: string; // add email property to user object in session
    } & DefaultSession["user"];
  }
}
```

```ts
NextAuthOptions
├── providers
│   └── CredentialsProvider
│       ├── name: "Credentials"
│       ├── credentials
│       │   ├── email
│       │   │   ├── label: "Email"
│       │   │   └── type: "text"
│       │   └── password
│       │       ├── label: "Password"
│       │       └── type: "password"
│       └── authorize (async function)
│           └── Logic: Validate credentials, connect to DB, check user, verify password, return user object
├── callbacks
│   ├── jwt (async function)
│   │   └── Logic: Add user.id to token if user exists
│   └── session (async function)
│       └── Logic: Add token.id to session.user.id
├── pages
│   ├── signIn: "/auth/signin"
│   └── error: "/auth/signin"
├── session
│   ├── strategy: "jwt"
│   └── maxAge: 2592000 (30 * 24 * 60 * 60 seconds)
└── secret: process.env.NEXTAUTH_SECRET

```

### @/app/api/auth/[...nextauth]/route.ts
```ts
import { AuthOptions } from "@/lib/nextAuthOptions";
import NextAuth from "next-auth";

const handler = NextAuth(AuthOptions);

export { handler as GET, handler as POST };
```

### Middleware (withAuth)
```bash
'@/middleware.ts'
```
```ts
import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(){
        return NextResponse.next();
    },
    {
        callbacks: {
            // allow authorized requests only to pass the middleware else return false
            authorized: ({ token,req }) => {
                const {pathname} = req.nextUrl;

                if(
                    pathname.startsWith('/api/auth') ||
                    pathname === '/login' ||
                    pathname === '/register' 
                ){
                    return true;
                }

                if(
                    pathname === '/' ||
                    pathname.startsWith("/api/videos") 
                ){
                    return true;
                }

                return !!token;
            },
        }
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
```