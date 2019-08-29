DROP TABLE IF EXISTS bookdata;

CREATE TABLE bookdata (
  id SERIAL PRIMARY KEY,
  image VARCHAR,
  title VARCHAR,
  author VARCHAR,
  isbn VARCHAR,
  description VARCHAR,
  numberOfPages VARCHAR,
  averageRating VARCHAR,
  bookshelf VARCHAR
);