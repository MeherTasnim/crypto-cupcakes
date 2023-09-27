require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
// TODO - require express-openid-connect and destructure auth from it
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const { User, Cupcake } = require('./db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
  // define the config object
  const {
    AUTH0_SECRET,
    AUTH0_AUDIENCE,
    AUTH0_CLIENT_ID,
    AUTH0_BASE_URL,
    } = process.env;
    

  const config = {
    authRequired: true, 
    auth0Logout: true,
    secret: process.env['AUTH0_SECRET'],
    baseURL: 'http://localhost:3000',
    clientID: process.env['AUTH0_CLIENT_ID'],
    issuerBaseURL: process.env['AUTH0_BASE_URL']
    }
  // attach Auth0 OIDC auth router
  // create a GET / route handler that sends back Logged in or Logged out

app.use(auth(config));

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send({ message: 'Successful' });
});
app.get('/cupcakes', requiresAuth(), async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get('/profile', requiresAuth(), (req, res) => {
  console.log(req.oidc.user)
  // res.send(JSON.stringify(req.oidc.user));
  const html = `
    <html>
      <head>
        <title>My Cupcakes</title>
      </head>
      <body>
        <h1 style="text-align:center">Cupcakes Factory</h1>
        <h2>Welcome, ${req.oidc.user.name}!</h1>
        <h4>Username: ${req.oidc.user.nickname}</h4>
        <p>${req.oidc.user.email}</p>
        <img src="https://lh3.googleusercontent.com/a/ACg8ocJZGSZA6-CcsU3uuCw8y5vT6ped79vwvcgg-R_yMQ3q=s96-c" alt="User Image">
      </body>
    </html>
    `;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);  
});

// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});

