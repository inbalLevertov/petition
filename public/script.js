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
let paint = false;

ctx.strokeStyle = "tomato";
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
