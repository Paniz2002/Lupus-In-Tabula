const mongoose = require('mongoose');
const fs = require('fs');
const {format} = require('date-fns/format');
const { Parser } = require('json2csv');

const Player = require('./models/player');

async function generateLeaderboard() {
    try {
        await mongoose.connect('mongodb://localhost:27017/lupus', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const users = await Player.find();

        const leaderboardData = users.map(user => {
            const winrate = user.gamesPlayed > 0 ? (user.gamesWon / user.gamesPlayed) : 0;
            const weightedScore = user.score * winrate;
            return {
                name: user.name,
                gamesPlayed: user.gamesPlayed,
                gamesWon: user.gamesWon,
                winrate: winrate.toFixed(2), // Limitiamo a due cifre decimali
                score: user.score,
                weightedScore: weightedScore.toFixed(2),
            };
        });

        leaderboardData.sort((a, b) => b.weightedScore - a.weightedScore);

        const currentDate = format(new Date(), 'dd-MM-yyyy');

        const fields = ['name', 'gamesPlayed', 'gamesWon', 'winrate', 'score', 'weightedScore'];
        const parser = new Parser({ fields });
        const csv = parser.parse(leaderboardData);

        // Scrivi il file CSV
        const fileName = `classifica_lupus_aggiornata_al_${currentDate}.csv`;
        fs.writeFileSync(fileName, csv);

        console.log(`File CSV generato con successo: ${fileName}`);
    } catch (error) {
        console.error('Errore nella generazione della classifica:', error);
    } finally {
        await mongoose.disconnect();
    }
}

generateLeaderboard();
