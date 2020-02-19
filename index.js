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
    // console.log(password);
    //i will want to grab the useres password, somethinglike req.body.password
    //use hash to take user input created the hashed version of PW to storw in db
    hash(password).then(hashedPw => {
        // console.log("hashedPw from / register: ", hashedPw);
        db.addRegister(first, last, email, hashedPw)
            .then(response => {
                req.session.userId = response.rows[0].id;
                // console.log(response.rows[0].id);
            })
            .then(() => {
                if (
                    first !== "" ||
                    last !== "" ||
                    email !== "" ||
                    hashedPw !== ""
                ) {
                    res.redirect("/profile");
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

app.get("/profile", (req, res) => {
    res.render("profile", {});
});

app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    const userId = req.session.userId;
    // console.log("age: ", age, "city: ", city, "homepage: ", url);
    if (age === "" && city === "" && !url.startsWith("http://")) {
        console.log("user hasnt give any info, redirecting to petition");
        res.redirect("/petition");
    } else {
        console.log("post addProfile: ", age, city, url, userId);
        db.addProfile(age, city, url, userId)
            .then(() => {
                // console.log(
                //     `the user added age: ${age}, city: ${city}, homepage: ${url} and userId: ${userId}`
                // );
                // req.session.userAge = age;
                // req.session.usercity = city;
                // req.session.userUrl = url;
                res.redirect("/petition");
            })
            .catch(err => {
                console.log("error in db.addprofile: ", err);
            });
    }
});

app.get("/profile/edit", (req, res) => {
    const userId = req.session.userId;
    db.renderFullProfile(userId).then(result => {
        const profile = result.rows[0];
        // console.log("this is the profile: ", profile);
        res.render("editprofile", {
            layout: "main",
            profile
        });
    });
});

app.post("/profile/edit", (req, res) => {
    // console.log("this is the req.body: ", req.body);
    const { first, last, email, password, age, city, url } = req.body;
    // console.log(
    //     "details from /profile/edit: ",
    //     first,
    //     last,
    //     email,
    //     password,
    //     age,
    //     city,
    //     url
    // );
    console.log(req.body);
    const userId = req.session.userId;
    if (password === "") {
        db.updateNoPass(first, last, email, userId)
            .then(() => {
                db.updateExtraInfo(age, city, url, userId)
                    .then(() => {
                        console.log("success");
                        // res.render("thanks", {
                        //     layout: "main",
                        //     updated: true
                        // });
                    })
                    .catch(err => {
                        console.log("error in updateExtraInfo: ", err);
                        res.render("editprofile", {
                            layout: "main",
                            error: true
                        });
                    });
            })
            .catch(err => {
                console.log("error in updateNoPass: ", err);
                // res.render("/profile/edit", {
                //     layout: "main",
                //     error: true
                // });
            });
    } else {
        hash(password).then(hashedPw => {
            // console.log("hashedPw from / register: ", hashedPw);
            db.updateWithPass(first, last, email, hashedPw, userId)
                .then(() => {
                    res.render("thanks", {
                        layout: "main",
                        updated: true
                    });
                })
                .catch(err => {
                    console.log("error in updateWithPass: ", err);
                    res.render("editprofile", {
                        layout: "main",
                        error: true
                    });
                });
        });
    }
});

// });

// if (age === "" && city === "" && !url.startsWith("http://"))

// const userId = req.session.userId;
// db.renderFullProfile(userId).then(result => {
//     console.log("this is the result of renderFullProfile: ", result);
// });

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
    // console.log("req.session.userId: ", req.session.userId);
    // console.log("req.body: ", req.body);
    const { email, password } = req.body;
    // console.log("email: ", email, "password: ", password);
    db.getPass(email)
        .then(response => {
            // console.log("response: ", response);
            req.session.userId = response.rows[0].id;
            const hashedPwInDb = response.rows[0].password;
            // console.log("response of db.getpass: ", response.rows[0]);
            compare(password, hashedPwInDb)
                .then(matchValue => {
                    // console.log("match Value of Compare: ", matchValue);
                    if (matchValue) {
                        db.ifSigned(req.session.userId)
                            .then(response => {
                                // console.log(
                                //     "response.rows of db.ifSigned: ",
                                //     response.rows
                                // );
                                if (response.rows.length > 0) {
                                    req.session.sigId =
                                        // response.rows[0].signature;
                                        console.log("the user has signed");
                                    res.redirect("/thanks");
                                } else {
                                    console.log("the user didnt sign");
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
    const userId = req.session.userId;
    db.addSigner(signature, userId)
        .then(response => {
            // console.log("where is the id? ", response);
            req.session.sigId = response.rows[0].id;
        })
        .then(() => {
            if (signature !== "") {
                // req.session.sigId = signature;
                res.redirect("/thanks");
            } else {
                res.render("petition", {
                    layout: "main",
                    error: true
                });
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
        // console.log("this is the response in thanks:", response);
        res.render("thanks", {
            layout: "main",
            image,
            signersNr
        });
    });
});

app.get("/signers", (req, res) => {
    // const userId = req.session.userId;
    db.getFullProfile()
        .then(result => {
            // console.log(result);
            const names = result.rows;
            res.render("signers", {
                layout: "main",
                names
            });
        })
        .catch(err => {
            console.log("error in db.getFullProfile: ", err);
        });
});

app.get("/signers/:city", (req, res) => {
    const city = req.params.city;
    // console.log(city);
    db.getCity(city).then(result => {
        // console.log("result in signers/:city: ", result);
        const usersOfCity = result.rows;
        // console.log("result.rows: ", usersOfCity);
        res.render("signers", {
            cities: true,
            usersOfCity
        });
    });
    // res.send("this is the city: ", city);
});

app.listen(process.env.PORT || 8080, () => console.log("port 8080 listening"));

// app.use(function(req, res, next) {
//     res.set('x-frame-options':'deny')
//
// })
