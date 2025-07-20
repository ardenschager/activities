precision mediump float;
varying vec2 v_texCoord;
// uniform sampler2D u_texture;
// uniform vec4 u_color;

void main() {
    // vec4 texColor = texture2D(u_texture, v_texCoord);
    // gl_FragColor = vec4(u_color.rgb, texColor.r); 
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // red
}