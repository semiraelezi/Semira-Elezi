// 816, LIBRARY, CONVICT 

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from 'gsap';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);


const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x006400 });  // green for grass
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });   // gray for road


const grass = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), grassMaterial);
grass.rotation.x = - Math.PI / 2;
grass.position.y = -0.1;  
scene.add(grass);

// Main road area
const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 100), roadMaterial);
road.rotation.x = - Math.PI / 2;
road.position.set(5, 0, 0);  
scene.add(road);


//Convict
const pastelOrangePink = "#f8a5a5";
const building816 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 11, 39), new THREE.MeshBasicMaterial({ color: pastelOrangePink }));
building816.position.set(29, 5.5, -25);  
building816.rotation.y = Math.PI / 4;  
scene.add(building816);

//Library
const pastelGrey = "#C4C4C4";
const library = new THREE.Mesh(new THREE.BoxGeometry(15.5, 10, 30), new THREE.MeshBasicMaterial({ color: pastelGrey }));
library.position.set(-15, 2.5, 10);
scene.add(library);


 //Object 816
const pastelBlue = "#ADD8E6";
const convictBuilding = new THREE.Mesh(new THREE.BoxGeometry(8.5, 11, 20), new THREE.MeshBasicMaterial({ color: pastelBlue }));
convictBuilding.position.set(21, 5.5, 30);
scene.add(convictBuilding);

// Trees
function createTree(x, z) {
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // Brown trunk
    const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 }); // Green leaves

    
    const trunkHeight = 6;  
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, trunkHeight), trunkMaterial); 
    trunk.position.set(x, trunkHeight / 2, z); 

    
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(4), leafMaterial); 
    leaves.position.set(x, trunkHeight + 2, z);

    scene.add(trunk);
    scene.add(leaves);
}

createTree(-13, 40);
createTree(-5, -20);
createTree(-15,-30);
createTree(-10, -10);

// Diagonal Road
const connectingRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), roadMaterial);
connectingRoad.rotation.x = -Math.PI / 2;
connectingRoad.rotation.z = Math.PI / 4;
connectingRoad.position.set(27, 0.1, 0);
scene.add(connectingRoad);

// Animated cylinder
const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 32), new THREE.MeshBasicMaterial({ color: 0x000080 }));
cylinder.position.set(0, 1.5, 0);  
scene.add(cylinder);

const timeline = gsap.timeline({ repeat: -1, yoyo: true });  

// Adjusted positions for each road segment to avoid collisions
timeline.to(cylinder.position, { x: 5, z: 40, duration: 3 })            
        .to(cylinder.position, { x: 15, z: 15, duration: 3 })           
        .to(cylinder.position, { x: 27, z: -5, duration: 3 })           
        .to(cylinder.position, { x: 5, z: -40, duration: 3 })           
        .to(cylinder.position, { x: 0, z: 0, duration: 3 });            

camera.position.set(0, 50, 50);
controls.update();


function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
