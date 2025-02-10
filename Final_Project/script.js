// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Light blue background

// Load the background image
const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load('images/background.jpg'); // Path to your background image
scene.background = backgroundTexture; // Set the background of the scene

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20); // Adjust camera position to look at the tank

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(5, 5, 5);
scene.add(light1);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

// Load the tank model
const loader = new THREE.GLTFLoader();
let tank;
let waterMixer;
let fishArray = [];
let fishMixers = [];
let sandBoundingBox; // Add variable for sand bounding box

// Fish model variables
const fishModels = [
    { id: 'sharkButton', modelPath: 'models/Shark.glb', info: 'Shark: A powerful predator with sharp teeth, known for its speed and dominance in the ocean ecosystem.' },
    { id: 'nemoFishButton', modelPath: 'models/nemo_fish.glb', info: 'Clownfish: A small, vibrant orange fish with white stripes, often found living among sea anemones for protection.' },
    { id: 'tunaFishButton', modelPath: 'models/tuna_fish.glb', info: 'Tuna Fish: A strong, fast-swimming fish that migrates across oceans and is highly valued in seafood cuisine.' },
    { id: 'stylizedFishButton', modelPath: 'models/stylized_fish.glb', info: 'Blue Tetra: A small, freshwater fish with a shimmering blue body, known for its peaceful nature and popularity in aquariums.' },
];


// Function to initialize the fish buttons
function initFishButtons() {
    fishModels.forEach((fishModel) => {
        const button = document.getElementById(fishModel.id);
        button.addEventListener('click', () => {
            loadFish(fishModel.modelPath, fishModel.info); // Load the corresponding fish into the tank and show info
        });
    });
}

// Initialize the fish buttons
initFishButtons();

// Function to create a remove button for a specific fish type
function createRemoveButton(fishType) {
    const removeButton = document.createElement('div');
    removeButton.id = `remove${fishType}Button`;
    removeButton.className = 'fish-button';
    removeButton.textContent = `Remove ${fishType}`;
    removeButton.style.display = 'none'; // Initially hidden
    removeButton.addEventListener('click', () => {
        removeFish(fishType);
    });
    document.getElementById('fishButtonContainer').appendChild(removeButton);
}

// Function to remove a fish from the aquarium
function removeFish(fishType) {
    // Find the first fish of the specified type
    const fishToRemove = fishArray.find(fish => fish.userData.type === fishType);
    if (fishToRemove) {
        // Remove the fish from the scene and the fishArray
        scene.remove(fishToRemove);
        fishArray = fishArray.filter(fish => fish !== fishToRemove);

        // If there are no more fish of this type, hide the remove button
        const remainingFishOfType = fishArray.filter(fish => fish.userData.type === fishType);
        if (remainingFishOfType.length === 0) {
            document.getElementById(`remove${fishType}Button`).style.display = 'none';
        }
    }
}

// Load the tank and other models
loader.load('models/tank.glb', (gltf) => {
    tank = gltf.scene;
    tank.scale.set(8, 4.5, 8);
    tank.position.set(0, -2, 0);
    scene.add(tank);

    const waterGeometry = new THREE.BoxGeometry(15.5, 7, 15.5); // Adjust to fit inside the tank
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e90ff, // Water blue color
      transparent: true,
      opacity: 0.2, // Adjust transparency
      depthWrite: false
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.set(0, 2, 0); // Adjust to fit inside the tank
    scene.add(water);
    

    // Load water
    loader.load('models/water.glb', (gltf) => {
        const water = gltf.scene;
        water.scale.set(0.17, 0.17, 0.17);
        water.position.set(0, 5.5, 0);
        

        water.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.transparent = true;
                child.material.opacity = 1;
            }
        });

        scene.add(water);

        if (gltf.animations.length > 0) {
            waterMixer = new THREE.AnimationMixer(water);
            gltf.animations.forEach((clip) => {
                const action = waterMixer.clipAction(clip);
                action.play();
                action.timeScale = 0.3;
            });
        }
    });

    loader.load('models/sand.glb', (gltf) => {
        const sand = gltf.scene;
        sand.scale.set(0.42, 0.40, 0.32); // Adjust scale if needed
        sand.position.set(0, -1.5, -1.3); // Place it at the bottom

        scene.add(sand);

        // Create the bounding box for collision detection
        sandBoundingBox = new THREE.Box3().setFromObject(sand);
    });
});

// Function to generate a random position within the tank boundaries
function getRandomPosition() {
    return new THREE.Vector3(
        (Math.random() * 4 - 2), // X range: -2 to 2
        2, // Fixed Y
        (Math.random() * 4 - 2)  // Z range: -2 to 2
    );
}

