const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt:{
        type: Date,
        required: true
    }
},{timestamps: true});

refreshTokenSchema.index({expiresAt: 1},{expiresAfterSeconds: 0});
//{ expiresAt: 1 }: This creates an index on the expiresAt field in ascending order (1 = ascending).
//{ expireAfterSeconds: 0 }: This tells MongoDB: "As soon as the time in expiresAt is reached, delete this document.

const RefreshToken = mongoose.model('RefreshToken',refreshTokenSchema)
module.exports = RefreshToken