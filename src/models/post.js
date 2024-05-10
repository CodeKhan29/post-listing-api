const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    geolocation: {
        
        type: { type: String },
        coordinates: [Number]
    }
}, {
    timestamps: true
})

postSchema.index({ "loc": "2dsphere" });

const Post = mongoose.model('Post', postSchema)
module.exports= Post