const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const Player = require('./models/player');
const Game = require('./models/game');
const Role = require('./models/role'); // modello per i ruoli

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connesso'))
    .catch(err => console.error('Errore di connessione a MongoDB:', err));

app.use(express.static(__dirname));

// Endpoint principale
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('Un nuovo giocatore si è connesso:', socket.id);

    // Creazione di una nuova partita
    socket.on('createGame', async (config, callback) => {
        const gameId = uuidv4();
        const rolesPool = [];

        // Otteniamo i ruoli dalla configurazione e li salviamo
        for (const role of config.roles) {
            const dbRole = await Role.findOne({ name: role.name });
            for (let i = 0; i < role.count; i++) {
                rolesPool.push(dbRole._id);
            }
        }

        // Mescola la rolesPool per assegnazione casuale
        shuffle(rolesPool);

        // Creiamo una nuova partita nel database
        const newGame = new Game({
            gameId,
            rolesPool,
            players: [],
            rolesAssigned: false
        });
        await newGame.save();

        socket.join(gameId);
        callback(gameId);
        console.log(`Partita creata con ID: ${gameId}`);
    });

    socket.on("getRoles", async (callback) => {
        const roles = await Role.find({});
        callback(roles);
    });

    // Gestione della partecipazione a una partita
    socket.on("joinGame", async (gameId, playerName, callback) => {
        const game = await Game.findOne({ gameId });

        if (!game) {
            callback({ success: false, message: "Partita non trovata." });
            return;
        }

        // Cerca un giocatore con lo stesso nome e partita corrente; assegna un nuovo ruolo ogni volta
        let player = await Player.findOne({ name: playerName });
        let assignedRole = "";
        if(player && game.players.includes(player._id)){
            assignedRole = player.role;
        }else {
            const assignedRoleId = game.rolesPool.shift();
            const assignedRoleObj = await Role.findById(assignedRoleId);
            assignedRole = assignedRoleObj.name;
        }

        if (player) {
            // Aggiorna il ruolo del giocatore se già esiste
            player.role = assignedRole;
            player.isAlive = true;
            if(!game.players.includes(player._id)){
                game.players.push(player._id);
            }
        } else {
            // Crea un nuovo giocatore con il ruolo assegnato
            player = new Player({ name: playerName, role: assignedRole, gameId });
            game.players.push(player._id);
        }

        await player.save();
        await game.save();

        socket.join(gameId);
        callback({ success: true, role: assignedRole, name: player.name });
        io.to(gameId).emit("updatePlayerList", await Game.findById(game._id).populate({
            path: 'players',
        }));
    });

    // Caricamento di una partita già esistente per il master
    socket.on("loadGame", async (gameId, callback) => {
        const game = await Game.findOne({ gameId }).populate('players');
        if (game) {
            socket.join(gameId);
            callback({ success: true, game });
        } else {
            callback({ success: false });
        }
    });

    socket.on("reconnectPlayer", async (gameId, playerId, callback) => {
        const game = await Game.findOne({ gameId }).populate('players');
        const player = game?.players.find(p => p.name === playerId);

        if (game && player) {
            callback({ success: true, role: player.role, name: player.name });
        } else {
            callback({ success: false });
        }

        io.to(gameId).emit("updatePlayerList", await Game.findById(game._id).populate('players'));
    });

    // Funzione per assegnare ruoli casuali
    socket.on('assignRoles', async (gameId) => {
        const game = await Game.findOne({ gameId }).populate('players rolesPool');
        if (game && !game.rolesAssigned) {
            game.players.forEach((player, index) => {
                player.role = game.rolesPool[index] || 'Villico';
                player.save();
            });
            game.rolesAssigned = true;
            await game.save();
            io.to(gameId).emit('updatePlayerList', await Game.findById(game._id).populate('players'));
            console.log(`Ruoli assegnati nella partita ${gameId}`);
        }
    });

    // Segna la fine della partita e assegna punti
    socket.on("endGame", async ({ gameId, winners }, callback) => {
        try {
            console.log(winners)
            const players = await Player.find({});
            const game = await Game.findOne({gameId});
            for (const player of players) {
                if(game.players.includes(player._id)){
                    player.gamesPlayed += 1;
                }
                if (winners.includes(player.name)) {
                    const role = await Role.findOne({ name: player.role });

                    let points = 0;
                    if (role.affiliation === "cattivo") {
                        points = 3;
                    } else if (role.affiliation === "neutrale") {
                        points = 5;
                    } else if (role.affiliation === "buono") {
                        points = 2;
                    }

                    player.score += points;
                    player.gamesWon += 1;
                }
                await player.save();
            }

            callback();
        } catch (error) {
            console.error("Errore durante l'assegnazione dei punti:", error);
            callback(error);
        }
    });

    // Disconnessione del giocatore
    socket.on('disconnect', () => {
        console.log(`Giocatore ${socket.id} disconnesso`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

// Funzione per mescolare gli elementi di un array
function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
}
