import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";


const app = express();
const port = 3000;
const db = new pg.Client({
  user: 'postrage',        
  host: 'localhost',               
  database: 'Books',   
  password: 'Szymonrogalapro2009',         
  port: 5432,                      
});



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/", (req,res)=>{
  res.render("hero.ejs")
});

app.listen(port, ()=>{
    console.log("server is runing on port " + port)
});