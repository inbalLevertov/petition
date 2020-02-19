const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres://postgres:postgres@localhost:5432/signatures`
);

exports.addSigner = function(sig, userId) {
    // console.log("addSigner is working: ", sig, userId);
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

exports.getCity = function(city) {
    return db.query(
        `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
FROM users
LEFT JOIN user_profiles
 ON user_profiles.user_id = users.id
JOIN signatures
ON signatures.user_id = users.id
WHERE user_profiles.city = $1`,
        [city]
    );
};

exports.getFullProfile = function() {
    return db.query(`SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url
FROM users
LEFT JOIN user_profiles
 ON user_profiles.user_id = users.id
JOIN signatures
ON signatures.user_id = users.id`);
};

// change the query to get signers to get first and last name from the users table
// and get the age, city and url from user_profiles. Double join!

exports.addRegister = function(first, last, email, password) {
    // console.log("addRegister is working");
    return db.query(
        `INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
        [first, last, email, password]
    );
};

exports.addProfile = function(age, city, url, userId) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
        [age, city, url, userId]
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

exports.renderFullProfile = function(userId) {
    return db.query(
        `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url
FROM users
LEFT JOIN user_profiles
 ON user_profiles.user_id = users.id
 WHERE users.id = $1`,
        [userId]
    );
};

exports.updateNoPass = function(first, last, email, userId) {
    return db.query(
        `INSERT INTO users (first, last, email, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO
        UPDATE users SET first=$1, last=$2, email=$3, user_id=$4`,
        [first, last, email, userId]
    );
};

// exports.addRegister = function(first, last, email, password) {
//     // console.log("addRegister is working");
//     return db.query(
//         `INSERT INTO users (first, last, email, password)
//     VALUES ($1, $2, $3, $4)
//     RETURNING id`,
//         [first, last, email, password]
//     );
// };

// -- INSERT INTO actors (first, last, email, user_id)
// -- VALUES ('Brad', 'Pitt', 'brad@aol.com', 42)
// -- ON CONFLICT (user_id) DO
// -- UPDATE actors SET first='Brad', last='Pitt';

// -- db.query(
// --     'INSERT INTO whatev (numer) VALUES $1',
// --     [VALUE || null]
// -- );

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
