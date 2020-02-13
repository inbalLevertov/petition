console.log("hello");
// var container = $("#container");
// var color = $(".color");
//
// color.on("mousedown", function() {
//     container.on("mousemove", mouse);
//     container.on("mouseup", function(e) {
//         container.off("mousemove", mouse);
//     });
// });
//
// function mouse(e) {
//     color.eq(c).css({
//         left: e.clientX - 30 + "px",
//         top: e.clientY - 30 + "px"
//     });
// }

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
let paint = true;

ctx.strokeStyle = "tomato";
ctx.lineWidth = 3;

let xBegin, yBegin, xEnd, yEnd;

$("#canvas").on("mousedown", function(e) {
    xBegin = e.clientX;
    yBegin = e.clientY;
    ctx.moveTo(xBegin, yBegin);
    console.log("is this hapening");
    paint = true;
});

$("#canvas").on("mousemove", function(e) {
    xEnd = e.offsetX;
    yEnd = e.offsetY;
    if (paint === true) {
        drawSig(xBegin, yBegin, xEnd, yEnd);
    }
});

function drawSig(xB, yB, xE, yE) {
    ctx.lineTo(xE, yE);
    ctx.stroke();
}

$("#canvas").on("mouseup", function() {
    paint = false;
    let URL = canvas.toDataURL("image/png", 1.0);
    console.log(URL);
});
