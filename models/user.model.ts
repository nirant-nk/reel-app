import bcrypt from 'bcryptjs';
import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps:true
    }
);

userSchema.pre('save',async function(next){
    const user = this as IUser & mongoose.Document;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,10);
    }
    next();
})

const User = models.User || model<IUser>('User',userSchema)

export default User;