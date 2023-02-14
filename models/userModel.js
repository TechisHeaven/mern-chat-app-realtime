const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
    name : {type: String , required: true},
    email : {type: String , required: true, unique: true},
    password : {type: String , required: true},
    pic : {type: String , default: "https://thumbs.dreamstime.com/b/man-profile-cartoon-smiling-round-icon-vector-illustration-graphic-design-135443422.jpg"},
},
{
    timestamps: true, 
}
);


UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

UserSchema.pre("save", async function(next){
    if(!this.isModified){
        next()
    }
    const salt= await bcrypt.genSalt(10)
     this.password =  await bcrypt.hash(this.password, salt)
})

const User = mongoose.model("User", UserSchema);

module.exports = User;