// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f8ff); // 亮色背景 (AliceBlue)

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);
camera.lookAt(0, 0, 0);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 创建金属质感的小卡片
const cardGroup = new THREE.Group();
scene.add(cardGroup);

// 卡片参数
const rows = 20;
const cols = 20;
const spacing = 1.2;

// 创建金属质感材质
const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x444444,
    emissiveIntensity: 0.1
});

// 创建波浪效果的卡片网格
const cards = [];
for (let row = 0; row < rows; row++) {
    cards[row] = [];
    for (let col = 0; col < cols; col++) {
        // 计算位置
        const x = (col - cols / 2) * spacing;
        const z = (row - rows / 2) * spacing;
        
        // 创建卡片（矩形平面）
        const geometry = new THREE.PlaneGeometry(0.9, 0.9);
        const card = new THREE.Mesh(geometry, metalMaterial);
        
        // 旋转卡片使其垂直站立
        card.rotation.x = -Math.PI / 2;
        
        // 设置初始位置
        card.position.set(x, 0, z);
        
        // 存储原始位置和波浪参数
        card.userData = {
            originalX: x,
            originalY: 0,
            originalZ: z,
            waveOffset: (row + col) * 0.2 // 波浪偏移
        };
        
        card.castShadow = true;
        card.receiveShadow = true;
        
        cardGroup.add(card);
        cards[row][col] = card;
    }
}

// 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// 添加主要光源
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 添加补充光源
const backLight = new THREE.DirectionalLight(0xffffff, 0.4);
backLight.position.set(-10, -10, -10);
scene.add(backLight);

// 处理窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.002; // 时间变量
    
    // 更新每个卡片以实现波浪效果
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const card = cards[row][col];
            
            // 计算波浪效果
            // 使用正弦和余弦函数创建更自然的波浪
            const wave1 = Math.sin(time + card.userData.waveOffset) * 1.5;
            const wave2 = Math.cos(time * 0.7 + card.userData.waveOffset * 1.3) * 1.2;
            
            // 组合波浪效果
            const height = wave1 + wave2;
            
            // 应用波浪效果到Y坐标
            card.position.y = height;
            
            // 可选：添加轻微的旋转效果以增强波浪感
            card.rotation.z = Math.sin(time * 0.8 + card.userData.waveOffset) * 0.1;
            card.rotation.x = -Math.PI / 2 + Math.cos(time * 0.6 + card.userData.waveOffset) * 0.05;
        }
    }
    
    // 缓慢旋转整个卡片组
    cardGroup.rotation.y = time * 0.05;
    
    renderer.render(scene, camera);
}

// 启动动画
animate();

// 添加鼠标交互
document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX - window.innerWidth / 2) / 100;
    const mouseY = (event.clientY - window.innerHeight / 2) / 100;
    
    // 相机轻微跟随鼠标
    camera.position.x = mouseX * 2;
    camera.position.y = 15 - mouseY;
    camera.lookAt(0, 0, 0);
});