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
// Enable gamma correction for accurate color representation
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Initialize PMREMGenerator
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Parameters for GUI controls
const params = {
    envMapIntensity: 1.0,
    metalness: 0.5,
    roughness: 0.5,
    exposure: 1.0,
    background: true
};

// Load HDR Environment Map
const rgbeLoader = new THREE.RGBELoader();
rgbeLoader.setDataType(THREE.UnsignedByteType); // Ensure correct data type

rgbeLoader.load(
    'assets/your-hdr.hdr', // Path to your HDR image
    function (hdrTexture) {
        // Process HDR texture with PMREMGenerator
        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

        // Set the scene's environment map
        scene.environment = envMap;

        // Set as background if desired
        if (params.background) {
            scene.background = envMap;
        }

        // Clean up
        hdrTexture.dispose();
        pmremGenerator.dispose();

        // Load 3D Model after environment map is ready
        loadModel();
    },
    undefined,
    function (error) {
        console.error('An error occurred while loading the HDR:', error);
    }
);

// Function to load the 3D model
let model;
function loadModel() {
    const loader = new THREE.GLTFLoader();

    loader.load(
        'assets/your-model.glb',
        function (gltf) {
            model = gltf.scene;

            // Adjust materials to use the environment map
            model.traverse((node) => {
                if (node.isMesh) {
                    const material = node.material;
                    if (material && material.isMeshStandardMaterial) {
                        material.envMap = scene.environment;
                        material.envMapIntensity = params.envMapIntensity;
                        material.metalness = params.metalness;
                        material.roughness = params.roughness;
                        material.needsUpdate = true;
                    }
                }
            });

            scene.add(model);

            // Create GUI controls after model is loaded
            createGUI();
        },
        undefined,
        function (error) {
            console.error('An error occurred while loading the model:', error);
        }
    );
}

// Function to create GUI controls
function createGUI() {
    const gui = new dat.GUI();

    gui.add(params, 'envMapIntensity', 0, 5).onChange(function (value) {
        model.traverse((node) => {
            if (node.isMesh && node.material.isMeshStandardMaterial) {
                node.material.envMapIntensity = value;
            }
        });
    });

    gui.add(params, 'metalness', 0, 1).onChange(function (value) {
        model.traverse((node) => {
            if (node.isMesh && node.material.isMeshStandardMaterial) {
                node.material.metalness = value;
            }
        });
    });

    gui.add(params, 'roughness', 0, 1).onChange(function (value) {
        model.traverse((node) => {
            if (node.isMesh && node.material.isMeshStandardMaterial) {
                node.material.roughness = value;
            }
        });
    });

    gui.add(params, 'exposure', 0, 2).onChange(function (value) {
        renderer.toneMappingExposure = value;
    });

    gui.add(params, 'background').onChange(function (value) {
        scene.background = value ? scene.environment : null;
    });
}

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

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

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
