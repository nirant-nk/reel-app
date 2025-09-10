import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user:{
            id: string; // add id property to user object in session
            role: string; // add role property to user object in session
            email: string; // add email property to user object in session
        } & DefaultSession["user"];
    } 
}