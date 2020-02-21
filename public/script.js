var hamburgerButton = document.getElementById("men");
var hamburgerMenu = document.getElementById("hamburger-menu");
var xes = document.querySelectorAll(".x");
console.log("xes: ", xes);
var x1 = xes[0];
var whiteMenu = document.getElementById("menu");

//jquery
var xx = $(".x");
var x0 = xx.eq(0);
var modalDialog = $("#modal-dialog");
console.log(modalDialog);
var onJQ = $(".onJQ");
console.log(onJQ);

hamburgerButton.addEventListener("click", function() {
    hamburgerMenu.classList.add("on");
});

x1.addEventListener("click", function() {
    hamburgerMenu.classList.remove("on");
    hamburgerMenu.classList.add("off");
    hamburgerMenu.classList.remove("off");
});

hamburgerMenu.addEventListener("click", function() {
    hamburgerMenu.classList.remove("on");
});

whiteMenu.addEventListener("click", function(e) {
    e.stopPropagation();
});

$(document).ready(function() {
    setTimeout(function() {
        modalDialog.addClass("onJQ");
    }, 1000);
});
x0.on("click", function(e) {
    e.stopPropagation();
    modalDialog.removeClass("onJQ");
});
