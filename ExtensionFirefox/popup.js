// Code parental préconfiguré
const parentCode = "1234"; 

// Gestion du signalement de contenu
document.getElementById('reportButton').addEventListener('click', function() {
    document.getElementById('reportStatus').textContent = 'Contenu signalé ! Merci de contribuer.';
});

// Gestion de la limitation du temps avec code parental
document.getElementById('setLimit').addEventListener('click', function() {
    console.log("Bouton 'Définir Limite' cliqué !");
    
    let timeLimit = document.getElementById('timeLimit').value;
    let enteredCode = document.getElementById('parentCode').value;

    console.log("Limite de temps entrée :", timeLimit);
    console.log("Code parental entré :", enteredCode);

    // Vérifie si le code parental est correct
    if (enteredCode === parentCode) {
        if (timeLimit) {
            // Enregistrer la limite de temps en secondes dans chrome.storage
            chrome.storage.local.set({ 'timeLimit': timeLimit * 60 }, function() {
                console.log("Limite de temps sauvegardée :", timeLimit);
                alert("Limite de temps définie à " + timeLimit + " minutes.");
            });
        } else {
            alert("Veuillez entrer une limite de temps valide.");
        }
    } else {
        alert("Code parental incorrect. Vous ne pouvez pas modifier la limite.");
    }

    // Vider le champ du code parental après avoir cliqué
    document.getElementById('parentCode').value = '';
});
