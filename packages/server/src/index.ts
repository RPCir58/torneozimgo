import { monitor } from '@colyseus/monitor';
import { Constants } from '@tosios/common';
import { Server } from 'colyseus';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import { GameRoom } from './rooms/GameRoom';

const PORT = Number(process.env.PORT || Constants.WS_PORT);
const PUBLIC_DIR = join(__dirname, '../../client/public');

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());

const httpServer = createServer(app);

// 1. Corregido: Se eliminó 'express: app' del constructor
const server = new Server({
    server: httpServer,
});

// 2. Correcto: Vincula Express a Colyseus usando attach
server.attach({ server: httpServer });

// Game Rooms
server.define(Constants.ROOM_NAME, GameRoom);

// Serve static resources from the "public" folder
app.use(express.static(PUBLIC_DIR));

// If you don't want people accessing your server stats, comment this line.
// Reemplaza tu línea actual por esta versión sin pasar la variable 'server':
app.use('/colyseus', monitor({}));

// Serve the frontend client
app.get('*', (req: any, res: any) => {
    res.sendFile(join(PUBLIC_DIR, 'index.html'));
});

server.onShutdown(() => {
    console.log(`Shutting down...`);
});

// 3. Correcto: Se escucha en el httpServer en lugar de server.listen
httpServer.listen(PORT, () => {
    console.log(`Listening on ws://localhost:${PORT}`);
});