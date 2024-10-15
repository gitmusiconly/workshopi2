// Liste des sites de réseaux sociaux à bloquer
const socialMediaDomains = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'tiktok.com',
    'snapchat.com',
    'youtube.com'
];

// Code de validation pour désactiver le blocage (à personnaliser)
const parentCode = '1234';

// Fonction pour afficher le pop-up de blocage couvrant toute la page avec un bouton pour désactiver
function displayTimeLimitExceededPopup() {
    const messageDiv = document.createElement('div');
    messageDiv.setAttribute('id', 'time-limit-exceeded');
    messageDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.85); /* Fond opaque pour bloquer la page */
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            font-size: 20px;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
        ">
            <div style="max-width: 600px;">
                <h1 style="font-size: 28px; margin-bottom: 20px;">Temps Limite Atteint</h1>
                <p>Le temps d'utilisation autorisé pour ce site est écoulé. Veuillez quitter cette page.</p>
                <br>
                <input type="password" id="parentCodeInput" placeholder="Entrer le code parent">
                <button id="disableBlockButton" style="
                    margin-top: 10px;
                    padding: 10px;
                    font-size: 16px;
                    background-color: green;
                    color: white;
                    border: none;
                    cursor: pointer;
                ">Désactiver le Blocage</button>
            </div>
        </div>
    `;

    // Ajouter le pop-up de blocage à la page
    document.body.innerHTML = "";  // Supprime le contenu de la page
    document.body.appendChild(messageDiv);  // Affiche le blocage

    // Ajouter un événement pour le bouton de désactivation
    document.getElementById('disableBlockButton').addEventListener('click', function() {
        const enteredCode = document.getElementById('parentCodeInput').value;
        if (enteredCode === parentCode) {
            // Si le code est correct, désactiver le blocage et restaurer la page
            document.body.innerHTML = `<h1>Blocage désactivé</h1><p>Vous pouvez à nouveau accéder au site.</p>`;
            chrome.storage.local.remove('endTime'); // Réinitialise la limite de temps
        } else {
            alert("Code incorrect. Vous ne pouvez pas désactiver le blocage.");
        }
    });
}

// Fonction pour vérifier si l'URL actuelle appartient à un réseau social
function isSocialMediaSite() {
    const currentUrl = window.location.hostname; // Récupère le domaine actuel
    return socialMediaDomains.some(domain => currentUrl.includes(domain));
}

// Fonction pour démarrer une vérification périodique du temps limite
function startPeriodicTimeCheck() {
    // Vérifier toutes les 500 ms (2 fois par seconde)
    setInterval(function() {
        // Ne vérifier que si l'utilisateur est sur un site de réseaux sociaux
        if (isSocialMediaSite()) {
            chrome.storage.local.get(['endTime'], function(result) {
                const now = Date.now();
                const endTime = result.endTime || 0;

                if (endTime > 0 && now >= endTime) {
                    // Si le temps est écoulé, afficher immédiatement le pop-up de blocage
                    displayTimeLimitExceededPopup();
                }
            });
        }
    }, 500); // Vérification toutes les 500ms pour plus de réactivité
}

// Vérifier immédiatement au chargement de la page et démarrer la vérification périodique
startPeriodicTimeCheck();

// Écouter les changements de la clé "endTime" dans chrome.storage
chrome.storage.onChanged.addListener(function(changes, area) {
    if (area === 'local' && changes.endTime) {
        const newEndTime = changes.endTime.newValue;
        const now = Date.now();

        // Ne vérifier que si l'utilisateur est sur un site de réseaux sociaux
        if (isSocialMediaSite() && newEndTime > 0 && now >= newEndTime) {
            // Afficher le pop-up de blocage si le temps est écoulé
            displayTimeLimitExceededPopup();
        }
    }
});
