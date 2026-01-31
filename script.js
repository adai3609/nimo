// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.LinearGradient(0.1, 0.1, 0.2, 0.2, 0.3, 0.4); // 深色渐变背景
// 创建渐变背景
const canvas = document.createElement('canvas');
canvas.width = 1;
canvas.height = 1;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#0a0a1a';
ctx.fillRect(0, 0, 1, 1);
const texture = new THREE.CanvasTexture(canvas);
scene.background = texture;

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 30);
camera.lookAt(0, 0, 0);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// 创建卡片对象系统
const cardGroup = new THREE.Group();
scene.add(cardGroup);

// 卡片参数
const rows = 25;
const cols = 25;
const spacing = 1.0;

// 创建半透明材质
const materials = [
    new THREE.MeshPhysicalMaterial({
        color: 0x8a8aff, // 淡蓝色
        transparent: true,
        opacity: 0.7,
        metalness: 0.2,
        roughness: 0.4,
        reflectivity: 0.3,
        clearcoat: 0.5,
        side: THREE.DoubleSide
    }),
    new THREE.MeshPhysicalMaterial({
        color: 0xaa8aff, // 淡紫色
        transparent: true,
        opacity: 0.7,
        metalness: 0.2,
        roughness: 0.4,
        reflectivity: 0.3,
        clearcoat: 0.5,
        side: THREE.DoubleSide
    }),
    new THREE.MeshPhysicalMaterial({
        color: 0x8affc3, // 淡绿色
        transparent: true,
        opacity: 0.7,
        metalness: 0.2,
        roughness: 0.4,
        reflectivity: 0.3,
        clearcoat: 0.5,
        side: THREE.DoubleSide
    }),
    new THREE.MeshPhysicalMaterial({
        color: 0xffb38a, // 淡橙色
        transparent: true,
        opacity: 0.7,
        metalness: 0.2,
        roughness: 0.4,
        reflectivity: 0.3,
        clearcoat: 0.5,
        side: THREE.DoubleSide
    })
];

// 创建波浪效果的卡片网格
const cards = [];
for (let row = 0; row < rows; row++) {
    cards[row] = [];
    for (let col = 0; col < cols; col++) {
        // 计算位置
        const x = (col - cols / 2) * spacing;
        const z = (row - rows / 2) * spacing;
        
        // 创建薄长方体（厚度较薄）
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.2);
        const material = materials[(row + col) % materials.length];
        const card = new THREE.Mesh(geometry, material);
        
        // 设置初始位置
        card.position.set(x, 0, z);
        
        // 存储原始位置和波浪参数
        card.userData = {
            originalX: x,
            originalY: 0,
            originalZ: z,
            phaseOffset: (row + col) * 0.1 // 随机相位偏移
        };
        
        card.castShadow = true;
        card.receiveShadow = true;
        
        cardGroup.add(card);
        cards[row][col] = card;
    }
}

// 光照系统
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 暖色环境光
scene.add(ambientLight);

const mainLight = new THREE.PointLight(0x88ccff, 1, 100); // 冷色主光源
mainLight.position.set(10, 20, 15);
mainLight.castShadow = true;
scene.add(mainLight);

const secondaryLight = new THREE.PointLight(0xffaa88, 0.5, 100); // 辅助光源
secondaryLight.position.set(-10, -15, -10);
scene.add(secondaryLight);

// 雾效增加景深
scene.fog = new THREE.FogExp2(0x0a0a2a, 0.02);

// 处理窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 波浪参数
const waveParams = {
    amplitude: 2.0,
    speed: 0.5,
    frequency: 0.3,
    complexity: 2 // 叠加层数
};

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001; // 时间变量 (慢速波浪 3-5秒周期)
    
    // 更新每个卡片以实现复杂的波浪效果
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const card = cards[row][col];
            
            // 基础波浪
            let height = 0;
            
            // 第一层波浪
            height += Math.sin(
                time * waveParams.speed + 
                card.userData.phaseOffset + 
                card.position.x * waveParams.frequency + 
                card.position.z * waveParams.frequency
            ) * waveParams.amplitude;
            
            // 第二层波浪 (增强复杂性)
            if (waveParams.complexity > 1) {
                height += Math.cos(
                    time * waveParams.speed * 0.7 + 
                    card.userData.phaseOffset * 1.3 + 
                    card.position.x * waveParams.frequency * 1.2 + 
                    card.position.z * waveParams.frequency * 0.8
                ) * (waveParams.amplitude * 0.6);
            }
            
            // 第三层波浪 (如果需要更高复杂性)
            if (waveParams.complexity > 2) {
                height += Math.sin(
                    time * waveParams.speed * 1.3 + 
                    card.userData.phaseOffset * 0.7 + 
                    card.position.x * waveParams.frequency * 0.6 + 
                    card.position.z * waveParams.frequency * 1.4
                ) * (waveParams.amplitude * 0.4);
            }
            
            // 应用波浪效果到Y坐标
            card.position.y = height;
            
            // 添加轻微的旋转效果以增强立体感
            card.rotation.x = Math.sin(time * 0.5 + card.userData.phaseOffset) * 0.1;
            card.rotation.y = Math.cos(time * 0.4 + card.userData.phaseOffset) * 0.1;
            card.rotation.z = Math.sin(time * 0.3 + card.userData.phaseOffset) * 0.05;
        }
    }
    
    // 缓慢自动旋转整个卡片组，提供多角度观看
    cardGroup.rotation.y = time * 0.05;
    cardGroup.rotation.x = Math.sin(time * 0.1) * 0.05;
    
    renderer.render(scene, camera);
}

// 启动动画
animate();

// 交互控制系统 - 相机控制器
let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = {
        x: e.clientX,
        y: e.clientY
    };
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        cardGroup.rotation.y += deltaX * 0.01;
        cardGroup.rotation.x += deltaY * 0.01;
        
        previousMousePosition = {
            x: e.clientX,
            y: e.clientY
        };
    } else {
        // 非拖拽状态下，相机轻微跟随鼠标
        const mouseX = (e.clientX - window.innerWidth / 2) / 100;
        const mouseY = (e.clientY - window.innerHeight / 2) / 100;
        
        camera.position.x = mouseX * 2;
        camera.position.y = mouseY * 2;
        camera.lookAt(0, 0, 0);
    }
});

// 滚轮缩放
document.addEventListener('wheel', (e) => {
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(10, Math.min(50, camera.position.z)); // 限制缩放范围
});