const bcrypt = require("bcryptjs");
let { genSalt, hash, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.compare = compare;
module.exports.hash = plainText =>
    genSalt().then(salt => hash(plainText, salt));

// genSalt()
//     .then(salt => {
//         console.log("salt created by bcrypt"); // generate salt to add more pW security
//         return hash("safePassword", salt);
//     })
//     .then(hashedPw => {
//         console.log("hashedPw plus salt output: ", hashedPw); // returns properly hashed pw
//         return compare("safePassword", hashedPw); //clearText value compares
//     })
//     .then(matchValueCompare => {
//         console.log("password is a match ", matchValueCompare);
//     });
