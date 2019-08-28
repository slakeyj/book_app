'use strict';

const express = require('express');

const superagent = require('superagent');

const pg = require('pg');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

const PORT = process.env.PORT || 3004;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.log(err));

app.get('/', bookShelf);
app.get('/book-search', newSearch);
app.post('/book-search', searchForBook);

app.get('/book-details', singleBookInfo)
// app.post()

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

function newSearch(request, response) {
  response.render('./pages/index');
}

function bookShelf(request, response){
  response.render('./pages/books/showUserBooks')
}

function singleBookInfo(request, response){
  response.render('.pages/books/detailsAboutSingleBookOnShelf')
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

  //const bookData = request.query.data;

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
    // bookGallery.forEach(book => {
    //   const sqlQueryInsert = `INSERT INTO bookdata (image_url, title, author, isbn, description, numberOfPages, averageRating, bookshelf) VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`
    //   const sqlValueArr = [book.image_url, book.title, book.author, book.isbn, book.description, book.numberOfPages, book.averageRating, book.bookshelf];
    //   client.query(sqlQueryInsert, sqlValueArr);
    // })
    response.render('pages/searches/showSearchResults', { books: bookGallery });
  }) // }).catch(errorHandler);
}

// function errorHandler(error, response) {
//   response.render('/pages/error', { error: 'Something went wrong' })
// }



app.listen(PORT, () => console.log(`up on PORT ${PORT}`));
