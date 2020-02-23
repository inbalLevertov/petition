const supertest = require("supertest");
const { app } = require("./index");
const cookieSession = require("cookie-session");

test("logged out users redirected to /register when attempt to go to /petition", () => {
    cookieSession.mockSessionOnce({
        userId: false
    });
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/register");
        });
});

test("logged in users redirected to /petition page when attempt to go to /register", () => {
    cookieSession.mockSessionOnce({
        userId: true
    });
    return supertest(app)
        .get("/register")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("logged in users redirected to /petition page when attempt to go to /login", () => {
    cookieSession.mockSessionOnce({
        userId: true
    });
    return supertest(app)
        .get("/login")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("logged in and signed users redirected to /thanks when attempt to go to /petition", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: true
    });
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});
test("logged in and signed users redirected to /thanks when attempt to submit a signature", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: true
    });
    return supertest(app)
        .post("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/thanks");
        });
});

test("logged in users that didnt sign redirected to /petition when attempt to go to /thanks", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: false
    });
    return supertest(app)
        .get("/thanks")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});
test("logged in users that didnt sign redirected to /petition when attempt to go to /signers", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: false
    });
    return supertest(app)
        .get("/signers")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

// test("POST /welcome sets req.session.submitted to true", () => {
//     const cookie = {};
//     cookieSession.mockSessionOnce(cookie);
//     return supertest(app)
//         .post("/welcome")
//         .then(res => {
//             expect(cookie.submitted).toBe(true);
//         });
// });
//
// test('GET /home sends 200 status code as response when there is a "sunmitted" cookie', () => {
//     cookieSession.mockSessionOnce({
//         submitted: true
//     });
//     return supertest(app)
//         .get("/home")
//         .then(res => {
//             expect(res.text).toBe("<h1>home</h1>");
//             expect(res.statusCode).toBe(200);
//         });
// });
//
// test("GET /home sends 302 status conde as response when no cookie", () => {
//     return supertest(app)
//         .get("/home")
//         .then(res => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/welcome");
//         });
// });
//
// test("GET /welcome sends 200 status code as response", () => {
//     return supertest(app)
//         .get("/welcome")
//         .then(res => {
//             expect(res.statusCode).toBe(200);
//             expect(res.text).toBe("<h1>yooooooooo</h1>");
//         });
// });
