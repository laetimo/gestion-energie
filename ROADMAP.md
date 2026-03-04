# Roadmap et Améliorations

## 🎯 Vision à long terme

Créer une **plateforme complète de suivi énergétique** :
- 📊 Dashboard puissant
- 🏠 Support multi-bâtiments
- 🔌 Connecteurs multiples (Linky, Gaz, Eau, etc.)
- 📱 App mobile native
- ☁️ Sync cloud optionnelle
- 📈 Analytics avancée
- 🤖 Prédictions ML

---

## Phase 1 : MVP (Actuellement) ✅

**Objectif** : Solution de base fonctionnelle

- ✅ Lecture Linky via TIC
- ✅ Capteurs Bluetooth (base)
- ✅ Dashboard web
- ✅ Graphiques 24h/72h/7j
- ✅ Stockage local SQLite
- ✅ Deployment Docker
- ✅ Documentation

**Estimation de temps** : 1-2 semaines pour utilisateur standard

---

## Phase 2 : Stabilité (1-2 mois) 🔄

### Améliorations Linky
- [ ] Support TIC Mode Historique
- [ ] Support TIC Mode Standard
- [ ] Synchronisation automatique Linky API (Enedis)
- [ ] Detection automatique du port série
- [ ] Logging des erreurs de connexion

### Améliorations Capteurs BLE
- [ ] Support plus de modèles (Tado, Eve, etc.)
- [ ] Pairing/mémorisation capteurs
- [ ] Distance/signal strength mapping
- [ ] Détection de perte de signal
- [ ] Mise en cache des données BLE

### Dashboard
- [ ] Dark mode toggle
- [ ] Responsive amélioré (mobile)
- [ ] Fullscreen mode
- [ ] Rafraîchissement personnalisable
- [ ] Tableau comparatif (jour/semaine/mois)

### Performance
- [ ] Compression des données anciennes
- [ ] Archivage/export automatique
- [ ] Cache Redis optionnel
- [ ] Optimisation requêtes SQL

---

## Phase 3 : Fonctionnalités (2-3 mois) 🚀

### Alertes & Notifications
- [ ] Alerte seuil puissance
- [ ] Alerte anomalie température
- [ ] Email/SMS notifications
- [ ] Push notifications web
- [ ] Webhooks personnalisés

### Fichier d'énergie
- [ ] Facturation automatique
- [ ] Historique conso/tarif
- [ ] Estimation facture
- [ ] Comparaison année précédente
- [ ] Données par tranche horaire

### Contrôle
- [ ] Commande radiateurs connectés
- [ ] Commande lampes (si Linky Phase)
- [ ] Scénarios automatisés
- [ ] Intégration Home Assistant
- [ ] API REST pour automations

### Multi-bâtiments
- [ ] Support >1 compteur Linky
- [ ] Grouper par pièce/section
- [ ] Répartition consommation
- [ ] Vue consolidée

---

## Phase 4 : Analytics (3-6 mois) 📈

### Analyses avancées
- [ ] Breakdown par type d'appareil
- [ ] Estimation économies isolation
- [ ] Prédiction consommation (Prophet/ML)
- [ ] Benchmark maison moyenne France
- [ ] Recommandations personnalisées

### Rapports
- [ ] Génération PDF automatique
- [ ] Export CSV/Excel complet
- [ ] Visualisations interactives (D3.js)
- [ ] Tableau de bord exécutif

### Intégrations
- [ ] Export vers Grafana
- [ ] Push vers InfluxDB
- [ ] Home Assistant intégration native
- [ ] Synchronisation Google Home/Alexa
- [ ] API publique (GraphQL)

---

## Phase 5 : Mobilité (3-4 mois) 📱

### App Android
- [ ] App native Kotlin
- [ ] Authentification biométrique
- [ ] Notifications push
- [ ] Mode hors-ligne (cache)
- [ ] Widgets Android

### App iOS
- [ ] SwiftUI app
- [ ] Widgets iOS
- [ ] Siri shortcuts

### Sync
- [ ] Cloud backup optionnel (Nextcloud, etc.)
- [ ] Multi-device sync
- [ ] Version history

