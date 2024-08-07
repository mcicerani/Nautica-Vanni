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


