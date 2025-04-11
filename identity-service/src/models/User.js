const mongoose = require('mongoose');
const argon2 = require('argon2')

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    createdAt : {
        type: Date,
        default: Date.now
    }
},{
    timestamps: true,
})

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        try {
            this.password = await argon2.hash(this.password);
        } catch (error) {
            return next(error)
        }
    }
    next();
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try {
        return await argon2.verify(this.password, candidatePassword)
    } catch (error) {
        throw error;
    }
}

userSchema.index({username: 'text'});
//Tạo một text index trên trường username.
//Sau khi tạo text index, bạn có thể dùng $text để thực hiện search giống như Google.

const User = mongoose.model('User',userSchema)
module.exports = User;