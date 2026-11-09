const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    tmdbId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    original_title: { type: String },
    overview: { type: String },
    poster_path: { type: String },
    backdrop_path: { type: String },
    release_date: { type: String },
    vote_average: { type: Number, default: 8.0 },
    vote_count: { type: Number, default: 1000 },
    runtime: { type: Number, default: 120 },
    genres: [{ type: String }],
    trailer_url: { type: String },
    cast: [{
        name: String,
        character: String,
        profile_path: String
    }],
    director: { type: String, default: 'Denis Villeneuve' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Tạo trường ảo 'id' bằng với tmdbId để tương thích 100% với code frontend (app.js, explore.js)
movieSchema.virtual('id').get(function() {
    return this.tmdbId;
});

module.exports = mongoose.model('Movie', movieSchema);