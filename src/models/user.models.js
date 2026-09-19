const mongoose = require('mongoose');

// Define the fields stored for each user account.
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname :{
        firstname:{
            type: String,
            required: true
        },
        lastname:{
            type: String,
            required: true
        }
    },
    password : {
        type : String 
    }

},
{
    timestamps : true
})

// Create the MongoDB model used by authentication and user lookup.
const userModel = mongoose.model("user", userSchema)

module.exports = userModel;