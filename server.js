'use strict';

const express = require('express');

const superagent = require('superagent');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

const PORT = process.env.PORT || 3004;

app.get('/', newSearch);
app.post('/book-search/', searchForBook);

function Book(image, title, author, description, numberOfPages, category, averageRating) {
  this.image = image ? image : `https://i.imgur.com/J5LVHEL.jpg`;
  this.title = title ? title : 'N/A';
  this.author = author ? author : 'N/A';
  this.description = description ? description : 'N/A';
  this.numberOfPages = numberOfPages ? numberOfPages : 'N/A';
  this.category = category ? category : 'N/A';
  this.averageRating = averageRating ? averageRating : 'N/A';
}

function newSearch(request, response) {
  response.render('./pages/index');
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


  superagent.get(url).then(result => {
    const booksBody = result.body.items;

    const bookGallery = booksBody.map(book => {
      const regex = /(http)/g;
      const info = book.volumeInfo;
      return new Book(info.imageLinks.smallThumbnail.replace(regex, 'https'), info.title, info.authors, info.description, info.pagecount, info.categories, info.averageRating);

    })

    response.send(bookGallery);
  })
  //response.render('pages/searches');
}
//split('').splice(4, 0, 's').join('')

// app.get('/hello', (request, response) => {
//   response.render('./pages/index');
// })



app.listen(PORT, () => console.log(`up on PORT ${PORT}`));
