# Cours complet Node.js – Du débutant à l'intermédiaire

## Table des matières

1. [Qu'est-ce que Node.js ?](#1-quest-ce-que-nodejs)
2. [Installation](#2-installation)
3. [Premiers concepts](#3-premiers-concepts)
4. [Modules et imports](#4-modules-et-imports)
5. [NPM et les packages](#5-npm-et-les-packages)
6. [Fondamentaux JavaScript async](#6-fondamentaux-javascript-async)
7. [Créer un serveur HTTP](#7-créer-un-serveur-http)
8. [Introduction à Express](#8-introduction-à-express)
9. [Événements et Streams](#9-événements-et-streams)
10. [Fichiers et Système](#10-fichiers-et-système)
11. [Débogage et bonnes pratiques](#11-débogage-et-bonnes-pratiques)

---

## 1. Qu'est-ce que Node.js ?

### Définition simple

**Node.js** est un **environnement d'exécution JavaScript hors du navigateur**.

Normalement, JavaScript s'exécute dans votre navigateur (Chrome, Firefox…). Node.js permet d'exécuter le **même langage JavaScript** sur votre ordinateur, serveur ou tablette.

```
Avant Node.js :
  JavaScript → uniquement dans le navigateur

Après Node.js :
  JavaScript → navigateur + serveur + terminal + Raspberry Pi
```

### Pourquoi Node.js ?

- ✅ **Même langage partout** (front et back en JavaScript)
- ✅ **Très rapide** (moteur V8 de Chrome)
- ✅ **Asynchrone par défaut** (idéal pour I/O : lectures fichiers, réseau…)
- ✅ **Énorme écosystème** (npm : 3+ millions de packages)
- ✅ **Léger et portable**

### Cas d'usage

- Serveurs web (Express, Hapi, Fastify…)
- API REST
- Applications temps réel (Socket.io, WebSocket)
- Scripts d'automatisation
- Applications CLI (command-line)
- Electron (applications de bureau)

---

## 2. Installation

### Télécharger et installer

1. Allez sur [nodejs.org](https://nodejs.org)
2. Téléchargez la **version LTS** (Long Term Support) – c'est la plus stable
3. Installez en suivant l'assistant

### Vérifier l'installation

Ouvrez un terminal/PowerShell et tapez :

```bash
node --version
npm --version
```

Vous devriez voir quelque chose comme :
```
v18.17.0
9.8.1
```

### Premier programme Node.js

Créez un fichier `hello.js` :

```javascript
console.log("Bonjour, Node.js !");
```

Exécutez-le :

```bash
node hello.js
```

Résultat :
```
Bonjour, Node.js !
```

**C'est ça !** Vous venez de lancer votre premier programme Node.js. 🎉

---

## 3. Premiers concepts

### Variables et types de base

Node.js utilise JavaScript standard. Les variables se créent avec `const`, `let`, ou `var` :

```javascript
const nom = "Alice";              // Chaîne de caractères (string)
const age = 30;                   // Nombre (number)
const actif = true;               // Booléen (boolean)
const donnees = null;             // Rien (null)
let nonDefini;                    // Indéfini (undefined)

const fruites = ["Pomme", "Raisin"];  // Tableau (array)
const personne = {                     // Objet (object)
  nom: "Marie",
  age: 28
};

console.log(nom);                 // Affiche: Alice
console.log(fruites[0]);          // Affiche: Pomme
console.log(personne.nom);        // Affiche: Marie
```

### Fonctions

Une fonction est un bloc de code réutilisable :

```javascript
// Déclaration classique
function additionner(a, b) {
  return a + b;
}

console.log(additionner(5, 3));  // Affiche: 8

// Fonction fléchée (syntaxe moderne)
const multiplier = (a, b) => {
  return a * b;
};

console.log(multiplier(4, 5));   // Affiche: 20

// Fonction fléchée courte (une ligne)
const carre = x => x * x;
console.log(carre(7));            // Affiche: 49
```

### Conditions et boucles

```javascript
// If/else
if (age > 18) {
  console.log("Adulte");
} else if (age > 13) {
  console.log("Adolescent");
} else {
  console.log("Enfant");
}

// Boucle for
for (let i = 0; i < 5; i++) {
  console.log(i);  // Affiche: 0, 1, 2, 3, 4
}

// Boucle forEach sur un tableau
const fruits = ["Pomme", "Banane", "Orange"];
fruits.forEach(fruit => {
  console.log(fruit);
});

// Map (transformer un tableau)
const chiffres = [1, 2, 3];
const carres = chiffres.map(x => x * x);
console.log(carres);  // [1, 4, 9]
```

---

## 4. Modules et imports

### Pourquoi les modules ?

Un programme JavaScript peut devenir énorme. Les **modules** permettent de diviser le code en fichiers.

### Exporter depuis un fichier

Fichier `math.js` :

```javascript
// Exporter une fonction
function additionner(a, b) {
  return a + b;
}

function multiplier(a, b) {
  return a * b;
}

module.exports = {
  additionner,
  multiplier
};
```

### Importer dans un autre fichier

Fichier `app.js` :

```javascript
// Importer le module
const math = require('./math');

console.log(math.additionner(5, 3));    // Affiche: 8
console.log(math.multiplier(4, 5));     // Affiche: 20
```

### Syntaxe ES6 (import/export)

Node.js supporte aussi la syntaxe moderne ES6 :

Fichier `math.js` :

```javascript
export function additionner(a, b) {
  return a + b;
}

export function multiplier(a, b) {
  return a * b;
}
```

Fichier `app.js` :

```javascript
import { additionner, multiplier } from './math.js';

console.log(additionner(5, 3));
```

> **Note** : pour utiliser `import/export`, vous devez ajouter `"type": "module"` dans `package.json`.

---

## 5. NPM et les packages

### Qu'est-ce que NPM ?

**NPM** (Node Package Manager) est un gestionnaire de dépendances. Il permet d'installer et de gérer les librairies que vous utilisez.

### `package.json`

Chaque projet Node.js a un fichier `package.json` qui décrit les dépendances.

Créez un nouveau dossier et initialisez :

```bash
mkdir mon-projet
cd mon-projet
npm init -y
```

Cela crée un fichier `package.json` basique :

```json
{
  "name": "mon-projet",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### Installer un package

```bash
npm install express
```

Cela :
1. Télécharge la libraire `express` depuis npm.org
2. La place dans un dossier `node_modules/`
3. Ajoute une entrée à `package.json`

Votre fichier `package.json` devient :

```json
{
  "name": "mon-projet",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

### Utiliser un package

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bonjour !');
});

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});
```

### Commandes NPM courantes

```bash
npm install PACKAGE              # Installer une dépendance
npm install                      # Installer toutes les dépendances (depuis package.json)
npm uninstall PACKAGE            # Désinstaller
npm list                         # Voir les packages installés
npm outdated                     # Voir les mises à jour disponibles
npm update                       # Mettre à jour les packages
npm start                        # Lance le script "start" du package.json
npm run SCRIPT                   # Lance un script personnalisé
```

---

## 6. Fondamentaux JavaScript async

Node.js excelle à gérer l'**asynchrone** (attendre sans bloquer).

### Le problème du synchrone

```javascript
// BLOQUANT : affiche 1, puis attend 3 secondes, puis affiche 2
console.log(1);
setTimeout(() => console.log(2), 3000);  // Attendre 3000ms
console.log(3);

// Résultat : 1, 3, puis après 3s : 2
```

JavaScript n'a pas arrêté à la ligne `setTimeout` ; il a continué.

### Callbacks

Les **callbacks** étaient la première solution pour gérer l'async :

```javascript
// Fonction qui prend un callback
function lireUnFichier(chemin, callback) {
  setTimeout(() => {
    callback(null, "Contenu du fichier");  // null = pas d'erreur
  }, 1000);
}

// Utilisation
lireUnFichier("/mon/fichier.txt", (erreur, contenu) => {
  if (erreur) {
    console.log("Erreur :", erreur);
  } else {
    console.log("Contenu :", contenu);
  }
});
```

**Problème** : si vous avez plusieurs opérations async imbriquées, ça devient le "callback hell" :

```javascript
lireUnFichier(file1, (err, data1) => {
  if (!err) {
    lireUnFichier(file2, (err, data2) => {
      if (!err) {
        lireUnFichier(file3, (err, data3) => {
          // ... très difficile à lire !
        });
      }
    });
  }
});
```

### Promises

Les **promises** rendent ça plus clair :

```javascript
// Promise qui se résout après 1 seconde
function lireUnFichier(chemin) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("Contenu du fichier");
    }, 1000);
  });
}

// Utilisation avec .then()
lireUnFichier("/fichier1.txt")
  .then(contenu => {
    console.log("1:", contenu);
    return lireUnFichier("/fichier2.txt");
  })
  .then(contenu => {
    console.log("2:", contenu);
  })
  .catch(erreur => {
    console.log("Erreur :", erreur);
  });
```

### Async/Await (moderne et lisible)

C'est la **meilleure syntaxe** pour l'async en JavaScript moderne :

```javascript
// Fonction asynchrone
async function executerOperations() {
  try {
    const contenu1 = await lireUnFichier("/fichier1.txt");
    console.log("1:", contenu1);
    
    const contenu2 = await lireUnFichier("/fichier2.txt");
    console.log("2:", contenu2);
    
    const contenu3 = await lireUnFichier("/fichier3.txt");
    console.log("3:", contenu3);
  } catch (erreur) {
    console.log("Erreur :", erreur);
  }
}

// Appeler la fonction
executerOperations();
```

**C'est du JavaScript normal**, mais on peut utiliser `await` pour "attendre" une Promise comme si c'était du code synchrone.

---

## 7. Créer un serveur HTTP

### Serveur basique avec le module `http`

```javascript
// Importer le module natif 'http'
const http = require('http');

// Créer un serveur
const serveur = http.createServer((req, res) => {
  console.log(`Requête reçue: ${req.method} ${req.url}`);
  
  // Définir l'en-tête HTTP
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  
  // Envoyer la réponse
  res.end('Bonjour, bienvenue sur mon serveur !');
});

// Écouter sur le port 3000
serveur.listen(3000, () => {
  console.log('Serveur écoute sur http://localhost:3000');
});
```

Sauvegardez dans `server.js` et lancez :

```bash
node server.js
```

Ouvrez `http://localhost:3000` dans votre navigateur. Vous verrez le message !

### Répondre différemment selon l'URL

```javascript
const http = require('http');

const serveur = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Accueil</h1>');
  } else if (req.url === '/api/donnees') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Voici les données' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page non trouvée');
  }
});

serveur.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});
```

Essayez :
- `http://localhost:3000/` → Accueil
- `http://localhost:3000/api/donnees` → JSON
- `http://localhost:3000/autre` → 404

---

## 8. Introduction à Express

### Pourquoi Express ?

Créer un serveur avec `http` natif fonctione, mais c'est verbeux. **Express** est un framework qui simplifie tout :

```javascript
// Avec Express
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bonjour !');
});

app.listen(3000);
```

### Installer Express

```bash
npm install express
```

### Routage simple

```javascript
const express = require('express');
const app = express();

// Route GET
app.get('/', (req, res) => {
  res.send('Page d\'accueil');
});

// Route avec paramètre
app.get('/utilisateur/:id', (req, res) => {
  const id = req.params.id;
  res.send(`Utilisateur ${id}`);
});

// Route POST
app.post('/api/donnees', (req, res) => {
  res.json({ message: 'Donnée reçue' });
});

// 404
app.use((req, res) => {
  res.status(404).send('Non trouvé');
});

app.listen(3000, () => {
  console.log('Serveur sur http://localhost:3000');
});
```

### Middleware

Les middleware sont des fonctions qui s'exécutent avant d'atteindre la route :

```javascript
const express = require('express');
const app = express();

// Middleware global
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();  // Continuer vers la prochaine fonction
});

// Parser JSON
app.use(express.json());

app.post('/api/data', (req, res) => {
  console.log('Données reçues:', req.body);
  res.json({ ok: true });
});

app.listen(3000);
```

### Servir des fichiers statiques

```javascript
const express = require('express');
const app = express();

// Servir tous les fichiers du dossier 'public'
app.use(express.static('public'));

app.listen(3000);
```

Créez un dossier `public/` avec `index.html`, et accédez à `http://localhost:3000/index.html`.

---

## 9. Événements et Streams

### EventEmitter

Node.js permet d'émettre et d'écouter des événements :

```javascript
const EventEmitter = require('events');

// Créer un "émetteur"
const emitter = new EventEmitter();

// Écouter un événement
emitter.on('salut', (nom) => {
  console.log(`Bonjour ${nom} !`);
});

// Émettre l'événement
emitter.emit('salut', 'Alice');      // Affiche: Bonjour Alice !
emitter.emit('salut', 'Bob');        // Affiche: Bonjour Bob !
```

### Streams

Les streams permettent de traiter de gros fichiers sans tout charger en mémoire :

```javascript
const fs = require('fs');

// Lire un fichier en stream
const lecture = fs.createReadStream('gros-fichier.txt');

lecture.on('data', (chunk) => {
  console.log(`Reçu ${chunk.length} bytes`);
});

lecture.on('end', () => {
  console.log('Fin de la lecture');
});

lecture.on('error', (err) => {
  console.log('Erreur :', err);
});
```

---

## 10. Fichiers et Système

### Lire un fichier

```javascript
const fs = require('fs');

// Asynchrone (recommandé)
fs.readFile('/mon/fichier.txt', 'utf-8', (err, data) => {
  if (err) {
    console.log('Erreur:', err);
  } else {
    console.log('Contenu:', data);
  }
});

// Ou avec async/await
async function lireFichier() {
  try {
    const data = await fs.promises.readFile('/mon/fichier.txt', 'utf-8');
    console.log('Contenu:', data);
  } catch (err) {
    console.log('Erreur:', err);
  }
}

lireFichier();
```

### Écrire un fichier

```javascript
const fs = require('fs');

// Overwrite (remplacer)
fs.writeFile('/mon/fichier.txt', 'Nouveau contenu', (err) => {
  if (err) console.log('Erreur:', err);
  else console.log('Fichier écrit !');
});

// Ajouter du contenu
fs.appendFile('/mon/fichier.txt', '\nNouvelle ligne', (err) => {
  if (err) console.log('Erreur:', err);
});
```

### Lister des fichiers

```javascript
const fs = require('fs');

fs.readdir('./', (err, files) => {
  if (err) {
    console.log('Erreur:', err);
  } else {
    console.log('Fichiers du dossier:', files);
  }
});
```

### Variables d'environnement

```javascript
// Définir dans le terminal
// export MON_VAR="ma valeur"
// ou dans un fichier .env

console.log(process.env.MON_VAR);     // Affiche la valeur
console.log(process.env.HOME);        // Dossier utilisateur
console.log(process.env.USER);        // Nom d'utilisateur
```

---

## 11. Débogage et bonnes pratiques

### Débogage simple

```javascript
// Afficher des informations
console.log('Info');
console.warn('Attention !');
console.error('Erreur !');
console.table([{ nom: 'Alice', age: 30 }]);

// Timer
console.time('mon-timer');
// ... du code ...
console.timeEnd('mon-timer');  // Affiche le temps écoulé
```

### Bonnes pratiques

1. **Utilisez `const` par défaut**, `let` si ça change, jamais `var`.
2. **Async/await** plutôt que callbacks.
3. **Nommez vos fonctions clairement** : `lireUtilisateur()` plutôt que `read()`.
4. **Gérez les erreurs** avec try/catch ou `.catch()`.
5. **Loggez utile** : pas des milliers de logs, mais du pertinent.
6. **Testez votre code** (Jest, Mocha…).
7. **À la production** : utilisez un process manager (PM2) pour redémarrer automatiquement.

### Exemple complet : serveur avec lectures fichier

```javascript
const express = require('express');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

// Route GET
app.get('/api/config', async (req, res) => {
  try {
    const data = await fs.readFile('./config.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

// Route POST
app.post('/api/sauvegarder', async (req, res) => {
  try {
    await fs.writeFile('./donnees.json', JSON.stringify(req.body));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
});

app.listen(3000, () => console.log('Serveur sur :3000'));
```

---

## Exercices pratiques

1. **Créer un serveur Express** qui affiche "Welcome" à `/`.
2. **Route paramétrée** : `/greet/:name` affiche "Hello NAME".
3. **POST request** : `/api/message` reçoit un JSON et le sauvegarde.
4. **Lire un fichier** depuis une route GET.
5. **Middleware** qui log toutes les requêtes.

---

## Ressources utiles

- [Node.js docs officielles](https://nodejs.org/docs)
- [Express.js guide](https://expressjs.com)
- [JavaScript.info](https://javascript.info)
- [MDN Web Docs](https://developer.mozilla.org)

---

Vous avez maintenant les bases pour comprendre, modifier et étendre notre projet ! 🚀

Des questions sur une partie spécifique ?
