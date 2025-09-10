import connectToDatabase from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "name, email & password are required",
        },
        {
          status: 400,
          statusText: "Failed",
        }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User already exists with this email",
        },
        {
          status: 400,
          statusText: "Failed",
        }
      );
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Failed to create user",
        },
        {
          status: 500,
          statusText: "Failed",
        }
      );
    }

    let userCreated = user.toObject();

    delete userCreated.password;
    delete userCreated.__v;

    // console.log(userCreated);
    

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userCreated,
      },
      {
        status: 201,
        statusText: "Created",
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 500,
        message: "Registration failed",
        statusText:
          "Internal Server Error: " +
          (error instanceof Error ? error.message : String(error)),
      },
      {
        status: 500
      }
    );
  }
}
