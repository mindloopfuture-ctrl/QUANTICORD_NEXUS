// =================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN
// =================================================================
const canvas = document.getElementById("stage");
const engine = new BABYLON.Engine(canvas, true, { adaptToDeviceRatio: true });
let scene;
let userWallet = null;
let username = "Anonimo";

// Determinar la URL del servidor automáticamente
const getBaseServerUrl = () => {
    // Si se sirve desde un archivo local, usar localhost.
    if (window.location.protocol === "file:") return 'http://localhost:8787';
    
    const url = new URL(window.location.href);
    return `${url.protocol}//${url.hostname}:8787`;
};

const SERVER_URL = getBaseServerUrl(); 
const socket = io(SERVER_URL); 

// Elementos UI
const loginScreen = document.getElementById('login-screen');
const gameUI = document.getElementById('game-ui');
const connectBtn = document.getElementById('connect-wallet-btn');
const statusMessage = document.getElementById('status-message');
const balanceSpan = document.getElementById('qcn-balance');
const walletSpan = document.getElementById('user-wallet');
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');

// =================================================================
// 2. CREACIÓN DEL STAGE (BABYLON.JS)
// =================================================================

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0.05, 0.1); 

    const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 2, -5), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.speed = 0.1; 
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // Avatar del usuario (Esfera PIC)
    const userAvatar = BABYLON.MeshBuilder.CreateSphere("user-avatar", {diameter: 0.5}, scene);
    userAvatar.position.y = 0.5;
    userAvatar.material = new BABYLON.StandardMaterial("mat", scene);
    userAvatar.material.diffuseColor = new BABYLON.Color3(0, 1, 1); 

    // Stage Central (Ground)
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2); 

    return scene;
};

scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});

// =================================================================
// 3. LÓGICA DE AUTENTICACIÓN (PIC)
// =================================================================

connectBtn.onclick = async () => {
    // ** SIMULACIÓN DE CONEXIÓN DE BILLETERA **
    statusMessage.innerText = "Iniciando Protocolo de Sincronización...";
    
    const mockWallet = '83dxm6jSYEmhRuQNdz8PHwzGmrnsBFmUhD4152K4Fray_FOUNDER'; 
    username = prompt("Ingrese su nombre de usuario (para chat):") || "Nexus_" + Math.floor(Math.random() * 999);

    try {
        const response = await fetch(`${SERVER_URL}/api/auth-solana`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: mockWallet })
        });

        const data = await response.json();

        if (data.success) {
            userWallet = data.user.wallet;
            updateUI(data.user.credits);
            
            socket.emit('user_joined', { wallet: userWallet, username });

            loginScreen.style.display = 'none';
            gameUI.style.display = 'block';
            chatInput.disabled = false;

            appendMessage("¡Conexión PIC establecida! El IA Copiloto le espera. Use `/sync` para la misión inicial.", 'system');
        } else {
            statusMessage.innerText = `Error de Sincronización: ${data.error}`;
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        statusMessage.innerText = "Error: Servidor del Nexus no responde. Verifique Node.js.";
    }
};

const updateUI = (balance) => {
    balanceSpan.innerText = `Balance $QCN: ${balance}`;
    walletSpan.innerText = `Wallet: ${userWallet.substring(0, 8)}...`;
}

const appendMessage = (msg, type = 'chat') => {
    const p = document.createElement('p');
    p.className = type;
    p.innerText = msg;
    chatWindow.appendChild(p);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatInput.onkeydown = (e) => {
    if (e.key === 'Enter' && chatInput.value.trim() !== '') {
        const message = chatInput.value.trim();
        
        if (message.startsWith('/')) {
            handleCommand(message);
        } else {
            socket.emit('chat', { sender: username, message: message });
        }

        chatInput.value = '';
    }
}

// =================================================================
// 4. MANEJO DE COMANDOS (CASO HÉROE 1: /sync)
// =================================================================

const handleCommand = (command) => {
    const parts = command.split(' ');
    const cmd = parts[0];

    if (cmd === '/sync') {
        appendMessage(`[CMD] Intentando Sincronización Cuántica...`, 'system');
        
        socket.emit('command', { command: '/sync', wallet: userWallet, username: username });

    } else {
        appendMessage(`[CMD] Comando desconocido. Los comandos disponibles son: /sync`, 'error');
    }
}

// =================================================================
// 5. MANEJO DE SOCKETS (EVENTOS DE SERVIDOR)
// =================================================================

socket.on('chat', (data) => {
    appendMessage(`[${data.sender}]: ${data.message}`);
});

socket.on('system_message', (data) => {
    appendMessage(`[NEXUS]: ${data.message}`, 'system');
    
    if (data.target === userWallet && data.message.includes('sincronizado')) {
        // Refrescar el saldo
        fetch(`${SERVER_URL}/api/auth-solana`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: userWallet })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                updateUI(data.user.credits);
            }
        });
    }
});
