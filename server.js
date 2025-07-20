const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure static file serving with proper MIME types for media files
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        // Set proper MIME types for media files
        if (path.endsWith('.mp3')) {
            res.setHeader('Content-Type', 'audio/mpeg');
        } else if (path.endsWith('.wav')) {
            res.setHeader('Content-Type', 'audio/wav');
        } else if (path.endsWith('.ogg')) {
            res.setHeader('Content-Type', 'audio/ogg');
        } else if (path.endsWith('.m4a')) {
            res.setHeader('Content-Type', 'audio/mp4');
        } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
            res.setHeader('Content-Type', 'image/gif');
        } else if (path.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        } else if (path.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
        
        // Allow cross-origin requests for media files
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Your p5.js sketch will be available at the home page!');
});
