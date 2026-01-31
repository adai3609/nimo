// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 创建几何体
const geometry = new THREE.IcosahedronGeometry(1, 0);
const materials = [
    new THREE.MeshBasicMaterial({ color: 0xff0051, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x00ff83, wireframe: true })
];

// 创建多个网格对象
const meshes = [];
for (let i = 0; i < 10; i++) {
    const material = materials[i % materials.length];
    const mesh = new THREE.Mesh(geometry, material);
    
    // 随机位置
    mesh.position.x = (Math.random() - 0.5) * 10;
    mesh.position.y = (Math.random() - 0.5) * 10;
    mesh.position.z = (Math.random() - 0.5) * 10;
    
    // 随机缩放
    const scale = Math.random() * 0.5 + 0.2;
    mesh.scale.set(scale, scale, scale);
    
    // 存储初始位置用于动画
    mesh.userData = {
        originalPosition: mesh.position.clone(),
        speed: Math.random() * 0.01 + 0.005,
        rotationSpeed: {
            x: Math.random() * 0.02,
            y: Math.random() * 0.02,
            z: Math.random() * 0.02
        }
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
    
    // 更新每个网格的位置和旋转
    meshes.forEach(mesh => {
        // 旋转动画
        mesh.rotation.x += mesh.userData.rotationSpeed.x;
        mesh.rotation.y += mesh.userData.rotationSpeed.y;
        mesh.rotation.z += mesh.userData.rotationSpeed.z;
        
        // 波浪式浮动动画
        mesh.position.y = mesh.userData.originalPosition.y + Math.sin(Date.now() * 0.001 + mesh.userData.originalPosition.x) * 0.5;
        mesh.position.x = mesh.userData.originalPosition.x + Math.cos(Date.now() * 0.001 + mesh.userData.originalPosition.y) * 0.5;
    });
    
    renderer.render(scene, camera);
}

// 启动动画
animate();

// 添加鼠标交互
let mouseX = 0;
let mouseY = 0;
const targetX = 0;
const targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) / 100;
    mouseY = (event.clientY - windowHalfY) / 100;
});

// 相机跟随鼠标轻微移动
function moveCamera() {
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    requestAnimationFrame(moveCamera);
}

moveCamera();