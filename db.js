const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres://postgres:postgres@localhost:5432/cities`);

exports.addSigner = function(first, last, sig) {
    return db.query("INSERT", [first, last, sig]);
};

exports.getSigner = function() {
    db.query("SELECT");
};

db.query("SELECT * FROM actors")
    .then(function(result) {
        console.log(result.rows);
    })
    .catch(function(err) {
        console.log(err);
    });

function getActorByName(actorName) {
    return db.query(`SELECT * FROM actors WHERE name = $1`, [actorName]);
}

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
