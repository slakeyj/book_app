DROP TABLE IF EXISTS bookdata;

CREATE TABLE bookdata (
  id SERIAL PRIMARY KEY,
  image VARCHAR,
  title VARCHAR,
  author VARCHAR,
  isbn VARCHAR,
  description VARCHAR,
  numberOfPages NUMERIC(10,7),
  averageRating NUMERIC(10,7),
  bookshelf VARCHAR
);