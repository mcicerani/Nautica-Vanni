// Imposta i nomi dei cookie in base alle categorie
var necessaryCookies = ["_GRECAPTCHA","SID","HSID",];
var analyticsCookies = ["1P_JAR", "OTZ", "UULE", "AEC"];
var marketingCookies = ["SOCS", "CONSENT", "NID"];
// Verifica se il cookie "cookieBannerAccepted" esiste già
if (document.cookie.split(';').some((item) => item.trim().startsWith('cookieBannerAccepted='))) {
    // Se esiste, nascondi il banner dei cookie
    document.getElementById("cookie-banner").style.display = "none";
}
// Recupera il banner dei cookie e i pulsanti
var cookieBanner = document.getElementById("cookie-banner");
var cookieAcceptButton = document.getElementById("cookie-accept");
var cookiePreferencesButton = document.getElementById("cookie-preferences");
var cookieSaveButton = document.getElementById("cookie-save");

// Recupera le caselle di controllo
var necessaryCheckbox = document.getElementById("necessary-cookies");
var analyticsCheckbox = document.getElementById("analytics-cookies");
var marketingCheckbox = document.getElementById("marketing-cookies");

// Nascondi le caselle di controllo all'avvio
document.getElementById("cookie-preferences-box").style.display = "none";

// Aggiungi un ascoltatore per il pulsante "Accetta"
cookieAcceptButton.addEventListener("click", function() {
    // Imposta tutti i cookie come accettati
    setCookie(["necessaryCookies", "analyticsCookies", "marketingCookies"], 365);

    // Nascondi il banner dei cookie
    cookieBanner.style.display = "none";
});

// Aggiungi un ascoltatore per il pulsante "Preferenze"
cookiePreferencesButton.addEventListener("click", function() {
    // Mostra le caselle di controllo
    document.getElementById("cookie-preferences-box").style.display = "block";
});

// Aggiungi un ascoltatore per il pulsante "Salva preferenze"
cookieSaveButton.addEventListener("click", function() {
    // Recupera le caselle di controllo e salva le preferenze dell'utente
    var necessaryChecked = necessaryCheckbox.checked;
    var analyticsChecked = analyticsCheckbox.checked;
    var marketingChecked = marketingCheckbox.checked;

    // Imposta i cookie in base alle preferenze dell'utente
    if (necessaryChecked) {
    setCookie(["necessaryCookies"], 365)
    }
    if (analyticsChecked) {
        setCookie(["analyticsCookies"], 365);
    } else {
        deleteCookie(["analyticsCookies"]);
    }
    if (marketingChecked) {
        setCookie(["marketingCookies",], 365);
    } else {
        deleteCookie(["marketingCookies"]);
    }

    // Nascondi il banner dei cookie dopo aver salvato le preferenze
    cookieBanner.style.display = "none";
    document.getElementById("cookie-preferences-box").style.display = "none";
});

// Funzione per impostare un cookie con un determinato nome e durata
function setCookie(cookieNames, duration) {
    var expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (duration * 24 * 60 * 60 * 1000));
    cookieNames.forEach(function(cookieName) {
        document.cookie = cookieName + "=true; expires=" + expirationDate.toUTCString() + "; path=/; SameSite=Lax";
    });
    // Imposta un cookie che indica che il banner dei cookie è stato accettato
    document.cookie = "cookieBannerAccepted=true; expires=" + expirationDate.toUTCString() + "; path=/; SameSite=Lax";
}            

function deleteCookie(cookieNames) {
cookieNames.forEach(function(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
});
}

// function to toggle burger icon
const x = document.querySelector(".hamburger");
x.addEventListener("click", function(){
    x.classList.toggle("change");
});

//Function to toggle the menu on mobile
const menu = document.querySelector(".nav__mobile");
const menuItems = document.querySelectorAll(".nav__mobile__item");
const hamburger= document.querySelector(".hamburger");


function toggleMenu() {
    if (menu.classList.contains("shownav__mobile")) {
        menu.classList.remove("shownav__mobile");
        closeIcon.style.display = "none";
        menuIcon.style.display = "block";
    } else {
        menu.classList.add("shownav__mobile");
        closeIcon.style.display = "block";
        menuIcon.style.display = "none";
    }
}
hamburger.addEventListener("click", toggleMenu);

menuItems.forEach( 
    function(menuItem) { 
        menuItem.addEventListener("click", toggleMenu);
    });

const homeMenu = document.querySelector(".home__nav__mobile");
const homeMenuItems = document.querySelectorAll(".home__nav__mobile__item");


function toggleHomeMenu() {
    if (homeMenu.classList.contains("shownav__mobile")) {
        homeMenu.classList.remove("shownav__mobile");
        closeIcon.style.display = "none";
        menuIcon.style.display = "block";
    } else {
        homeMenu.classList.add("shownav__mobile");
        closeIcon.style.display = "block";
        menuIcon.style.display = "none";
    }
}
hamburger.addEventListener("click", toggleHomeMenu);

homeMenuItems.forEach( 
    function(homeMenuItem) { 
        homeMenuItem.addEventListener("click", toggleHomeMenu);
    });


//Funzione per immagine a schermo onclick

function showImage(image) {
    var imageContainer = document.querySelector('.imageContainer');
    var fullscreenImage = document.getElementById('image__fullscreen');
    fullscreenImage.style.backgroundImage = `url(${image.src})`;
    imageContainer.style.display = 'block';
}

var images = document.querySelectorAll('.image');
images.forEach(function(image) {
    image.addEventListener('click', function() {
        showImage(image);
    });
});

var closeButton = document.getElementById('close');
closeButton.addEventListener('click', function() {
    var imageContainer = document.querySelector('.imageContainer');
    imageContainer.style.display = 'none';
});



// Funzione per il Form di contatto
document.getElementById("submit").addEventListener("click", function validateForm() {
    var x = document.forms["Contattaci"]["name"].value;
    var y = document.forms["Contattaci"]["email"].value;
    var z = document.forms["Contattaci"]["message"].value;
    if (x == "" || y == "" || z == "") {
        alert("I campi non possono essere vuoti");
        return false; // Impedisce l'invio del modulo
    } else {
        alert("Grazie per averci contattato! Ti risponderemo al più presto.");
    }
});


