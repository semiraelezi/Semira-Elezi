import * as THREE from 'three';
import gsap from 'gsap';

const scene = new THREE.Scene();


const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth/window.innerHeight,
    0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.getElementById("scene").appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry (1,1,1);
    const material = new THREE.MeshBasicMaterial({color:0x00ff00});
    const cube = new THREE.Mesh(geometry,material);

    scene.add(cube);

    cube.position.x = -2;
    camera.position.z = 5;

    gsap.to(cube.position, {duration:2, x:2, repeat:-1, yoyo:true});

    // Function for rotation
    const rotateCube = () => {
    cube.rotation.x += 0.03; 
    cube.rotation.y += 0.03;
};

    const tick = ()=>{
        rotateCube(); 
        console.log("A");
        renderer.render(scene,camera);
        requestAnimationFrame(tick);

    }
    tick();