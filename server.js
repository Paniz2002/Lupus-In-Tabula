const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

app.use(express.static(__dirname));

// Aggiungiamo un endpoint per l'ID partita
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const games = {};

io.on('connection', (socket) => {
    console.log('Un nuovo giocatore si è connesso:', socket.id);

    socket.on('createGame', (config, callback) => {
        const gameId = uuidv4();
        const rolesPool = [];
        config.roles.forEach((role) => {
            for (let i = 0; i < role.count; i++) {
                rolesPool.push(role.name);
            }
        });

        shuffle(rolesPool);

        games[gameId] = {
            id: gameId,
            players: [],
            rolesPool,
            rolesAssigned: false,
        };

        socket.join(gameId);

        callback(gameId);
        console.log(`Partita creata con ID: ${gameId}`);
        console.log('Pool dei ruoli:  ', rolesPool);
    });

    socket.on("joinGame", (gameId, playerName, callback) => {
        const game = games[gameId];
        if (game) {
            const playerExists = game.players.some((p) => p.name === playerName);
            if (playerExists) {
                return callback({ success: false, message: "Nome già in uso. Scegli un altro nome." });
            }

            const assignedRole = game.rolesPool.shift();
            const player = { id: socket.id, name: playerName, role: assignedRole };
            game.players.push(player);
            socket.join(gameId);
            callback({ success: true, role: player.role, name: player.name, playerId: player.id });

            io.to(gameId).emit("updatePlayerList", game.players);  // Invia l’evento alla stanza specifica
        } else {
            callback({ success: false, message: "Partita non trovata." });
        }
    });



    socket.on('assignRoles', (gameId) => {
        const game = games[gameId];
        if (game && !game.rolesAssigned) {
            game.players.forEach((player) => {
                const randomIndex = Math.floor(Math.random() * game.rolesPool.length);
                player.role = game.rolesPool.splice(randomIndex, 1)[0] || 'Villico';
            });
            game.rolesAssigned = true;
            io.to(gameId).emit('updatePlayerList', game.players);
            console.log(`Ruoli assegnati nella partita ${gameId}`);
        }
    });

    // Gestione del recupero della partita master
    socket.on("loadGame", (gameId, callback) => {
        const game = games[gameId];
        if (game) {
            socket.join(gameId);
            callback({ success: true, game });
        } else {
            callback({ success: false });
        }
    });

    // Gestione della riconnessione del giocatore
    socket.on("reconnectPlayer", (gameId, playerId, callback) => {
        const game = games[gameId];
        const player = game?.players.find((p) => p.id === playerId);
        console.log('game: ', game, 'player: ', player);
        console.log('gameId:', gameId, 'playerId:', playerId);
        if (game && player) {
            callback({ success: true, role: player.role, name: player.name });
        } else {
            callback({ success: false });
        }
        io.to(gameId).emit("updatePlayerList", game.players);
    });


    socket.on('disconnect', () => {
        // do nothing
        /*for (const gameId in games) {
            const game = games[gameId];
            const playerIndex = game.players.findIndex((p) => p.id === socket.id);
            if (playerIndex !== -1) {
                const player = game.players.splice(playerIndex, 1)[0];
                io.to(gameId).emit('updatePlayerList', game.players);
                console.log(`${player.name} è uscito dalla partita ${gameId}`);
                break;
            }
        }*/
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}