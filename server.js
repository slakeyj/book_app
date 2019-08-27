'use strict';

const express = require('express');

const superagent = require('superagent');

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

const PORT = process.env.PORT || 3004;



app.get('/hello', (request, response) => {
  response.render('./pages/index');
})



app.listen(PORT, () => console.log(`up on PORT ${PORT}`));
