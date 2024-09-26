// main.js

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 0.1, 100);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Player (Sphere)
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Generate colorful cubes (Collectibles)
const collectibles = [];
const collectibleGeometry = new THREE.BoxGeometry(1, 1, 1);

for (let i = 0; i < 50; i++) {
    const collectibleMaterial = new THREE.MeshStandardMaterial({
        color: Math.random() * 0xffffff,
        roughness: 0.5,
        metalness: 0.5,
    });
    const collectible = new THREE.Mesh(collectibleGeometry, collectibleMaterial);

    collectible.position.x = (Math.random() - 0.5) * 50;
    collectible.position.y = (Math.random() - 0.5) * 50;
    collectible.position.z = (Math.random() - 0.5) * 50;

    scene.add(collectible);
    collectibles.push(collectible);
}

// Controls
const keys = {};

document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Game Loop
function animate() {
    requestAnimationFrame(animate);

    // Player movement
    if (keys['ArrowUp'] || keys['KeyW']) player.position.z -= 0.1;
    if (keys['ArrowDown'] || keys['KeyS']) player.position.z += 0.1;
    if (keys['ArrowLeft'] || keys['KeyA']) player.position.x -= 0.1;
    if (keys['ArrowRight'] || keys['KeyD']) player.position.x += 0.1;
    if (keys['Space']) player.position.y += 0.1;
    if (keys['ShiftLeft'] || keys['ShiftRight']) player.position.y -= 0.1;

    // Rotate collectibles
    collectibles.forEach((collectible, index) => {
        collectible.rotation.x += 0.01;
        collectible.rotation.y += 0.01;

        // Collision detection
        if (player.position.distanceTo(collectible.position) < 1) {
            scene.remove(collectible);
            collectibles.splice(index, 1);
        }
    });

    // Camera follows player
    camera.position.lerp(
        new THREE.Vector3(
            player.position.x,
            player.position.y + 5,
            player.position.z + 10
        ),
        0.05
    );
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
