// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 10, 20);

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 25);
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
const metalMaterials = [
    new THREE.MeshStandardMaterial({
        color: 0xaaaaff,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x223366,
        emissiveIntensity: 0.2
    }),
    new THREE.MeshStandardMaterial({
        color: 0xaaffaa,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x336633,
        emissiveIntensity: 0.2
    }),
    new THREE.MeshStandardMaterial({
        color: 0xffaaaa,
        metalness: 0.95,
        roughness: 0.05,
        emissive: 0x663333,
        emissiveIntensity: 0.2
    })
];

// 创建山形地形高度
function getHeight(x, z) {
    // 创建类似山峰的地形
    const distance = Math.sqrt(x * x + z * z);
    return Math.max(0, 5 * Math.exp(-distance * 0.3) * Math.sin(distance * 0.5));
}

// 创建卡片网格
const cards = [];
for (let row = 0; row < rows; row++) {
    cards[row] = [];
    for (let col = 0; col < cols; col++) {
        // 计算位置
        const x = (col - cols / 2) * spacing;
        const z = (row - rows / 2) * spacing;
        const y = getHeight(x, z); // 山形高度
        
        // 创建卡片（矩形平面）
        const geometry = new THREE.PlaneGeometry(0.8, 0.8);
        const material = metalMaterials[(row + col) % metalMaterials.length];
        const card = new THREE.Mesh(geometry, material);
        
        // 旋转卡片使其垂直站立
        card.rotation.x = -Math.PI / 2;
        
        // 设置位置
        card.position.set(x, y + 0.1, z); // +0.1避免与地面完全贴合
        
        // 存储原始位置和时间偏移
        card.userData = {
            originalY: y + 0.1,
            activationTime: (row + col) * 0.05, // 传播延迟
            activated: false,
            pulsePhase: 0
        };
        
        card.castShadow = true;
        card.receiveShadow = true;
        
        cardGroup.add(card);
        cards[row][col] = card;
    }
}

// 添加环境光
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// 添加主要光源（模拟太阳）
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 20, 15);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// 添加补光
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-10, 10, -10);
scene.add(fillLight);

// 添加点光源增加金属反光效果
const pointLight1 = new THREE.PointLight(0xffaa00, 0.5, 50);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00aaff, 0.5, 50);
pointLight2.position.set(-5, 8, -5);
scene.add(pointLight2);

// 处理窗口大小变化
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画控制变量
let startTime = Date.now();
const pulseDuration = 2000; // 2秒脉冲周期
let currentPulseStartRow = 0;

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000; // 秒
    
    // 控制脉冲效果
    const pulseProgress = ((currentTime - startTime) % pulseDuration) / pulseDuration;
    
    // 重置激活状态
    if (pulseProgress < 0.01) { // 每个脉冲周期开始时
        currentPulseStartRow = (currentPulseStartRow + 1) % rows;
        
        // 重置所有卡片状态
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                cards[row][col].userData.activated = false;
                cards[row][col].material.emissiveIntensity = 0.2;
                cards[row][col].scale.set(1, 1, 1);
            }
        }
    }
    
    // 更新每个卡片
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const card = cards[row][col];
            
            // 计算激活时间
            const activationTime = currentTime - (row * 50); // 从上往下传播
            const timeSinceActivation = currentTime - activationTime;
            
            // 如果到达激活时间
            if (timeSinceActivation > card.userData.activationTime * 100) {
                if (!card.userData.activated) {
                    card.userData.activated = true;
                    
                    // 设置脉冲效果
                    setTimeout(() => {
                        // 心跳效果
                        card.material.emissiveIntensity = 1.5;
                        card.scale.set(1.2, 1.2, 1.2);
                        
                        // 恢复效果
                        setTimeout(() => {
                            card.material.emissiveIntensity = 0.2;
                            card.scale.set(1, 1, 1);
                        }, 200);
                    }, 10);
                }
            }
            
            // 添加轻微的呼吸动画
            const breathe = Math.sin(elapsedTime * 2 + card.position.x + card.position.z) * 0.02;
            card.position.y = card.userData.originalY + breathe;
        }
    }
    
    // 旋转整个卡片组
    cardGroup.rotation.y = elapsedTime * 0.1;
    
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