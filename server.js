'use strict';

const express = require('express');
const superagent = require('superagent');
require('dotenv').config()
const pg = require('pg');
const app = express();

const PORT = process.env.PORT || 3004;

// express middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));


// ROUTES
// tells functions what url to run on, functions tell which ejs to render
app.get('/', getAllBooks);
app.get('/search', newSearch);
app.post('/search', searchForBook);
app.post('/books/save', savedBooks);
app.get('/books/:book_id', singleBookInfo);


function Book(image, title, author, isbn, description, numberOfPages, averageRating) {
  this.image = image ? image : `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = title ? title : 'N/A';
  this.author = author ? author : 'N/A';
  this.isbn = isbn ? isbn : 'N/A';
  this.description = description ? description : 'N/A';
  if (this.description.length > 254) this.description = this.description.slice(0, 250) + '...';
  this.numberOfPages = numberOfPages ? numberOfPages : 'N/A';
  this.averageRating = averageRating ? averageRating : 'N/A';
}

//Callbacks and Helpers

function getAllBooks(req, res) {
  client.query('SELECT * FROM bookdata').then(sqlResponse => {
    res.render('pages/index.ejs', { savedBooks: sqlResponse.rows });
  })
}


function newSearch(request, response) {
  response.render('./pages/searches/new');
}

function savedBooks(request, response) {
  const insertValues = `INSERT INTO bookdata (image, title, author, isbn, description, numberOfPages, averageRating) VALUES ($1, $2, $3, $4, $5, $6, $7);`;
  const bookValues = [request.body.image, request.body.title[0], request.body.author, request.body.isbn, request.body.description, request.body.numberOfPages, request.body.averageRating]
  //console.log('request.body.title', request.body.title[0]);
  //console.log('bookValues', bookValues);
  client.query(insertValues, bookValues).then(() => {
    //send back to the home page to show all of their saved books
    response.redirect('/');
  })
}


// we access the ids from bookdata, taking the book_id selected and rendering that result to the details
function singleBookInfo(request, response) {
  client.query(`SELECT * FROM bookdata WHERE id=$1`, [request.params.book_id]).then(sqlResult => {
    response.render('./pages/books/details', { specificBook: sqlResult.rows[0] });
  })
}

function searchForBook(request, response) {
  const searchType = request.body.search[0];
  const searchingFor = request.body.search[1];
  let url = `https://www.googleapis.com/books/v1/volumes?q=`
  if (searchType === 'title') {
    const query = `+intitle:${searchingFor}`;
    url = url + query;
  } else {
    const query = `+inauthor:${searchingFor}`;
    url = url + query;
  }

  // superagent pulls in API data and does something with it
  superagent.get(url).then(result => {
    const book = result.body.items;
    const bookGallery = book.map(book => {
      const regex = /(http)/g;
      const info = book.volumeInfo;
      return new Book(
        info.imageLinks && info.imageLinks.thumbnail.replace(regex, 'https'),
        info.title,
        info.authors,
        info.industryIdentifiers[0] && (info.industryIdentifiers[0].type + ' ' + info.industryIdentifiers[0].identifier),
        info.description,
        info.pageCount,
        info.averageRating
      );
    })
    response.render('./pages/searches/show', { books: bookGallery })
  }).catch(errorHandler);
}
function errorHandler(error, response) {
  response.render('/pages/error', { error: 'Something went wrong' })
}




app.listen(PORT, () => console.log(`up on PORT ${PORT}`));

