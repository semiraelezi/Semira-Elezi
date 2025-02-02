import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Basic Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Aquarium Material
const aquariumMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x87ceeb,
    opacity: 0.3,
    transparent: true,
    roughness: 0.1,
    clearcoat: 1,
});

// Aquarium Dimensions
const aquariumWidth = 20;
const aquariumHeight = 10;
const aquariumDepth = 30;
const glassThickness = 0.2;

// Glass Walls
const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(aquariumWidth, aquariumHeight, glassThickness), aquariumMaterial);
frontGlass.position.z = aquariumDepth / 2;

const backGlass = new THREE.Mesh(new THREE.BoxGeometry(aquariumWidth, aquariumHeight, glassThickness), aquariumMaterial);
backGlass.position.z = -aquariumDepth / 2;

const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(glassThickness, aquariumHeight, aquariumDepth), aquariumMaterial);
leftGlass.position.x = -aquariumWidth / 2;

const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(glassThickness, aquariumHeight, aquariumDepth), aquariumMaterial);
rightGlass.position.x = aquariumWidth / 2;

const bottomGlass = new THREE.Mesh(new THREE.BoxGeometry(aquariumWidth, glassThickness, aquariumDepth), aquariumMaterial);
bottomGlass.position.y = -aquariumHeight / 2;

scene.add(frontGlass, backGlass, leftGlass, rightGlass, bottomGlass);

// Custom Water Shader
const waterGeometry = new THREE.PlaneGeometry(aquariumWidth, aquariumDepth, 256, 256);

const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 newPosition = position + vec3(0.0, sin(position.x * 2.0 + time) * 0.2, 0.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        void main() {
            float wave = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
            gl_FragColor = vec4(0.0, 0.5 + wave * 0.5, 1.0, 0.8);
        }
    `,
    uniforms: {
        time: { value: 0 },
    },
    transparent: true,
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = aquariumHeight / 2 - 0.1;
scene.add(water);

// Load Fish Models
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const fishTexture = textureLoader.load('./models/texture/01___12265_Fish_diffuse.jpg');

const fishPositions = [
    { x: -5, y: 0, z: -10 },
    { x: 3, y: -2, z: 5 },
    { x: -7, y: 3, z: 8 },
    { x: 5, y: -1, z: -5 },
];

function loadFishes() {
    gltfLoader.load(
        './models/scene.gltf',
        (gltf) => {
            const fish = gltf.scene;

            // Debug the material and explicitly apply the texture
            fish.traverse((node) => {
                if (node.isMesh) {
                    if (node.material) {
                        node.material.map = fishTexture; // Assign texture
                        node.material.needsUpdate = true;
                    }
                }
            });

            // Add multiple fish with unique positions
            fishPositions.forEach((pos) => {
                const fishClone = fish.clone(); // Clone the fish for each position
                fishClone.position.set(pos.x, pos.y, pos.z);
                fishClone.scale.set(0.5, 0.5, 0.5); // Adjust scale if necessary
                scene.add(fishClone);
            });
        },
        undefined,
        (error) => {
            console.error('Error loading fish model:', error);
        }
    );
}

// Call the function to load the fishes
loadFishes();

// Mouse Interaction for Ripples
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(water);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        const position = water.geometry.attributes.position;

        for (let i = 0; i < position.count; i++) {
            const dx = position.getX(i) - point.x;
            const dz = position.getZ(i) - point.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            const rippleEffect = Math.max(0, 1 - distance / 2);
            position.setY(i, rippleEffect);
        }
        position.needsUpdate = true;
    }
}
window.addEventListener('mousemove', onMouseMove);

// Camera Setup
camera.position.set(0, 15, 40);
camera.lookAt(0, 0, 0);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Update shader time
    waterMaterial.uniforms.time.value += 0.01;

    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
