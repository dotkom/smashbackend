const app = require('./app');

const port = process.env.PORT || 8080;

app.listen(port);

/* eslint no-console: "off" */
console.log('Listening on port', port);
