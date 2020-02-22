console.log("hello this is petition");

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let paint = false;

ctx.strokeStyle = "black";
ctx.lineWidth = 3;

let xBegin = 0;
let yBegin = 0;
let xEnd = 0;
let yEnd = 0;

$("#canvas").on("mousedown", function(e) {
    paint = true;
    xBegin = e.offsetX;
    yBegin = e.offsetY;
    ctx.moveTo(xBegin, yBegin);
    // console.log("is this hapening");
});

$("#canvas").on("mousemove", function(e) {
    xEnd = e.offsetX;
    yEnd = e.offsetY;
    if (paint === true) {
        drawSig(xEnd, yEnd);
    }
});

function drawSig(xEnd, yEnd) {
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}

$("#canvas").on("mouseup", function() {
    paint = false;
    let URL = canvas.toDataURL("image/png", 1.0);
    $("input#sig").val($("canvas")[0].toDataURL());

    // console.log(URL);
});
