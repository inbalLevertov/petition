const express = require("express");
const app = express();
exports.app = app;
const hb = require("express-handlebars");
const db = require("./utils/db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");
const {
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature
} = require("./utils/middleware");
// const profileRouter = require("/profile");
// app.use("/profile", profileRouter);

app.use(express.static("./public"));

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

app.use(function(req, res, next) {
    if (
        !req.session.userId &&
        req.url !== "/register" &&
        req.url !== "/login"
    ) {
        res.redirect("/register");
    } else {
        next();
    }
});

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("register", {});
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    const { password2, password, first, last, email } = req.body;
    console.log("first: ", first, "last: ", last);
    req.session.first = first;
    req.session.last = last;
    //i will want to grab the useres password, somethinglike req.body.password
    //use hash to take user input created the hashed version of PW to storw in db
    if (password === password2) {
        hash(password).then(hashedPw => {
            db.addRegister(first, last, email, hashedPw)
                .then(response => {
                    req.session.userId = response.rows[0].id;
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
    } else {
        res.render("register", {
            repeatPass: true
        });
    }
});

app.get("/profile", (req, res) => {
    res.render("profile", {});
});

app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    const userId = req.session.userId;
    if (age === "" && city === "" && url === "") {
        console.log("user hasnt give any info, redirecting to petition");
        res.redirect("/petition");
        // } else if (
        //     url !== "" &&
        //     !url.startsWith("http://") &&
        //     !url.startsWith("https://") &&
        //     !url.startsWith("//")
        // ) {
        //     console.log("user has given a flase URL. redirecting to petition");
        //     res.redirect("/petition");
    } else if (
        url !== "" &&
        !url.startsWith("http://") &&
        !url.startsWith("https://") &&
        !url.startsWith("//")
    ) {
        console.log("user has given a flase URL. redirecting to petition");
        res.redirect("/petition");
    } else {
        console.log("user has give info in profile: ", age, city, url, userId);
        db.addProfile(age, city, url, userId)
            .then(() => {
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
    const {
        first,
        last,
        email,
        password,
        password2,
        age,
        city,
        url
    } = req.body;
    req.session.first = first;
    req.session.last = last;
    const userId = req.session.userId;
    if (password === "") {
        db.updateNoPass(first, last, email, userId)
            .then(() => {
                if (
                    url !== "" &&
                    !url.startsWith("http://") &&
                    !url.startsWith("https://") &&
                    !url.startsWith("//")
                ) {
                    res.redirect("/thanks");
                } else {
                    db.updateExtraInfo(age, city, url, userId)
                        .then(() => {
                            // console.log("success");
                            res.redirect("/thanks");
                        })
                        .catch(err => {
                            console.log(
                                "error in updateExtraInfo with old pass: ",
                                err
                            );
                            res.render("editprofile", {
                                layout: "main",
                                error: true
                            });
                        });
                }
            })
            .catch(err => {
                console.log("error in updateNoPass: ", err);
            });
    } else {
        if (password === password2) {
            hash(password).then(hashedPw => {
                db.updateWithPass(first, last, email, hashedPw, userId)
                    .then(() => {
                        db.updateExtraInfo(age, city, url, userId)
                            .then(() => {
                                console.log("success");
                                res.render("thanks", {
                                    layout: "main",
                                    updated: true
                                });
                            })
                            .catch(err => {
                                console.log(
                                    "error in updateExtraInfo with new pass: ",
                                    err
                                );
                                res.render("editprofile", {
                                    layout: "main",
                                    error: true
                                });
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
    }
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {});
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    const { first, last } = req.body;
    req.session.first = first;
    req.session.last = last;
    const { email, password } = req.body;
    db.getPass(email)
        .then(response => {
            req.session.userId = response.rows[0].id;
            const hashedPwInDb = response.rows[0].password;
            compare(password, hashedPwInDb)
                .then(matchValue => {
                    if (matchValue) {
                        db.ifSigned(req.session.userId)
                            .then(response => {
                                if (response.rows.length > 0) {
                                    req.session.sigId = response.rows[0].id;
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
            res.render("login", {
                error2: true
            });
        }); //here we will use compare to compare the two arguments

    //if the pw matched you will want to redirect to /petition. will want to set req.session.userID
    //if PW doesnt match we will send an error message
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/petition", requireNoSignature, (req, res) => {
    const first = req.session.first;
    const last = req.session.last;
    console.log("first and last: ", first, last);
    res.render("petition", {
        layout: "main",
        first: first,
        last: last
    });
});

app.post("/petition", requireNoSignature, (req, res) => {
    const { signature } = req.body;
    // console.log("signature in petition: ", signature);
    const userId = req.session.userId;
    db.addSigner(signature, userId)
        .then(response => {
            console.log("response.rows[0].id ", response.rows[0].id);
            req.session.sigId = response.rows[0].id;
        })
        .then(() => {
            res.redirect("/thanks");
        })
        .catch(() => {
            res.render("petition", {
                layout: "main",
                error: true
            });
        });
});

app.get("/thanks", requireSignature, (req, res) => {
    // let signersNr = req.session.sigId;
    // const first = req.session.first;
    db.numOfSigners()
        .then(result => {
            let signersNr = result.rows[0].count;
            console.log("signersNr: ", signersNr);
            let userId = req.session.userId;
            db.getSig(userId)
                .then(response => {
                    let image = response.rows[0].signature;
                    res.render("thanks", {
                        layout: "main",
                        image,
                        signersNr
                        // first: first
                    });
                })
                .catch(err => {
                    console.log("error in db.getSig: ", err);
                });
        })
        .catch(err => {
            console.log("error in numOfSigners: ", err);
        });
});

app.get("/signOut", (req, res) => {
    console.log("req.body in /signedOut: ", req.body);
    req.session = null;
    res.redirect("/register");
    // console.log("this req.body: ", req.body);
});

app.post("/delete/signature", requireSignature, (req, res) => {
    console.log("req.body in /delete/signature: ", req.body);
    const userId = req.session.userId;
    db.deleteSig(userId)
        .then(() => {
            console.log("signature deleted");
            req.session.sigId = null;
            res.redirect("/petition");
        })
        .catch(err => {
            console.log("error in db.deleteSig: ", err);
        });
});

app.post("/delete/account", requireSignature, (req, res) => {
    console.log("req.body in /delete/account: ", req.body);
    const userId = req.session.userId;
    db.deleteSig(userId)
        .then(() => {
            db.deleteUserProfile(userId)
                .then(() => {
                    db.deleteUser(userId)
                        .then(() => {
                            console.log("acount deleted");
                            req.session = null;
                            res.redirect("/register");
                        })
                        .catch(err => {
                            console.log("error in db.deleteUser: ", err);
                        });
                })
                .catch(err => {
                    console.log("error in db.deleteUserProfile: ", err);
                });
        })
        .catch(err => {
            console.log("error in db.deleteSig: ", err);
        });
});

app.get("/signers", requireSignature, (req, res) => {
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

app.get("/signers/:city", requireSignature, (req, res) => {
    const city = req.params.city;
    db.getCity(city).then(result => {
        const usersOfCity = result.rows;
        res.render("signers", {
            cities: true,
            usersOfCity,
            city: city
        });
    });
});

app.get("/welcome", (req, res) => {
    res.send("<h1>yooooooooo</h1>");
});

app.post("/welcome", (req, res) => {
    req.session.submitted = true;
    res.redirect("/home");
});

app.get("/home", (req, res) => {
    if (!req.session.submitted === true) {
        return res.redirect("/welcome");
    }
    console.log("req.session: ", req.session);
    res.send("<h1>home</h1>");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("port 8080 listening")
    );
}

//  <form method='POST' action='/signedOut'>
//     <input type='hidden' name="_csrf" value={{csrfToken}}>
//     <button name="sign-out">sign out</button>
// </form>
