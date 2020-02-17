-- DROP TABLE IF EXISTS signatures;

 -- CREATE TABLE signatures (
 --     id SERIAL PRIMARY KEY,
 --     first VARCHAR NOT NULL CHECK (first != ''),
 --     last VARCHAR NOT NULL CHECK (last != ''),
 --     sig TEXT NOT NULL CHECK (sig != '')
 -- );

 CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      -- get rid of first and last!
      signature TEXT NOT NULL,
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
