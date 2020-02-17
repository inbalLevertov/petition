const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./utils/db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");

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

app.get("/register", (req, res) => {
    res.render("register", {});
});

app.post("/register", (req, res) => {
    // console.log(req.body);
    const { password, first, last, email } = req.body;
    console.log(password);
    //i will want to grab the useres password, somethinglike req.body.password
    //use hash to take user input created the hashed version of PW to storw in db
    hash(password).then(hashedPw => {
        console.log("hashedPw from / register: ", hashedPw);
        db.addRegister(first, last, email, hashedPw)
            .then(response => {
                req.session.userId = response.rows[0].id;
                console.log(response.rows[0].id);
            })
            .then(() => {
                if (
                    first !== "" ||
                    last !== "" ||
                    email !== "" ||
                    hashedPw !== ""
                ) {
                    res.redirect("/petition");
                }
            })
            .catch(err => {
                console.log("error in addRegister: ", err);
                res.render("register", {
                    layout: "main",
                    error: true
                });
            });
    });
});

// double(2).then(resultFromDbl => {
//     double(10).then(resultFromSecondDbl => {
//         console.log(resultFromDbl);
//         console.log(resultFromSecondDbl);
//     }).catch(err => console.log('err in 2ndDbl: ', err));
// }).catch(err => console.log('err in 1stDbl: ', err));

app.get("/login", (req, res) => {
    res.render("login", {});
});

app.post("/login", (req, res) => {
    console.log("req.session.userId: ", req.session.userId);
    // console.log("req.body: ", req.body);
    const { email, password } = req.body;
    console.log("email: ", email, "password: ", password);
    db.getPass(email)
        .then(response => {
            console.log("response: ", response);
            req.session.userId = response.rows[0].id;
            const hashedPwInDb = response.rows[0].password;
            console.log("response of db.getpass: ", response.rows[0]);
            compare(password, hashedPwInDb)
                .then(matchValue => {
                    console.log("match Value of Compare: ", matchValue);
                    if (matchValue) {
                        db.ifSigned(req.session.userId)
                            .then(response => {
                                console.log(
                                    "response.rows of db.ifSigned: ",
                                    response.rows
                                );
                                if (response.rows.length > 0) {
                                    // req.session.sigId =
                                    //     response.rows[0].signature;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch(err => {
                                console.log("err of db.ifSigned: ", err);
                            });
                        // res.redirect("/petition");
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: true
                        });
                    }
                })
                .catch(err => {
                    console.log("err in compare: ", err);
                });
        })
        .catch(err => {
            console.log("err in db.getpass: ", err);
        }); //here we will use compare to compare the two arguments

    //if the pw matched you will want to redirect to /petition. will want to set req.session.userID
    //if PW doesnt match we will send an error message
});

app.get("/", (req, res) => {
    // console.log("******** /ROUTE ******");
    // console.log("req.sessions: ", req.session);
    // req.session.allspice = "ALLSPICE";
    // console.log("req.sessions: ", req.session);

    // db.getSig(req.session.sigId);
    res.redirect("/register");
    // res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    // console.log("first: ", first);
    // console.log("last: ", last);
    console.log("signature: ", signature);
    // console.log("req.body ", req.body);
    const userId = req.session.userId;
    db.addSigner(signature, userId)
        .then(response => {
            // console.log("where is the id? ", response);
            req.session.sigId = response.rows[0].id;
        })
        .then(() => {
            if (signature !== "") {
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
    // console.log("this is the id: ", req.session.sigId);
    let signersNr = req.session.sigId;
    let userId = req.session.userId;
    db.getSig(userId).then(response => {
        let image = response.rows[0].signature;
        console.log(response);
        res.render("thanks", {
            layout: "main",
            image,
            signersNr
        });
    });
});

app.get("/signers", (req, res) => {
    // const userId = req.session.userId;
    db.getFirstandLast().then(result => {
        console.log(result);
        const names = result.rows;
        res.render("signers", {
            layout: "main",
            names
        });
    });
});

app.listen(8080, () => console.log("port 8080 listening"));

// app.use(function(req, res, next) {
//     res.set('x-frame-options':'deny')
//
// })
