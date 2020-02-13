const spicedPg = require("spiced-pg");
// const secrets = require('./secrets'); another option insead of postgres:postgres
// const db = spicedPg(`postgres://${secrets.dbUser}:${secrets.dbPassword}@localhost:5432/petition`);
//localhost is the name of the server. in this case on ou computer but could anywhere
//citis is the path

const db = spicedPg("postgres://postgres:postgres@localhost:5432/cities");

exports.addSigner = function(first, last, sig) {
    return db.query(
        'INSERT', [first, last, sig]
    );
};
const db = require('./db');

db.addSigner(req.body.first, req.body.last, req.body.sig);

exports.getSigner = function () {
    db.query('SELECT')
};

const addCity = (exports.addCity = function(city, country, population) {
    return db.query(
        `INSERT INTO cities (city, country, population)
        VALUES ($1, $2, $3)`,
        [country, city, population]
    );
});

addCity("Paris", "France", 300000)
    .then(({ rows }) => {
        console.log(rows);
        return db.query(
            `SELECT city AS name, population AS numpeeps FROM cities`
        );
    })
    .then(({ rows }) => {
        console.log(rows);
    });

$('input#sig').val(
    $('canvas')[0].toDataURL()
);


{{#if error}}
<div class='err'>oops!</div>
{{/if}}
<form method='POST'>
    <input name="first">
    <input name="last">
    <input type='hidden' id="sig" name="sig">
</form>

//for the table
DROP TABLE IF EXISTS signature;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first VARCHAR NOT NULL CHECK(first != ''),
    last VARCHAR NOT NULL CHECK(last != ''),
    signature VARCHAR NOT NULL CHECK(sig != '')
)
