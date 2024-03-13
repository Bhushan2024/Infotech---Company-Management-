const express = require("express");
const port = 3000;
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require('path');
const hbs = require('hbs');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

dotenv.config({path:'./.env'});


const db = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password:process.env.pss,
    database:process.env.DATABASE
});

app.use(cookieParser());

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

const partialsPath = path.join(__dirname, './views/partials');
hbs.registerPartials(partialsPath);
app.set('view engine', 'hbs');



app.use(express.urlencoded({extended:false}));


app.use('/', require("./routes/pages"));
app.use('/auth', require("./routes/auth"));

app.listen(port, () => {
  console.log(`Server Stared on port ${port}`)
})