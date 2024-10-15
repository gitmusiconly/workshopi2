// Initialiser le temps passé sur le site
let startTime = Date.now();

// Charger la limite de temps sauvegardée
chrome.storage.local.get(['timeLimit'], function(result) {
    const timeLimit = result.timeLimit || 0; // Limite en secondes

    // Si aucune limite n'est définie, on arrête le script
    if (timeLimit === 0) {
        console.log("Aucune limite de temps définie.");
        return;
    }

    // Mettre à jour le temps passé toutes les secondes
    const interval = setInterval(function() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000); // en secondes

        console.log("Temps écoulé sur ce site :", elapsedTime / 60, "minutes");

        // Vérifier si la limite de temps est atteinte
        if (elapsedTime >= timeLimit) {
            alert("Temps limite atteint ! Vous devez quitter ce site.");
            document.body.innerHTML = "<h1>Accès bloqué : Temps limite atteint.</h1>";

            // Effacer l'intervalle pour arrêter le compteur
            clearInterval(interval);
        }
    }, 1000); // Vérifier toutes les secondes
});





