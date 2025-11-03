import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import dotenv from 'dotenv';
import { Connection, PublicKey } from '@solana/web3.js';
// import axios from 'axios'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Variables de entorno críticas
const QCN_MINT = process.env.QCN_MINT_ADDRESS;

// --- Almacenamiento Centralizado para MVP (Usuarios y Creditos) ---
const users = {}; 

app.get('/', (req, res) => res.send('QUANTICORD NEXUS Server Activo. Protocolo PIC Online.'));

// =================================================================
// 1. API DE AUTENTICACIÓN (Conectar Wallet - Simulación de Firma Solana)
// =================================================================

app.post('/api/auth-solana', async (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) return res.status(400).send({ error: 'Falta la dirección de la billetera.' });

    try {
        let qcnBalance = 0;
        
        if (users[walletAddress]) {
            qcnBalance = users[walletAddress].credits;
        } else {
            // Caso Héroe 1: Recompensa inicial de Sincronización
            qcnBalance = 50; 
            users[walletAddress] = {
                wallet: walletAddress,
                credits: qcnBalance,
                isCreator: false,
                level: 1
            };
        }

        console.log(`Usuario autenticado: ${walletAddress} con ${qcnBalance} créditos.`);

        return res.json({ 
            success: true, 
            message: 'Autenticación PIC exitosa.', 
            user: { wallet: walletAddress, credits: qcnBalance } 
        });

    } catch (e) {
        console.error('Error de autenticación Solana:', e);
        return res.status(500).send({ error: 'Error al verificar la billetera Solana.' });
    }
});

// =================================================================
// 2. API DE UTILIDAD: CONSUMO $QCN (Simulación de Quema/Tarifa)
// =================================================================

app.post('/api/spend-qcn', (req, res) => {
    const { walletAddress, amount, action } = req.body;
    if (!walletAddress || !amount || !action) return res.status(400).send({ error: 'Datos incompletos.' });

    const user = users[walletAddress];

    if (!user || user.credits < amount) {
        return res.status(402).send({ error: 'Créditos insuficientes para la acción.' });
    }

    user.credits -= amount;

    // SIMULACION DE QUEMA: 90% quemado, 10% a la DAO.
    const burnedAmount = amount * 0.9;
    const daoFee = amount * 0.1;

    console.log(`[TX-QCN] ${walletAddress} gastó ${amount} por ${action}. Quemado: ${burnedAmount}, DAO Fee: ${daoFee}. Nuevo saldo: ${user.credits}`);

    return res.json({ 
        success: true, 
        newBalance: user.credits, 
        message: `Transacción completada. Se ejecutó la quema por ${action}.` 
    });
});


// =================================================================
// 3. SOCKET.IO: Chat y Comandos 3D
// =================================================================

const server = http.createServer(app);
const io = new IOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', socket => {
  console.log('Cliente conectado al Nexus. ID:', socket.id);
  
  socket.on('chat', data => {
      io.emit('chat', data);
  });
  
  // Manejo del comando /sync (Caso Héroe 1)
  socket.on('command', (data) => {
      if (data.command === '/sync' && users[data.wallet]) {
          const reward = 50;
          users[data.wallet].credits += reward;

          io.emit('system_message', { 
              target: data.wallet, 
              message: `¡${data.username} ha sincronizado su nodo! (+${reward} $QCN Créditos). Visita la tienda para progresar.` 
          });
      }
  });

  socket.on('move', data => {
      io.emit('user_update', { id: socket.id, ...data });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado.');
    io.emit('user_left', { id: socket.id });
  });
});

const PORT = process.env.PORT || 8787;

server.listen(PORT, () => console.log(`[QCN] Servidor activo en puerto ${PORT}`));
