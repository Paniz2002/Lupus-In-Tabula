
const socket = io();

let gameId = null;

// Ruoli disponibili e icone
const roles = [
    { name: "Lupo", icon: "🐺" },
    { name: "Villico", icon: "👨‍🌾" },
    { name: "Veggente", icon: "🔮" },
    { name: "Cavaliere", icon: "🤺" },
    { name: "Indemoniato", icon: "😈" },
    { name: "Medium", icon: "✝️" },
    { name: "Mitomane", icon: "🎭" },
    { name: "Criceto Mannaro", icon: "🐹" },
    { name: "Matto", icon: "🤪" },
    { name: "Massoni", icon: "🧐" },
    { name: "Giustiziere", icon: "🔫" },
    { name: "Investigatore", icon: "🔍" },
    { name: "Strega", icon: "🧙‍♀️" },
    { name: "Angelo", icon: "👼" },
    { name: "Appestato", icon: "🤒" },
    { name: "Insinuo", icon: "☝️" },
    { name: "Cavaliere Nero", icon: "🧥" },
    { name: "Boia", icon: "💀" },
    { name: "Prostituta", icon: "💋" },
    { name: "Illusionista", icon: "✨" },
    { name: "Capitano Uncino", icon: "🏴‍☠️" },
    { name: "Ammaestratore", icon: "🦁" },
    { name: "Rosicone", icon: "😡" },
    { name: "Wendigo", icon: "👹" },
    { name: "Spaccino", icon: "🥦" },
    { name: "Ape", icon: "🐝" },
    { name: "Playlover", icon: "💕" },
    { name: "Becchino", icon: "⚰️" },
    { name: "Ludopatico", icon: "🎰" },
    { name: "Piromane", icon: "🔥" },
    { name: "Personal Trainer", icon: "🏋️" },
    { name: "Avvocato", icon: "⚖️" },
    { name: "Druido", icon: "🧙‍♂️" },
    { name: "Vampiro", icon: "🧛" },
    { name: "Pengwin", icon: "🎲" },
    { name: "Corriere", icon: "📦" }
];

const connectedPlayersList = document.getElementById("connected-players-list");


document.addEventListener("DOMContentLoaded", () => {

    const rolesContainer = document.getElementById("roles-container");
    const selectedRolesList = document.getElementById("selected-roles-list");
    const gameLinkInput = document.getElementById("game-link");

    // Se esiste una configurazione salvata, la carica
    const savedGameConfig = JSON.parse(localStorage.getItem("savedGameConfig"));
    const savedPlayers = JSON.parse(localStorage.getItem("connectedPlayers"));

    if(savedPlayers){
        savedPlayers.forEach((player) => {
            const playerItem = document.createElement("li");
            playerItem.innerText = `${player.name} - Ruolo: ${player.role || "Non assegnato"}`;
            connectedPlayersList.appendChild(playerItem);
        });
    }

    console.log("Configurazione salvata:", savedGameConfig);
    // Genera gli input per ciascun ruolo selezionabile
    roles.forEach((role) => {
        const roleDiv = document.createElement("div");
        roleDiv.innerHTML = `
            <label>${role.icon} ${role.name}</label>
            <input type="number" min="0" id="role-${role.name}" value="0" />
        `;
        rolesContainer.appendChild(roleDiv);
    });

    //if the param gameId is present in the URL, it means the master is reconnecting to an existing game
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdParam = urlParams.get("gameId");
    if(gameIdParam){
        socket.emit("loadGame", gameIdParam, () => {
            loadGame(gameIdParam, gameLinkInput, selectedRolesList, savedGameConfig);
        });
    }else{
        // Configura la creazione della partita
        document.getElementById("create-game").addEventListener("click", () => {
            const config = {
                roles: roles.map((role) => ({
                    name: role.name,
                    count: parseInt(document.getElementById(`role-${role.name}`).value) || 0,
                })),
            };

            localStorage.setItem("savedGameConfig", JSON.stringify(config));

            socket.emit("createGame", config, (newGameId) => {
                loadGame(newGameId, gameLinkInput, selectedRolesList, config);
                connectedPlayersList.innerHTML = "";
            });
        });
    }

    // Copia link negli appunti
    document.getElementById("copy-link").addEventListener("click", () => {
        gameLinkInput.select();
        document.execCommand("copy");
        alert("Link copiato negli appunti!");
    });
});

// Aggiornamento dinamico della lista dei giocatori connessi
socket.on("updatePlayerList", (players) => {
    console.log("Aggiornamento lista giocatori:", players);
    connectedPlayersList.innerHTML = "";
    players.forEach((player) => {
        const playerItem = document.createElement("li");
        playerItem.innerText = `${player.name} - Ruolo: ${player.role || "Non assegnato"}`;
        connectedPlayersList.appendChild(playerItem);
    });

    // Salva la lista dei giocatori nel localStorage
    localStorage.setItem("connectedPlayers", JSON.stringify(players));
});

function loadGame(gameId, gameLinkInput, selectedRolesList, config){
    document.getElementById("game-id").innerText = gameId;
    document.getElementById("roles-selection").style.display = "none";
    document.getElementById("game-summary").style.display = "block";

    // Aggiorna l'URL con il gameId per preservare lo stato
    const newUrl = `${window.location.origin}/master.html?gameId=${gameId}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // Mostra il link della partita
    gameLinkInput.value = `${window.location.origin}/?gameId=${gameId}`;

    // Mostra il riepilogo dei ruoli selezionati
    selectedRolesList.innerHTML = "";

    config.roles.forEach((role) => {
        if (role.count > 0) {
            const roleItem = document.createElement("li");
            roleItem.innerText = `${role.name} (${role.count})`;
            selectedRolesList.appendChild(roleItem);
        }
    });
}