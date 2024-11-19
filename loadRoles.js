// loadRoles.js

const mongoose = require('mongoose');
const Role = require('./models/role');  // Assicurarsi che il percorso sia corretto

// Collegamento al database
mongoose.connect('mongodb://localhost:27017/lupus', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connesso al database'))
    .catch((error) => console.error('Errore di connessione al database:', error));

// Definizione dei ruoli
// Definizione dei ruoli
const roles = [
    { name: "Villico", icon: "👨", affiliation: "buono" },
    { name: "Lupo", icon: "🐺", affiliation: "cattivo" },
    { name: "Veggente", icon: "🔮", affiliation: "buono" },
    { name: "Cavaliere", icon: "🤺", affiliation: "buono" },
    { name: "Indemoniato", icon: "😈", affiliation: "cattivo" },
    { name: "Medium", icon: "✝️", affiliation: "buono" },
    { name: "Mitomane", icon: "🎭", affiliation: "buono" },
    { name: "Criceto Mannaro", icon: "🐹", affiliation: "neutrale" },
    { name: "Matto", icon: "🤪", affiliation: "neutrale" },
    { name: "Massoni", icon: "🧐", affiliation: "buono" },
    { name: "Giustiziere", icon: "🔫", affiliation: "buono" },
    { name: "Investigatore", icon: "🔍", affiliation: "buono" },
    { name: "Strega", icon: "🧙‍♀️", affiliation: "cattivo" },
    { name: "Angelo", icon: "👼", affiliation: "buono" },
    { name: "Appestato", icon: "🤒", affiliation: "buono" },
    { name: "Insinuo", icon: "☝️", affiliation: "buono" },
    { name: "Cavaliere Nero", icon: "🧥", affiliation: "cattivo" },
    { name: "Boia", icon: "💀", affiliation: "cattivo" },
    { name: "Prostituta", icon: "💋", affiliation: "neutrale" },
    { name: "Illusionista", icon: "✨", affiliation: "cattivo" },
    { name: "Capitano Uncino", icon: "🏴‍☠️", affiliation: "cattivo" },
    { name: "Ammaestratore", icon: "🦁", affiliation: "buono" },
    { name: "Rosicone", icon: "😡", affiliation: "buono" },
    { name: "Wendigo", icon: "👹", affiliation: "neutrale" },
    { name: "Spaccino", icon: "🥦", affiliation: "cattivo" },
    { name: "Ape", icon: "🐝", affiliation: "buono" },
    { name: "Playlover", icon: "💕", affiliation: "buono" },
    { name: "Becchino", icon: "⚰️", affiliation: "buono" },
    { name: "Ludopatico", icon: "🎰", affiliation: "neutrale" },
    { name: "Piromane", icon: "🔥", affiliation: "neutrale" },
    { name: "Personal Trainer", icon: "🏋️", affiliation: "buono" },
    { name: "AvvoChad", icon: "⚖️", affiliation: "neutrale" },
    { name: "Druido", icon: "🧙‍♂️", affiliation: "buono" },
    { name: "Vampiro", icon: "🧛", affiliation: "cattivo" },
    { name: "Pengwin", icon: "🎲", affiliation: "neutrale" },
    { name: "Corriere", icon: "📦", affiliation: "cattivo" },
];

// Funzione per caricare i ruoli nel database
const loadRoles = async () => {
    try {
        // Cancella i ruoli esistenti per evitare duplicati
        await Role.deleteMany({});
        console.log("Ruoli esistenti eliminati.");

        // Inserisci i nuovi ruoli
        await Role.insertMany(roles);
        console.log("Ruoli inseriti con successo.");
    } catch (error) {
        console.error("Errore durante il caricamento dei ruoli:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Esegui il caricamento dei ruoli
loadRoles();
