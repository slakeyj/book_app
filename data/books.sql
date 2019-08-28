DROP TABLE IF EXISTS bookdata;

CREATE TABLE bookdata (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR,
  title VARCHAR(255),
  author VARCHAR(255),
  isbn VARCHAR(255),
  description VARCHAR,
  numberOfPages NUMERIC(10,7),
  averageRating NUMERIC(10,7),
  bookshelf VARCHAR
);