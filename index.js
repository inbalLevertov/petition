const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");

// const projects = require("./data.json");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// app.use(express.static("./projects"));
app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    const { first, last } = req.body;
    console.log("first: ", first);
    console.log("last: ", last);
    console.log(req.body);
    // db.addSigner(req.body.first, req.body.last, req.body.sig);
    res.render("petition", {
        layout: "main",
        helpers: {
            isInput() {
                if (first !== "" || last !== "") {
                    console.log("redirecting");
                    res.redirect("/thanks");
                }
            }
            //             highlight(x) {
            //                 // console.log(x, selectedProject.directory);
            //                 return x === selectedProject.directory;
            //             }
        }
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main"
    });
});

// app.post("/cookies", (req, res) => {
//     console.log("these are my cookies: ", req.cookies.url);
//     if (req.body.accept === "on") {
//         res.cookie("authenticated", true);
//
//         //READ COOKIE AND REDIRECT USER TO THE URL
//         console.log("the user confirmed!");
//         res.redirect(req.cookies.url);
//     } else if (req.body.decline === "on") {
//         res.redirect("/decline");
//     }
// });

// app.get("/projects/:project", (req, res) => {
//     // console.log(projects);
//     const project = req.params.project;
//     const selectedProject = projects.find(item => item.directory == project);
//     if (!selectedProject) {
//         return res.sendStatus(404);
//     }
//     res.render("description", {
//         layout: "main",
//         selectedProject,
//         projects,
//         helpers: {
//             highlight(x) {
//                 // console.log(x, selectedProject.directory);
//                 return x === selectedProject.directory;
//             }
//         }
//     });
// });

app.listen(8080, () => console.log("port 8080 listening"));
