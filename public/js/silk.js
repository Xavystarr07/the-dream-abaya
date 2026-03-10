/* ============================================================
   THE DREAM ABAYA — silk.js
   Curtains.js WebGL Flowing Silk Background Effect
   
   HOW IT WORKS:
   - Creates a full-screen WebGL canvas behind all content
   - Renders a subtle animated silk-like flow using a custom shader
   - Falls back gracefully if WebGL is not available
   
   DEPENDENCY: Curtains.js loaded via CDN in index.ejs
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('silk-canvas');
  if (!canvas) return; // Only runs on pages with the silk canvas

  // Check for Curtains.js availability
  if (typeof Curtains === 'undefined') {
    console.warn('Curtains.js not loaded — silk effect skipped');
    return;
  }

  // Check for WebGL support
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not supported — silk effect skipped');
    return;
  }

  // ===========================================================
  //  VERTEX SHADER
  //  Moves the mesh vertices in a wave pattern to simulate silk
  // ===========================================================
  const silkVertexShader = `
    precision mediump float;

    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform float uTime;

    varying vec2 vTextureCoord;

    void main() {
      vec3 position = aVertexPosition;

      // Create a soft ripple displacement on X and Y axes
      float waveX = sin(position.y * 3.0 + uTime * 0.8) * 0.012;
      float waveY = cos(position.x * 2.5 + uTime * 0.6) * 0.008;

      position.x += waveX;
      position.y += waveY;

      gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
      vTextureCoord = aTextureCoord;
    }
  `;

  // ===========================================================
  //  FRAGMENT SHADER
  //  Renders a shimmering silk-like colour based on UV coords
  // ===========================================================
  const silkFragmentShader = `
    precision mediump float;

    varying vec2 vTextureCoord;

    uniform float uTime;

    // Gold color: #C5A059
    vec3 goldColor    = vec3(0.773, 0.627, 0.349);
    // Midnight color: #101820
    vec3 midnightColor = vec3(0.063, 0.094, 0.125);

    void main() {
      vec2 uv = vTextureCoord;

      // Create flowing diagonal gradient
      float flow = sin(uv.x * 4.0 + uTime * 0.5) * 0.5 + 0.5;
      float flow2 = cos(uv.y * 3.0 - uTime * 0.4) * 0.5 + 0.5;

      // Blend between midnight and a hint of gold
      vec3 color = mix(midnightColor, goldColor, (flow * flow2) * 0.3);

      // Add a sheen highlight
      float sheen = pow(max(0.0, sin(uv.x * 6.0 + uv.y * 4.0 + uTime * 1.2)), 8.0) * 0.4;
      color += vec3(sheen);

      // Keep it very subtle — opacity is controlled by CSS
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // ===========================================================
  //  INITIALIZE CURTAINS
  // ===========================================================
  try {
    const curtains = new Curtains({
      container: canvas,
      watchScroll: false,
      pixelRatio: Math.min(window.devicePixelRatio, 1.5) // cap for performance
    });

    // Handle WebGL context errors gracefully
    curtains.onError(() => {
      console.warn('Curtains.js WebGL error — silk effect disabled');
      canvas.style.display = 'none';
    });

    // Create a plane covering the full viewport
    const planeGeometry = {
      widthSegments:  20, // More segments = smoother silk wave
      heightSegments: 20
    };

    const uniforms = {
      time: {
        name: 'uTime',
        type: '1f',
        value: 0
      }
    };

    // We don't need a real HTML element — create a virtual plane
    // that fills the entire canvas background
    const planeElement = document.createElement('div');
    planeElement.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;';
    document.body.appendChild(planeElement);

    const plane = curtains.addPlane(planeElement, {
      vertexShader:   silkVertexShader,
      fragmentShader: silkFragmentShader,
      widthSegments:  planeGeometry.widthSegments,
      heightSegments: planeGeometry.heightSegments,
      uniforms
    });

    if (plane) {
      // Animate the silk on each frame
      plane.onRender(() => {
        plane.uniforms.time.value += 0.015;
      });
    }

  } catch (err) {
    console.warn('Silk effect initialization error:', err.message);
  }

});
