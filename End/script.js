// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light blue background

// Load the background image
const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load('images/background.jpg'); // Path to your background image
scene.background = backgroundTexture; // Set the background of the scene

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20); // Adjust camera position to look at the tank

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting setup
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(5, 5, 5);
scene.add(light1);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// OrbitControls setup
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

// GLTFLoader for models
const loader = new THREE.GLTFLoader();
let tank, waterMixer, sandBoundingBox;
let fishArray = [];
let fishMixers = [];

// Fish models data
const fishModels = [
    { id: 'sharkButton', modelPath: 'models/Shark.glb', info: 'Shark: A powerful predator with sharp teeth.' },
    { id: 'nemoFishButton', modelPath: 'models/nemo_fish.glb', info: 'Clownfish: Small and vibrant with white stripes.' },
    { id: 'tunaFishButton', modelPath: 'models/tuna_fish.glb', info: 'Tuna Fish: Fast-swimming and migratory.' },
    { id: 'stylizedFishButton', modelPath: 'models/stylized_fish.glb', info: 'Blue Tetra: Small, peaceful freshwater fish.' },
];

// Initialize fish buttons
function initFishButtons() {
    fishModels.forEach((fishModel) => {
        const button = document.getElementById(fishModel.id);
        button.addEventListener('click', () => {
            loadFish(fishModel.modelPath, fishModel.info); // Load the corresponding fish and show info
        });
    });
}

initFishButtons(); // Initialize the buttons

// Create remove button for fish type
function createRemoveButton(fishType) {
    const removeButton = document.createElement('div');
    removeButton.id = `remove${fishType}Button`; // Corrected string concatenation
    removeButton.className = 'fish-button';
    removeButton.textContent = `Remove ${fishType}`;
    removeButton.style.display = 'none'; // Initially hidden
    removeButton.addEventListener('click', () => {
        removeFish(fishType);
    });
    document.getElementById('fishButtonContainer').appendChild(removeButton);
}

// Remove fish from the scene
function removeFish(fishType) {
    const fishToRemove = fishArray.find(fish => fish.userData.type === fishType);
    if (fishToRemove) {
        scene.remove(fishToRemove);
        fishArray = fishArray.filter(fish => fish !== fishToRemove);
        
        // Hide remove button if no more fish of this type
        const remainingFish = fishArray.filter(fish => fish.userData.type === fishType);
        if (remainingFish.length === 0) {
            document.getElementById(`remove${fishType}Button`).style.display = 'none';
        }
    }
}

// Load the tank model
loader.load('models/tank.glb', (gltf) => {
    tank = gltf.scene;
    tank.scale.set(8, 4.5, 8);
    tank.position.set(0, -2, 0);
    scene.add(tank);

    // Water setup
    const waterGeometry = new THREE.BoxGeometry(15.5, 7, 15.5);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e90ff, // Water color
        transparent: true,
        opacity: 0.2,
        depthWrite: false
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.set(0, 2, 0);
    scene.add(water);

    // Store the water mesh for later color updates
    window.waterMesh = water;

    // Load water animation model
    loader.load('models/water.glb', (gltf) => {
        const waterAnim = gltf.scene;
        waterAnim.scale.set(0.17, 0.17, 0.17);
        waterAnim.position.set(0, 5.5, 0);

        scene.add(waterAnim);
        if (gltf.animations.length > 0) {
            waterMixer = new THREE.AnimationMixer(waterAnim);
            gltf.animations.forEach((clip) => {
                const action = waterMixer.clipAction(clip);
                action.play();
                action.timeScale = 0.3;
            });
        }
    });

    // Load sand model
    loader.load('models/sand.glb', (gltf) => {
        const sand = gltf.scene;
        sand.scale.set(0.42, 0.40, 0.32);
        sand.position.set(0, -1.5, -1.3);
        scene.add(sand);

        sandBoundingBox = new THREE.Box3().setFromObject(sand); // Collision detection box
    });
});

// Generate random position for fish within the tank
function getRandomPosition() {
    return new THREE.Vector3(
        (Math.random() * 4 - 2), // X range: -2 to 2
        2, // Fixed Y
        (Math.random() * 4 - 2)  // Z range: -2 to 2
    );
}

