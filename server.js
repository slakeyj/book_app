'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const app = express();
const methodOverride = require('method-override');
require('dotenv').config();

const PORT = process.env.PORT || 3004;

// express middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(methodOverride((request, response) => {
  //checking to see if _method exists in an object
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}));



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
app.delete('/book/:book_id/delete', deleteBook);

app.get('/book/:book_id/update', editbook);
app.put('/book/:book_id/update', updateBook)



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
  const insertValues = `INSERT INTO bookdata (image, title, author, isbn, description, numberOfPages, averageRating, bookshelf) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;
  console.log(request.body.numberOfPages);
  const bookValues = [request.body.image, request.body.title, request.body.author, request.body.isbn, request.body.description, request.body.numberOfPages, request.body.averageRating, request.body.bookshelf]

  client.query(insertValues, bookValues);
}


function updateBook(request, response) {
  const sqlUpdate = `UPDATE bookdata SET image=$2, title=$3, author=$4, isbn=$5, description=$6, numberofpages=$7, averagerating=$8, bookshelf=$9 where id=$1`
  const sqlValues = [request.params.book_id, request.body.image, request.body.title, request.body.author, request.body.isbn, request.body.description, request.body.numberOfPages, request.body.averageRating, request.body.bookshelf]
  client.query(sqlUpdate, sqlValues).then(sqlResult => {
    response.redirect('/', { specificBook: sqlResult.rows[0] });
  })
}

function editbook(request, response) {
  const id = request.params.id;

  client.query(`SELECT * FROM bookdata WHERE id=$1`, [id]).then(sqlResult => {
    response.render('./pages/books/edit', { specificBook: sqlResult.rows[0] });
  })
}

// we access the ids from bookdata, taking the book_id selected and rendering that result to the details
function singleBookInfo(request, response) {
  client.query(`SELECT * FROM bookdata WHERE id=$1`, [request.params.book_id]).then(sqlResult => {
    response.render('./pages/books/details', { specificBook: sqlResult.rows[0] });
  })
}


function deleteBook(request, response) {
  const id = request.params.book_id;
  client.query(`DELETE FROM bookdata WHERE id=$1`, [id])
  response.redirect('/');
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

