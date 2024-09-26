// script.js

// Initialize Scene, Camera, and Renderer
const scene = new THREE.Scene();

// Adjusted camera settings for better visuals
const camera = new THREE.PerspectiveCamera(
    45, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000  // Far clipping plane
);
camera.position.set(0, 2, 5); // Adjusted camera position

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Add Directional Light with adjustments
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Initialize OrbitControls for user manual 3D movement
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // For smooth interaction
controls.dampingFactor = 0.05;
controls.enableZoom = true; // Allow zooming
controls.target.set(0, 1, 0); // Adjust the target
controls.update();

// Load 3D Model
let model;
const loader = new THREE.GLTFLoader();

// Optional: Use DracoLoader for compressed models
/*
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
loader.setDRACOLoader(dracoLoader);
*/

loader.load(
    'assets/your-model.glb',
    function (gltf) {
        model = gltf.scene;
        model.position.set(0, 0, 0); // Adjust model position if needed
        scene.add(model);
    },
    undefined,
    function (error) {
        console.error('An error occurred while loading the model:', error);
    }
);

// Mouse Position Variables (for additional interactions)
let mouseX = 0, mouseY = 0;

// Event Listener for Mouse Movement (Optional: if you want to rotate model based on mouse)
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) - 0.5;
    mouseY = (event.clientY / window.innerHeight) - 0.5;
}, false);

// Touch Event Listeners for Mobile Responsiveness
document.addEventListener('touchmove', (event) => {
    if (event.touches.length === 1) {
        mouseX = (event.touches[0].clientX / window.innerWidth) - 0.5;
        mouseY = (event.touches[0].clientY / window.innerHeight) - 0.5;
    }
}, false);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate model based on mouse position (Optional)
    /*
    if (model) {
        model.rotation.y += (mouseX * 0.05 - model.rotation.y) * 0.1;
        model.rotation.x += (mouseY * 0.05 - model.rotation.x) * 0.1;
    }
    */

    controls.update(); // Update OrbitControls
    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