// Load fish into the aquarium
function loadFish(modelPath, fishInfo) {
    loader.load(modelPath, (gltf) => {
        const fish = gltf.scene;
        let fishType;

        // Customize fish size and type
        switch (modelPath) {
            case 'models/Shark.glb':
                fish.scale.set(0.8, 0.8, 0.8);
                fishType = 'Shark';
                break;
            case 'models/nemo_fish.glb':
                fish.scale.set(0.02, 0.02, 0.02);
                fishType = 'Nemo Fish';
                break;
            case 'models/tuna_fish.glb':
                fish.scale.set(1, 1, 1);
                fishType = 'Tuna Fish';
                break;
            case 'models/stylized_fish.glb':
                fish.scale.set(0.2, 0.2, 0.2);
                fishType = 'Blue Tetra';
                break;
            default:
                fish.scale.set(0.5, 0.5, 0.5); // Default scale
                fishType = 'Generic Fish';
        }

        fish.userData.type = fishType;
        createRemoveButton(fishType);
        fish.position.copy(getRandomPosition());
        fish.rotation.y += Math.random() * Math.PI * 2;
        scene.add(fish);
        fishArray.push(fish);

        if (gltf.animations.length > 0) {
            const fishMixer = new THREE.AnimationMixer(fish);
            gltf.animations.forEach((clip) => {
                const action = fishMixer.clipAction(clip);
                action.play();
            });
            fishMixers.push(fishMixer);
        }

        // Show info about the fish
        document.getElementById('info').textContent = fishInfo;
        document.getElementById('info').style.display = 'block';

        // Show the remove button for the fish type
        document.getElementById(`remove${fishType}Button`).style.display = 'block';
    }, undefined, (error) => {
        console.error('Error loading fish model:', error);
    });
}

// Smooth fish movement and turning
function moveFish(fish, delta) {
    const speed = 1.5;
    const turnSpeed = 1.5; // Turning speed

    // Move the fish forward
    fish.translateZ(speed * delta);

    const tankBounds = { minX: -4, maxX: 4, minY: 1, maxY: 5, minZ: -4, maxZ: 4 }; // Tank boundaries
    const position = fish.position;
    let needsTurn = false;
    let newDirection = new THREE.Vector3();

    // Boundary checking and turning
    if (position.x < tankBounds.minX || position.x > tankBounds.maxX) {
        newDirection.set(-Math.sign(position.x), 0, Math.random() - 0.5).normalize();
        needsTurn = true;
    }
    if (position.z < tankBounds.minZ || position.z > tankBounds.maxZ) {
        newDirection.set(Math.random() - 0.5, 0, -Math.sign(position.z)).normalize();
        needsTurn = true;
    }

    if (position.y < tankBounds.minY || position.y > tankBounds.maxY) {
        position.y = THREE.MathUtils.clamp(position.y, tankBounds.minY, tankBounds.maxY); // Y axis boundary check
    }

    if (needsTurn) {
        const targetQuaternion = new THREE.Quaternion();
        targetQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), newDirection);
        fish.quaternion.slerp(targetQuaternion, turnSpeed * delta);
    } else {
        fish.rotation.y += Math.random() * 0.01;
    }
}

// Update loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (waterMixer) waterMixer.update(delta);
    if (fishMixers) fishMixers.forEach(mixer => mixer.update(delta));

    fishArray.forEach(fish => moveFish(fish, delta));

    controls.update();
    renderer.render(scene, camera);
}

// Start the animation loop
const clock = new THREE.Clock();
animate();

// Water color change functionality
const waterColorPicker = document.getElementById('waterColorPicker');
const waterColorButton = document.getElementById('waterColorButton');

waterColorButton.addEventListener('click', () => {
    waterColorPicker.style.display = 'block'; // Show color picker
});

waterColorPicker.addEventListener('input', (event) => {
    const color = event.target.value;
    if (window.waterMesh) {
        window.waterMesh.material.color.set(color); // Update water color
    }
});
