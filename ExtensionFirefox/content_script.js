// Initialiser le temps passé sur le site
let startTime = Date.now();
let totalTimeSpent = 0;

// Charger la limite de temps sauvegardée
chrome.storage.local.get(['timeLimit'], function(result) {
    const timeLimit = result.timeLimit || 0;

    // Mettre à jour le temps passé toutes les minutes
    setInterval(function() {
        const currentTime = Date.now();
        const sessionTime = Math.floor((currentTime - startTime) / 1000); // en secondes
        totalTimeSpent += sessionTime;

        console.log("Temps passé sur le site :", totalTimeSpent / 60, "minutes");
        
        // Vérifier si la limite de temps est atteinte
        if (timeLimit && totalTimeSpent >= timeLimit) {
            alert("Temps limite atteint ! Vous devez quitter ce site.");
            document.body.innerHTML = "<h1>Accès bloqué : Temps limite atteint.</h1>";
        }

        // Remettre à zéro le compteur de temps
        startTime = Date.now();
    }, 60000); // toutes les 60 secondes
});
