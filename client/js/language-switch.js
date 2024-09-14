document.addEventListener("DOMContentLoaded", function() {
    const languageSwitchButton = document.getElementById("language-switch-button");
    const currentLanguage = localStorage.getItem('language') || 'en'; // Standardmäßig Englisch

    function switchLanguage(language) {
        // Speichere die ausgewählte Sprache
        localStorage.setItem('language', language);

        // Passe die Texte der Seite basierend auf der ausgewählten Sprache an
        if (language === 'de') {
            document.getElementById("heading").textContent = "Recycling in Hamburg - WebGIS";
            document.getElementById("searchButton").textContent = "Suchen";
            document.getElementById("findLocationButton").textContent = "Mein Standort";
            // Füge mehr Anpassungen für Deutsch hinzu
        } else {
            document.getElementById("heading").textContent = "Recycling in Hamburg - WebGIS";
            document.getElementById("searchButton").textContent = "Search";
            document.getElementById("findLocationButton").textContent = "Find Location";
            // Füge mehr Anpassungen für Englisch hinzu
        }
    }

    // Sprachumschaltung beim Klicken
    languageSwitchButton.addEventListener("click", function() {
        const newLanguage = currentLanguage === 'en' ? 'de' : 'en';
        switchLanguage(newLanguage);
    });

    // Lade die aktuelle Sprache beim Laden der Seite
    switchLanguage(currentLanguage);
});
