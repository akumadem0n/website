// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Fog for atmosphere
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.002);

// Player controls
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
camera.position.set(0, 5, 0);
document.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => document.getElementById('instructions').style.display = 'none');
controls.addEventListener('unlock', () => document.getElementById('instructions').style.display = 'block');

// Movement variables
const moveSpeed = 0.5;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': moveUp = true; break;
        case 'ShiftLeft': moveDown = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
        case 'Space': moveUp = false; break;
        case 'ShiftLeft': moveDown = false; break;
    }
});

// Spaceship (placeholder, replace with GLTF model)
const shipGeometry = new THREE.BoxGeometry(2, 1, 3);
const shipMaterial = new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 100 });
const ship = new THREE.Mesh(shipGeometry, shipMaterial);
ship.position.copy(camera.position);
ship.position.y -= 2; // Below camera for third-person feel
scene.add(ship);

// Asteroids
const asteroids = [];
const asteroidGeometry = new THREE.DodecahedronGeometry(2, 0);
const asteroidMaterial = new THREE.MeshLambertMaterial({ color: 0x8c5523 });
for (let i = 0; i < 50; i++) {
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.set(
        Math.random() * 500 - 250,
        Math.random() * 500 - 250,
        Math.random() * 500 - 250
    );
    asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    asteroids.push(asteroid);
    scene.add(asteroid);
}

// Resource Crystals
const crystals = [];
const crystalGeometry = new THREE.OctahedronGeometry(0.5, 0);
const crystalMaterial = new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x00aaaa });
for (let i = 0; i < 20; i++) {
    const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
    crystal.position.set(
        Math.random() * 500 - 250,
        Math.random() * 500 - 250,
        Math.random() * 500 - 250
    );
    crystals.push({ mesh: crystal, light: new THREE.PointLight(0x00ffff, 1, 10) });
    crystals[i].light.position.copy(crystal.position);
    scene.add(crystal);
    scene.add(crystals[i].light);
}

// Enemy Drones
const enemies = [];
const enemyGeometry = new THREE.ConeGeometry(1, 2, 8);
const enemyMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444 });
for (let i = 0; i < 5; i++) {
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(
        Math.random() * 500 - 250,
        Math.random() * 500 - 250,
        Math.random() * 500 - 250
    );
    enemies.push(enemy);
    scene.add(enemy);
}

// Space Station (placeholder, replace with GLTF model)
const stationGeometry = new THREE.SphereGeometry(20, 32, 32);
const stationMaterial = new THREE.MeshPhongMaterial({ color: 0x6666ff });
const station = new THREE.Mesh(stationGeometry, stationMaterial);
station.position.set(200, 0, 200);
scene.add(station);

// Particle System (Stars)
const starGeometry = new THREE.BufferGeometry();
const starCount = 10000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = Math.random() * 1000 - 500;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Score
let score = 0;
const scoreElement = document.getElementById('score');

// Collision Detection Helper
function checkCollision(pos, objects, threshold) {
    for (let obj of objects) {
        if (pos.distanceTo(obj.position) < threshold) return obj;
    }
    return null;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Player Movement
    const forward = new THREE.Vector3();
    controls.getDirection(forward);
    const side = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
    let dx = 0, dy = 0, dz = 0;

    if (moveForward) { dx += forward.x * moveSpeed; dz += forward.z * moveSpeed; }
    if (moveBackward) { dx -= forward.x * moveSpeed; dz -= forward.z * moveSpeed; }
    if (moveLeft) { dx -= side.x * moveSpeed; dz -= side.z * moveSpeed; }
    if (moveRight) { dx += side.x * moveSpeed; dz += side.z * moveSpeed; }
    if (moveUp) dy += moveSpeed;
    if (moveDown) dy -= moveSpeed;

    const newPos = camera.position.clone().add(new THREE.Vector3(dx, dy, dz));
    if (!checkCollision(newPos, asteroids, 5)) {
        camera.position.copy(newPos);
        ship.position.set(newPos.x, newPos.y - 2, newPos.z);
        ship.rotation.y = -controls.getAzimuthalAngle();
    }

    // Crystal Collection
    crystals.forEach((crystal, i) => {
        crystal.mesh.rotation.y += 0.05;
        if (camera.position.distanceTo(crystal.mesh.position) < 3) {
            scene.remove(crystal.mesh);
            scene.remove(crystal.light);
            crystals.splice(i, 1);
            score += 10;
            scoreElement.textContent = `Score: ${score}`;
        }
    });

    // Enemy AI
    enemies.forEach(enemy => {
        const direction = camera.position.clone().sub(enemy.position).normalize();
        enemy.position.add(direction.multiplyScalar(0.1));
        enemy.lookAt(camera.position);
        if (camera.position.distanceTo(enemy.position) < 3) {
            alert('Game Over! Enemy caught you.');
            // Reset game logic here
        }
    });

    // Goal Check
    if (camera.position.distanceTo(station.position) < 25) {
        alert(`You reached the station! Final Score: ${score}`);
        // Reset game logic here
    }

    renderer.render(scene, camera);
}
animate();

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});