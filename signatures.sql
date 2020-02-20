-- DROP TABLE IF EXISTS signatures;

 CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      signature TEXT NOT NULL CHECK (signature != ''),
      user_id INTEGER NOT NULL REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

 CREATE TABLE users(
       id SERIAL PRIMARY KEY,
       first VARCHAR(255) NOT NULL CHECK (first != ''),
       last VARCHAR(255) NOT NULL CHECK (last != ''),
       email VARCHAR(255) NOT NULL UNIQUE CHECK (email != ''),
       password VARCHAR(255) NOT NULL CHECK (password != ''),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );


 CREATE TABLE user_profiles(
     id SERIAL PRIMARY KEY,
     age INTEGER,
     city VARCHAR,
     url VARCHAR,
     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id)
 );

 -- UPDATE actors SET first='Brad', last='Pitt' WHERE first=Leonardo AND last='Dicaprio';
 --
 -- INSERT INTO actors (first, last, email)
 -- VALUES ('Brad', 'Pitt', 'brad@aol.com')
 -- ON CONFLICT (actors.email) DO
 -- UPDATE actors SET first='Brad', last='Pitt';
 --
 --
 -- INSERT INTO actors (first, last, email, user_id)
 -- VALUES ('Brad', 'Pitt', 'brad@aol.com', 42)
 -- ON CONFLICT (user_id) DO
 -- UPDATE actors SET first='Brad', last='Pitt';
 --
 -- db.query(
 --     'INSERT INTO whatev (numer) VALUES $1',
 --     [VALUE || null]
 -- );

 -- SELECT first From ACTORS WHERE last = 'Pitt';
 --
 -- app.get('logout', (req, res) => {
 -- req.session = null;
 -- res.redirect('/login');
 -- });
 --
 -- <a href='/logout'>blabla</a>
 --
 -- req.session.sigId = null;
 -- or
 -- delete req.session.sigId;
