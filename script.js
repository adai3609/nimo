// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 创建更多几何体以实现密集效果
const geometries = [
    new THREE.IcosahedronGeometry(0.3, 0),
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TetrahedronGeometry(0.3, 0)
];

const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0051, wireframe: true, transparent: true, opacity: 0.8 }),
    new THREE.MeshBasicMaterial({ color: 0x00ff83, wireframe: true, transparent: true, opacity: 0.8 }),
    new THREE.MeshBasicMaterial({ color: 0x2ecc71, wireframe: true, transparent: true, opacity: 0.8 }),
    new THREE.MeshBasicMaterial({ color: 0x3498db, wireframe: true, transparent: true, opacity: 0.8 }),
    new THREE.MeshBasicMaterial({ color: 0x9b59b6, wireframe: true, transparent: true, opacity: 0.8 })
];

// 创建大量网格对象以实现密集效果
const meshes = [];
const totalMeshes = 300; // 增加数量以实现密集感

for (let i = 0; i < totalMeshes; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    const mesh = new THREE.Mesh(geometry, material);
    
    // 随机位置，形成球形分布
    const radius = 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    mesh.position.set(x, y, z);
    
    // 存储初始位置用于动画
    mesh.userData = {
        originalPosition: mesh.position.clone(),
        speed: Math.random() * 0.005 + 0.002,
        rotationSpeed: {
            x: Math.random() * 0.02,
            y: Math.random() * 0.02,
            z: Math.random() * 0.02
        },
        breathOffset: Math.random() * Math.PI * 2, // 用于呼吸效果的偏移
        breathScale: Math.random() * 0.5 + 0.5 // 呼吸幅度
    };
    
    scene.add(mesh);
    meshes.push(mesh);
}

// 添加光源
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 处理窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001; // 时间变量用于同步动画
    
    // 更新每个网格的位置、旋转和缩放
    meshes.forEach(mesh => {
        // 旋转动画
        mesh.rotation.x += mesh.userData.rotationSpeed.x;
        mesh.rotation.y += mesh.userData.rotationSpeed.y;
        mesh.rotation.z += mesh.userData.rotationSpeed.z;
        
        // 呼吸效果 - 让物体周期性缩放
        const breathEffect = 1 + Math.sin(time * 2 + mesh.userData.breathOffset) * 0.2 * mesh.userData.breathScale;
        mesh.scale.set(breathEffect, breathEffect, breathEffect);
        
        // 微小的位置扰动，模拟蚂蚁爬行的感觉
        const disturbance = 0.5;
        mesh.position.x = mesh.userData.originalPosition.x + Math.sin(time * 0.5 + mesh.userData.breathOffset) * disturbance;
        mesh.position.y = mesh.userData.originalPosition.y + Math.cos(time * 0.5 + mesh.userData.breathOffset) * disturbance;
        mesh.position.z = mesh.userData.originalPosition.z + Math.sin(time * 0.3 + mesh.userData.breathOffset) * disturbance;
    });
    
    renderer.render(scene, camera);
}

// 启动动画
animate();

// 添加鼠标交互
let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
});

// 相机跟随鼠标轻微移动
function moveCamera() {
    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    requestAnimationFrame(moveCamera);
}

moveCamera();