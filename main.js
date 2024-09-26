// main.js

// Global variables for game state
let scene, camera, renderer;
let player;
let collectibles = [];
let enemies = [];
let keys = {};
let score = 0;
let timeLeft = 60; // 1 minute timer
let gameStarted = false;
let gameOver = false;

// DOM elements
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const gameUI = document.getElementById('gameUI');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

// Event listener for the start button
startButton.addEventListener('click', startGame);

function startGame() {
    startScreen.style.display = 'none';
    gameUI.style.display = 'block';
    gameStarted = true;
    init();
    animate();
    startTimer();
}

// Initialize the game
function init() {
    // Set up the scene, camera, and renderer
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 0.1, 150);

    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 5, 15);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Environment Map for Reflective Materials
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const environmentMap = cubeTextureLoader.load([
        'https://threejs.org/examples/textures/cube/Bridge2/posx.jpg',
        'https://threejs.org/examples/textures/cube/Bridge2/negx.jpg',
        'https://threejs.org/examples/textures/cube/Bridge2/posy.jpg',
        'https://threejs.org/examples/textures/cube/Bridge2/negy.jpg',
        'https://threejs.org/examples/textures/cube/Bridge2/posz.jpg',
        'https://threejs.org/examples/textures/cube/Bridge2/negz.jpg',
    ]);
    scene.background = environmentMap;

    // Lights
    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Additional Point Lights
    const pointLight1 = new THREE.PointLight(0xff0000, 0.5, 50);
    pointLight1.position.set(-25, 10, -25);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0000ff, 0.5, 50);
    pointLight2.position.set(25, 10, 25);
    scene.add(pointLight2);

    // Load GLB Model as Player
    const loader = new THREE.GLTFLoader();

    loader.load(
        'assets/your-asset.glb',
        function (gltf) {
            player = gltf.scene;
            player.scale.set(1, 1, 1);
            scene.add(player);
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );

    // Generate Reflective Collectibles (Colorful Cubes)
    const collectibleGeometry = new THREE.BoxGeometry(1, 1, 1);

    const collectibleMaterial = new THREE.MeshStandardMaterial({
        envMap: environmentMap,
        metalness: 1,
        roughness: 0,
    });

    for (let i = 0; i < 50; i++) {
        const cubeMaterial = collectibleMaterial.clone();
        cubeMaterial.color = new THREE.Color(Math.random() * 0xffffff);

        const collectible = new THREE.Mesh(collectibleGeometry, cubeMaterial);

        collectible.position.x = (Math.random() - 0.5) * 100;
        collectible.position.y = (Math.random() - 0.5) * 50;
        collectible.position.z = (Math.random() - 0.5) * 100;

        scene.add(collectible);
        collectibles.push(collectible);
    }

    // Enemy Cubes
    const enemyGeometry = new THREE.BoxGeometry(2, 2, 2);
    const enemyMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        envMap: environmentMap,
        metalness: 0.8,
        roughness: 0.2,
    });

    for (let i = 0; i < 20; i++) {
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial.clone());

        enemy.position.x = (Math.random() - 0.5) * 100;
        enemy.position.y = (Math.random() - 0.5) * 50;
        enemy.position.z = (Math.random() - 0.5) * 100;

        enemy.userData.floatSpeed = Math.random() * 0.02 + 0.01;
        enemy.userData.floatDirection = 1;

        scene.add(enemy);
        enemies.push(enemy);
    }

    // Controls
    document.addEventListener('keydown', (event) => {
        keys[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.code] = false;
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Timer function
function startTimer() {
    const timerInterval = setInterval(() => {
        if (!gameStarted || gameOver) {
            clearInterval(timerInterval);
            return;
        }

        timeLeft--;
        timerDisplay.textContent = `Time Left: ${timeLeft}`;

        if (timeLeft <= 0) {
            gameOver = true;
            timerDisplay.textContent = `Time Left: 0`;
            endGame();
            clearInterval(timerInterval);
        }
    }, 1000);
}

// Game over function
function endGame() {
    alert(`Game Over! Your score is ${score}.`);
    // Optionally, reset the game or navigate to a different screen
    location.reload(); // Reload the page to restart
}

// Game Loop
function animate() {
    if (!gameStarted || gameOver) return;

    requestAnimationFrame(animate);

    // Wait for player to load
    if (!player) return;

    // Player movement
    if (keys['ArrowUp'] || keys['KeyW']) player.position.z -= 0.5;
    if (keys['ArrowDown'] || keys['KeyS']) player.position.z += 0.5;
    if (keys['ArrowLeft'] || keys['KeyA']) player.position.x -= 0.5;
    if (keys['ArrowRight'] || keys['KeyD']) player.position.x += 0.5;
    if (keys['Space']) player.position.y += 0.5;
    if (keys['ShiftLeft'] || keys['ShiftRight']) player.position.y -= 0.5;

    // Rotate collectibles
    collectibles.forEach((collectible, index) => {
        collectible.rotation.x += 0.01;
        collectible.rotation.y += 0.01;

        // Collision detection
        if (player.position.distanceTo(collectible.position) < 2) {
            scene.remove(collectible);
            collectibles.splice(index, 1);
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        }
    });

    // Update enemies
    enemies.forEach((enemy) => {
        // Float up and down
        enemy.position.y += enemy.userData.floatSpeed * enemy.userData.floatDirection;

        if (enemy.position.y > 20 || enemy.position.y < -20) {
            enemy.userData.floatDirection *= -1;
        }

        // Rotate
        enemy.rotation.y += 0.01;

        // Collision detection with player
        if (player.position.distanceTo(enemy.position) < 3) {
            // Handle collision (e.g., end game)
            gameOver = true;
            endGame();
        }
    });

    // Camera follows player
    camera.position.lerp(
        new THREE.Vector3(
            player.position.x,
            player.position.y + 5,
            player.position.z + 15
        ),
        0.1
    );
    camera.lookAt(player.position);

    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
