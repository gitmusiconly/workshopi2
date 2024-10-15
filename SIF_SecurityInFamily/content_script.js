// Liste des sites de réseaux sociaux à surveiller
const socialMediaDomains = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'tiktok.com',
    'snapchat.com',
    'youtube.com'
];

let socialMediaTimerInterval = null; // Variable pour stocker l'intervalle de temps
let timeRemaining = 0; // Temps restant
let timerStarted = false; // Indicateur si le compteur a démarré

// Fonction pour vérifier si l'URL actuelle appartient à un réseau social
function isSocialMediaSite() {
    const currentUrl = window.location.hostname; // Récupère le domaine actuel
    return socialMediaDomains.some(domain => currentUrl.includes(domain));
}

// Fonction pour démarrer le compteur de temps seulement sur un site de réseau social
function startSocialMediaTimer() {
    if (timerStarted || !isSocialMediaSite()) return; // Ne démarre que sur les sites de réseaux sociaux

    chrome.storage.local.get(['endTime'], function(result) {
        const now = Date.now();
        const endTime = result.endTime || 0;

        // Si le temps limite est déjà dépassé, afficher le blocage
        if (endTime > 0 && now >= endTime) {
            displayTimeLimitExceededPopup(); // Affiche immédiatement le blocage
            return;
        }

        // Calcul du temps restant
        timeRemaining = Math.floor((endTime - now) / 1000); // En secondes

        // Démarrer le compte à rebours si le temps restant est supérieur à zéro
        if (timeRemaining > 0) {
            socialMediaTimerInterval = setInterval(function() {
                if (isSocialMediaSite()) {
                    timeRemaining--;

                    // Si le temps est écoulé, afficher immédiatement le blocage
                    if (timeRemaining <= 0) {
                        clearInterval(socialMediaTimerInterval); // Arrêter le timer
                        socialMediaTimerInterval = null;
                        timerStarted = false;
                        displayTimeLimitExceededPopup(); // Afficher immédiatement le blocage
                    }
                } else {
                    clearInterval(socialMediaTimerInterval); // Arrêter le compteur si on quitte un site de réseau social
                    socialMediaTimerInterval = null;
                    timerStarted = false;
                }
            }, 1000); // Mise à jour chaque seconde
            timerStarted = true;
        }
    });
}

// Fonction pour arrêter le compteur si l'utilisateur quitte un site de réseau social
function stopSocialMediaTimer() {
    if (socialMediaTimerInterval) {
        clearInterval(socialMediaTimerInterval); // Arrêter le timer
        socialMediaTimerInterval = null;
        timerStarted = false;
        console.log("Le compteur a été arrêté car l'utilisateur a quitté un site de réseau social.");
    }
}

// Fonction pour surveiller les changements de page ou d'onglet
function monitorPageChanges() {
    if (isSocialMediaSite()) {
        startSocialMediaTimer(); // Démarre le compteur si on est sur un site de réseau social
    } else {
        stopSocialMediaTimer(); // Arrête le compteur si on quitte un site de réseau social
    }
}

// Surveiller les changements d'URL à l'ouverture de la page et à chaque changement d'onglet ou de navigation
window.addEventListener('load', monitorPageChanges);
window.addEventListener('hashchange', monitorPageChanges);
window.addEventListener('popstate', monitorPageChanges);
window.addEventListener('beforeunload', stopSocialMediaTimer); // Arrête le timer si la page se ferme

// Fonction pour afficher le pop-up de blocage couvrant toute la page
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
            <div style="max-width: 600px; background-color: rgba(255, 255, 255, 1); padding: 20px; border-radius: 10px;">
                <h1 style="font-size: 28px; margin-bottom: 20px; color: black;">Temps Limite Atteint</h1>
                <p style="color: black;">Le temps d'utilisation autorisé pour ce site est écoulé. Veuillez quitter cette page ou entrer le code parent pour désactiver le blocage.</p>
                <br>
                <input type="password" id="parentCodeInput" placeholder="Entrer le code parent" style="width: 100%; padding: 10px; font-size: 16px;">
                <button id="disableBlockButton" style="
                    margin-top: 10px;
                    padding: 10px;
                    font-size: 16px;
                    background-color: green;
                    color: white;
                    border: none;
                    cursor: pointer;
                    width: 100%;
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
        if (enteredCode === '1234') {  // Code parental
            // Si le code est correct, désactiver le blocage et restaurer la page
            document.body.innerHTML = `<h1>Blocage désactivé</h1><p>Vous pouvez à nouveau accéder au site.</p>`;
            chrome.storage.local.remove('endTime'); // Réinitialise la limite de temps
        } else {
            alert("Code incorrect. Vous ne pouvez pas désactiver le blocage.");
        }
    });
}