---

## Phase 6 : Écosystème (>6 mois) 🌍

### Extensions
- [ ] Compteur gaz (Gazpar)
- [ ] Compteur eau (Aquarelle, etc.)
- [ ] Panneaux solaires (monitoring)
- [ ] Batterie (PowerWall, etc.)

### Marketplace
- [ ] Plugins communautaires
- [ ] Capteurs tiers
- [ ] Intégrations

### Commerce
- [ ] Version SaaS cloud
- [ ] Support commercial
- [ ] Licence entreprise

---

## Priorités actuelles

### Priority 1 (URGENT) 🔴
- [x] Lecteur Linky de base
- [x] Dashboard fonctionnel
- [x] BLE scan simple
- [ ] Robustesse (gestion erreurs, reconnexion)
- [ ] Documentation utilisateur

### Priority 2 (Important) 🟡
- [ ] Alertes seuil puissance
- [ ] Support multi-capteurs fiable
- [ ] Export données
- [ ] Authentification (login)
- [ ] Tests automatisés

### Priority 3 (Souhait) 🟢
- [ ] Dark mode
- [ ] App mobile
- [ ] Analytics
- [ ] Cloud sync
- [ ] Marketplace

---

## Propositions d'utilisateurs bienvenues ! 🙏

Vous rencontrez un besoin non listée?

1. **Créer une issue** sur GitHub
2. **Décrire votre cas d'usage** en détail
3. **Ajouter vos données** (nombre d'utilisateurs intéressés)
4. Je peux l'ajouter au roadmap!

---

## Dépendances d'implémentation

```
Phase 2 dépend de Phase 1 ✅
Phase 3 dépend de Phase 2
  - Alertes → nécessite stabilité
  - Billing → nécessite BLE multiples
Phase 4 dépend de Phase 3
  - Analytics → nécessite données complètes
Phase 5 dépend de Phase  3
  - App mobile → nécessite API stable
Phase 6 dépend de tout
  - Écosystème → tous modules de base
```

---

## Ressources estimées

| Phase | Temps | Complexité | Ressources |
|-------|-------|-----------|-----------|
| 1 (MVP) | 1-2 sem | Faible | 1 dev |
| 2 (Stabil) | 1-2 mois | Moyen | 1 dev |
| 3 (Features) | 2-3 mois | Moyen | 1-2 dev |
| 4 (Analytics) | 3-6 mois | Haut | 2 dev + ML |
| 5 (Apps) | 3-4 mois | Haut | 2 dev |
| 6 (Écosystem) | >6 mois | Très haut | 3+ dev |

---

## Stack technologique futur

### Actuellement
```
Frontend: HTML/CSS/JS + Socket.io
Backend: Node.js + Express + SQLite
Hardware: Serial/Bluetooth
Deploy: Docker
```

### Probable (Phase 3+)
```
Frontend: React/Vue + Redux + TailwindCSS
Backend: Node.js + GraphQL API
Database: PostgreSQL + Redis cache
Analytics: Python ML models
Deploy: Kubernetes + Helm
Mobile: React Native ou Kotlin
Cloud: AWS/GCP/Azure
```

---

## Contribution

Vous voulez aider?

**Niveaux de contribution** :
1. **Reporter bugs** - Ouvrir issues
2. **Proposer features** - Discussions
3. **Contribuer code** - Pull requests
4. **Tester** - Feedback sur phases
5. **Sponsoriser** - Accélérer développement

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) (à créer)

---

## Changelog

### v1.0.0 - 2026-03-04 (Initial Release)
- ✨ Lecteur Linky TIC
- ✨ Dashboard web responsive
- ✨ Capteurs Bluetooth BLE
- ✨ Graphiques temps réel + historique
- ✨ Stockage SQLite
- ✨ Docker deployment
- 📚 Documentation complète

**Prochaine version** : v1.1.0 (prévue fin mars)
- 🐛 Fixes stabilité
- ⚡ Optimisations performance
- 📈 Support v2 API Linky

---

**Question sur le roadmap?** Ouvrez une issue ou contactez-moi! 🚀
