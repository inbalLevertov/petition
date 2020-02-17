const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres://postgres:postgres@localhost:5432/signatures`);

exports.addSigner = function(sig, userId) {
    console.log("addSigner is working: ", sig, userId);
    return db.query(
        `INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2)
    RETURNING id`,
        [sig, userId]
    );
};

exports.getSig = function(id) {
    return db.query(`SELECT signature FROM signatures WHERE user_id = $1`, [
        id
    ]);
};

exports.getFirstandLast = function() {
    return db.query(`SELECT first, last FROM users`);
};

exports.addRegister = function(first, last, email, password) {
    console.log("addRegister is working");
    return db.query(
        `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
        [first, last, email, password]
    );
};

exports.getPass = function(email) {
    return db.query(`SELECT password, id FROM users WHERE email = $1`, [email]);
};

exports.ifSigned = function(userId) {
    return db.query(`SELECT signature FROM signatures WHERE user_id = $1`, [
        userId
    ]);
};
// exports.getLast = function() {
//     return db.query(`SELECT last FROM signatures`);
// };

// db.query("SELECT * FROM actors")
//     .then(function(result) {
//         console.log(result.rows);
//     })
//     .catch(function(err) {
//         console.log(err);
//     });

// function getActorByName(actorName) {
//     return db.query(`SELECT * FROM actors WHERE name = $1`, [actorName]);
// }

// const addCity = exports.addCity = function(city, country, population) {
//     return db.query(
//         `INSERT INTO cities (city, country, population)
//         VALUES ($2, $1, $3)`,
//         [country, city, population]
//     );
// }
//
// addCity('Paris', 'France', 3000000).then(
//     ({rows}) => {
//         console.log(rows);
//         return db.query(`SELECT city AS name, population AS "numPeeps" FROM cities`);
//     }
// ).then(
//     ({rows}) => {
//         console.log(rows)
//     }
// );

//command to search for the database: history | grep git
//sudo service postgresql start
