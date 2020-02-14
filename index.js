const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

// const projects = require("./data.json");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken;
    next();
});

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// app.use(express.static("./projects"));
app.use(express.static("./public"));

app.get("/", (req, res) => {
    // console.log("******** /ROUTE ******");
    // console.log("req.sessions: ", req.session);
    // req.session.allspice = "ALLSPICE";
    // console.log("req.sessions: ", req.session);

    // db.getSig(req.session.sigId);
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    const { first, last, sig } = req.body;
    // console.log("first: ", first);
    // console.log("last: ", last);
    // console.log("sig: ", sig);
    // console.log(req.body);
    db.addSigner(req.body.first, req.body.last, req.body.sig)
        .then(response => {
            // console.log("where is the id? ", response.rows[0].id);
            req.session.sigId = response.rows[0].id;
        })
        .then(() => {
            if (first !== "" || last !== "" || sig !== "") {
                res.redirect("/thanks");
            }
        })
        .catch(() => {
            res.render("petition", {
                layout: "main",
                error: true
            });
        });
});

app.get("/thanks", (req, res) => {
    console.log("this is the id: ", req.session.sigId);
    let signersNr = req.session.sigId;
    db.getSig(req.session.sigId).then(response => {
        let image = response.rows[0].sig;
        console.log(response);
        res.render("thanks", {
            layout: "main",
            image,
            signersNr
        });
    });
});

app.get("/signers", (req, res) => {
    db.getFirstandLast().then(result => {
        const names = result.rows;
        res.render("signers", {
            layout: "main",
            names
        });
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

// app.use(function(req, res, next) {
//     res.set('x-frame-options':'deny')
//
// })
