const socket = io();
let roles = [];

// Elementi del DOM
const connectedPlayersList = document.getElementById("connected-players-list");

// Carica i ruoli dal server quando la pagina è pronta
document.addEventListener("DOMContentLoaded", () => {
    const rolesContainer = document.getElementById("roles-container");
    const selectedRolesList = document.getElementById("selected-roles-list");
    const gameLinkInput = document.getElementById("game-link");
    const winnerSelection = document.getElementById("winner-selection");
    const winnerList = document.getElementById("winner-list");

    // Richiedi i ruoli al server
    socket.emit("getRoles", (fetchedRoles) => {
        roles = fetchedRoles;
        roles.forEach((role) => {
            const roleDiv = document.createElement("div");
            roleDiv.innerHTML = `
                <label>${role.icon} ${role.name}</label>
                <input type="number" min="0" id="role-${role.name}" value="0" />
            `;
            rolesContainer.appendChild(roleDiv);
        });
    });

    // Creazione partita
    document.getElementById("create-game").addEventListener("click", () => {
        const config = {
            roles: roles.map((role) => ({
                name: role.name,
                count: parseInt(document.getElementById(`role-${role.name}`).value) || 0,
            })),
        };
        socket.emit("createGame", config, (newGameId) => {
            loadGame(newGameId, gameLinkInput, selectedRolesList, config);
            connectedPlayersList.innerHTML = "";
        });
    });

    // Copia link negli appunti
    document.getElementById("copy-link").addEventListener("click", () => {
        gameLinkInput.select();
        document.execCommand("copy");
        alert("Link copiato negli appunti!");
    });

    // Termina la partita e mostra la lista per selezionare i vincitori
    document.getElementById("end-game").addEventListener("click", () => {
        winnerSelection.style.display = "block";
        winnerList.innerHTML = "";
        const savedPlayers = JSON.parse(localStorage.getItem("connectedPlayers"));
        savedPlayers.forEach((player) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <label>
                    <input type="checkbox" class="winner-checkbox" data-player="${player.name}" /> ${player.name} - Ruolo: ${player.role}
                </label>
            `;
            winnerList.appendChild(listItem);
        });
    });

    // Conferma i vincitori e invia i dati al server
    document.getElementById("confirm-winner").addEventListener("click", () => {
        const winners = Array.from(document.querySelectorAll(".winner-checkbox"))
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.getAttribute("data-player"));

        // Qui è necessario ottenere l'ID della partita attuale, che potresti conservare in un'altra variabile.
        const gameId = document.getElementById("game-id").innerText;

        socket.emit("endGame", { gameId, winners }, () => {
            alert("Risultati salvati.");
            location.reload();  // Ricarica la pagina per una nuova partita
        });
    });
});

// Ricevi aggiornamenti sulla lista dei giocatori connessi
socket.on("updatePlayerList", (game) => {
    console.log('game: ', game);
    let players = game.players;
    connectedPlayersList.innerHTML = "";
    console.log('players: ', players);
    players.forEach((player) => {
        const playerItem = document.createElement("li");
        console.log('player role: ', player.role);
        playerItem.innerText = `${player.name} - Ruolo: ${player.role || "Non assegnato"}`;
        connectedPlayersList.appendChild(playerItem);
    });
    localStorage.setItem("connectedPlayers", JSON.stringify(players));
});

function loadGame(gameId, gameLinkInput, selectedRolesList, config) {
    document.getElementById("game-id").innerText = gameId;
    document.getElementById("roles-selection").style.display = "none";
    document.getElementById("game-summary").style.display = "block";

    const newUrl = `${window.location.origin}/master.html?gameId=${gameId}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    gameLinkInput.value = `${window.location.origin}/?gameId=${gameId}`;
    selectedRolesList.innerHTML = "";

    config.roles.forEach((role) => {
        if (role.count > 0) {
            const roleItem = document.createElement("li");
            roleItem.innerText = `${role.name} (${role.count})`;
            selectedRolesList.appendChild(roleItem);
        }
    });
}
