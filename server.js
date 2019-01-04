const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
});

app.use(express.static('public'));

app.listen(process.env.PORT || 3000);
