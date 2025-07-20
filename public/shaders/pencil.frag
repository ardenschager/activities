#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;
uniform sampler2D u_texture;
uniform sampler2D u_noise;

varying vec2 vTexCoord;

// Simple noise function
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Fractal noise
float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 3; i++) {
        f += w * noise(p);
        p *= 2.0;
        w *= 0.5;
    }
    return f;
}

void main() {
    vec2 st = vTexCoord;
    
    // Sample the base stroke texture
    vec4 stroke = texture2D(u_texture, st);
    
    // Create noise for texture variation
    vec2 noiseCoord = st * 80.0; // Increased frequency for finer grain
    float noiseVal = fbm(noiseCoord);
    
    // Create grain pattern
    float grain = noise(st * 150.0 + u_time * 0.05);
    
    // Combine noise and grain for pencil texture
    float textureBreakup = noiseVal + grain * 0.4;
    
    // Discard fragments below threshold for pencil texture gaps
    if (textureBreakup < 0.4) {
        discard;
    }
    
    // Apply texture breakup to alpha with smoothstep for softer edges
    float alpha = stroke.a * smoothstep(0.4, 0.8, textureBreakup);
    
    // Add some edge variation
    float edgeNoise = fbm(st * 40.0);
    alpha *= smoothstep(0.3, 0.9, edgeNoise);
    
    // Reduce overall alpha to make lines more subtle
    alpha *= 0.4; // Much more subtle overall
    
    gl_FragColor = vec4(u_color, alpha);
}
