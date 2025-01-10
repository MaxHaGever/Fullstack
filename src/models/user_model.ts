import mongoose from "mongoose"
const Schema = mongoose.Schema
const userSchema = new Schema({
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        require: true
    }
})
const Users = mongoose.model("Users", userSchema)
export default Users