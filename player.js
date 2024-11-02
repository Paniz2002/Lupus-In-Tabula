const socket = io();

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get("gameId");
    const playerId = urlParams.get("playerId");
    console.log(gameId, playerId);
    if (gameId && playerId) {
        socket.emit("reconnectPlayer", gameId, playerId, (response) => {
            if (response.success) {
                joinSection.style.display = "none";
                gameInfo.style.display = "block";
                document.getElementById("player-role").innerText = `Ruolo: ${response.role}`;
                document.getElementById("player-username").innerText = `Username: ${response.name}`;
            } else {
                alert("Impossibile ricollegarsi alla partita.");
            }
        });
    }

    const joinSection = document.getElementById("join-section");
    const gameInfo = document.getElementById("game-info");
    const playerNameInput = document.getElementById("player-name");

    document.getElementById("join-game").addEventListener("click", () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName || !gameId) {
            alert("Per favore, inserisci un nome e assicurati di avere un link di gioco valido.");
            return;
        }

        socket.emit("joinGame", gameId, playerName, (response) => {
            if (response.success) {
                const newUrl = `${window.location.origin}/index.html?gameId=${gameId}&playerId=${response.playerId}`;
                window.history.pushState({ path: newUrl }, '', newUrl);
                joinSection.style.display = "none";
                gameInfo.style.display = "block";
                document.getElementById("player-role").innerText = `Ruolo: ${response.role}`;
                document.getElementById("player-username").innerText = `Username: ${response.name}`;
            } else {
                alert(response.message || "Impossibile connettersi alla partita.");
            }
        });
    });

    socket.on("updatePlayerRole", (role) => {
        document.getElementById("player-role").innerText = `Ruolo: ${role}`;
    });
});

function toggleRules() {
    const rules = document.getElementById('rules');
    const toggleButton = document.getElementById('toggle-rules-btn');
    if (rules.style.display === 'none') {
        rules.style.display = 'block';
        toggleButton.textContent = 'Nascondi Regole';
    } else {
        rules.style.display = 'none';
        toggleButton.textContent = 'Mostra Regole';
    }
}
