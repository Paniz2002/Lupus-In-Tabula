# Lupus-In-Tabula
Semplice sito per gestire le partite di lupus in tabula, i ruoli sono presi da https://github.com/CerberoPodcast/regole-lupus

Per ora è molto semplice perché ha semplicemente l'obbiettivo di giocare in locale con amici, con del tempo implementerò delle nuove funzionalità.

## Cominciare a giocare

Per iniziare a giocare basterà clonare questa repository e lanciare Docker:
```bash
docker-compose up -d --build  
```

Successivamente il master è pronto per iniziare una nuova partita, basterà aprire il browser e andare su `localhost:3000/master.html`, da lì si potrà configurare e generare il link per far entrare i giocatori. 

Per giocare su una rete locale il master dovrebbe ottenere il proprio indirizzo IP della rete locale(il Wi-Fi di casa è l'ideale), far connettere tutti i giocatori alla stessa rete e sostituire il proprio IP al posto di `localhost`, dovrà dunque connettersi a `{your_ip}:3000/master.html`.

[Guida per ottenere l'indirizzo IP](https://www.whatismybrowser.com/detect/what-is-my-local-ip-address/).

## Ottenere la classifica

Per ora è possibile avere un'unica classifica con tutti i giocatori che hanno partecipato attraverso il seguente comando:
```bash
node generateDownloadableLeaderboard.js
```

> È consigliabile che i giocatori entrino sempre con lo stesso nome, altrimenti il sistema non riconoscerà i punteggi.
