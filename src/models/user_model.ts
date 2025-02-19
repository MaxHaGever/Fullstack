import mongoose from "mongoose"
const Schema = mongoose.Schema
const userSchema = new Schema({
    username:{
        type: String,
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        require: true
    },
    refreshTokens:{
        type: [String],
        default: []
    },
    avatar: {
        required: false,
        type: String,
    },
})
const Users = mongoose.model("Users", userSchema)
export default Users