// Function to load a fish into the aquarium
function loadFish(modelPath, fishInfo) {
    loader.load(modelPath, (gltf) => {
        const fish = gltf.scene;

        // Apply custom scaling based on the fish type
        switch (modelPath) {
            case 'models/Shark.glb':
                fish.scale.set(0.8, 0.8, 0.8); // Scale for shark
                fish.userData.type = 'Shark'; // Assign type for removal
                createRemoveButton('Shark');
                break;
            case 'models/nemo_fish.glb':
                fish.scale.set(0.02, 0.02, 0.02); // Scale for nemo fish
                fish.userData.type = 'Nemo Fish';
                createRemoveButton('Nemo Fish');
                break;
            case 'models/tuna_fish.glb':
                fish.scale.set(1, 1, 1); // Scale for tuna fish
                fish.userData.type = 'Tuna Fish';
                createRemoveButton('Tuna Fish');
                break;
            case 'models/stylized_fish.glb':
                fish.scale.set(0.2, 0.2, 0.2); // Scale for stylized fish
                fish.userData.type = 'Blue Tetra';
                createRemoveButton('Blue Tetra');
                break;
            default:
                fish.scale.set(0.5, 0.5, 0.5); // Default scale
        }

        fish.position.copy(getRandomPosition());
        fish.rotation.y += Math.random() * Math.PI * 2; // Random initial rotation
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

        // Show the fish info when it is loaded
        document.getElementById('info').textContent = fishInfo;
        document.getElementById('info').style.display = 'block';

        // Show the remove button for the corresponding fish type
        document.getElementById(`remove${fish.userData.type}Button`).style.display = 'block';
    }, undefined, (error) => {
        console.error('Error loading fish model:', error);
    });
}

// Function for smooth movement and turning
function moveFish(fish, delta) {
    const speed = 1.5;
    const turnSpeed = 1.5; // Controls turn smoothness

    // Move the fish forward
    fish.translateZ(speed * delta);

    // Define the tank boundaries
    const tankBounds = {
        minX: -4, // Left boundary
        maxX: 4,  // Right boundary
        minY: 1,  // Bottom boundary
        maxY: 5,  // Top boundary
        minZ: -4, // Back boundary
        maxZ: 4   // Front boundary
    };

    // Get the fish's current position
    const position = fish.position;

    // Check if the fish is outside the tank boundaries
    let needsTurn = false;
    let newDirection = new THREE.Vector3();

    if (position.x < tankBounds.minX || position.x > tankBounds.maxX) {
        // If the fish is outside the left or right boundary, turn it around
        newDirection.set(-Math.sign(position.x), 0, Math.random() - 0.5).normalize();
        needsTurn = true;
    }
    if (position.z < tankBounds.minZ || position.z > tankBounds.maxZ) {
        // If the fish is outside the front or back boundary, turn it around
        newDirection.set(Math.random() - 0.5, 0, -Math.sign(position.z)).normalize();
        needsTurn = true;
    }

    if (position.y < tankBounds.minY || position.y > tankBounds.maxY) {
        // Ensure the fish stays within the Y boundaries
        position.y = THREE.MathUtils.clamp(position.y, tankBounds.minY, tankBounds.maxY);
    }

    if (needsTurn) {
        // Smoothly turn the fish towards the new direction
        const targetQuaternion = new THREE.Quaternion();
        targetQuaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1), // Fish's forward direction
            newDirection
        );
        fish.quaternion.slerp(targetQuaternion, turnSpeed * delta);
    } else {
        // Randomly rotate the fish slightly for natural movement
        fish.rotation.y += (Math.random() - 0.5) * 0.1 * delta;
    }

    // Avoid collisions with other fish
    avoidCollisions(fish);

    // Check collision with the sand/rock model
    checkCollisionWithSand(fish);
}

// Collision avoidance function for the fish
function avoidCollisions(fish) {
    const minDistance = 1.5; // Minimum distance to keep between fish

    fishArray.forEach(otherFish => {
        if (otherFish !== fish) {
            const distance = fish.position.distanceTo(otherFish.position);

            if (distance < minDistance) {
                // Move away from the other fish
                const direction = new THREE.Vector3().subVectors(fish.position, otherFish.position).normalize();
                fish.position.addScaledVector(direction, 0.05); // Move slightly away
            }
        }
    });
}

// Function to check if a fish is inside the bounding box of the sand/rock
function checkCollisionWithSand(fish) {
    if (sandBoundingBox) {
        // If the fish is inside the bounding box, move it away
        if (sandBoundingBox.containsPoint(fish.position)) {
            const direction = new THREE.Vector3().subVectors(fish.position, sandBoundingBox.getCenter());
            fish.position.addScaledVector(direction, 0.1); // Move the fish out of the sand/rock
        }
    }
}


// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (waterMixer) {
        waterMixer.update(delta);
    }

    fishMixers.forEach((mixer) => {
        mixer.update(delta);
    });

    fishArray.forEach((fish) => {
        moveFish(fish, delta);
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});