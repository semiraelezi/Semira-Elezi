import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';

// Basic Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

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

// Realistic Water Surface
const waterGeometry = new THREE.PlaneGeometry(aquariumWidth, aquariumDepth);
const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/waternormals.jpg',
        (texture) => {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
    ),
    sunDirection: new THREE.Vector3(0, 1, 0),
    sunColor: 0xffffff,
    waterColor: 0x4682b4,
    distortionScale: 3.7,
    fog: false,
});

water.rotation.x = -Math.PI / 2;
water.position.y = aquariumHeight / 2 - 0.1;
scene.add(water);

// Camera Setup
camera.position.set(0, 15, 40);
camera.lookAt(0, 0, 0);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Water Animation
    water.material.uniforms['time'].value += 1.0 / 60.0;

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
