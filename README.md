# p5.js Sketch Server

A simple Node.js server for hosting p5.js sketches.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and go to `http://localhost:3000`

## Development

For development with auto-reload:
```bash
npm run dev
```

## Project Structure

```
├── server.js          # Express server
├── package.json        # Project dependencies
├── public/             # Static files served by the server
│   ├── index.html      # Main HTML page
│   ├── sketch.js       # Your p5.js sketch goes here
│   └── assets/         # Media files
│       ├── images/     # Put your images here (.png, .jpg, .gif, .svg, .webp)
│       └── sounds/     # Put your audio files here (.mp3, .wav, .ogg, .m4a)
```

## Adding Your Sketch

Simply replace the content in `public/sketch.js` with your own p5.js code. The HTML page is already set up to load p5.js and p5.sound from CDN.

## Adding Media Files

- **Images**: Place your image files in `public/assets/images/`
- **Sounds**: Place your audio files in `public/assets/sounds/`

The server is configured to properly serve all common image and audio formats with correct MIME types.

### Loading Media in p5.js

```javascript
// In preload() function:
let myImage = loadImage('assets/images/myimage.png');
let mySound = loadSound('assets/sounds/mysound.mp3');
```

## Features

- Express.js server for serving static files
- p5.js and p5.sound loaded from CDN
- Proper MIME type handling for images and audio files
- Cross-origin support for media files
- Organized asset folders for images and sounds
- Responsive design
- Development mode with nodemon for auto-reload
# activities
