import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";


const app = express();
const port = 3000;
const db = new pg.Client({
  user: 'postgres',        
  host: 'localhost',               
  database: 'books',   
  password: 'Szymonrogalapro2009',         
  port: 5432,                      
});



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

db.connect();

async function checkBooks() {
  let result =  await db.query("select id, title, author, rating, readdate, details from books")
  return result.rows
}
async function checkBookDetails(isbn) {
  let result =  await db.query("select * from books where ISBN = $1", [isbn])
  return result.rows
}

async function searchBooks(query) {
  let result =  await db.query("select * from books where ISBN like $1 or title like $2 or author like $3", [query,`%${query}%`,`%${query}%`])
  return result.rows
}

app.get("/books", async (req,res)=>{
  try{
    let books = await checkBooks();
    console.log(books);
    res.send(books)
  }catch(err){
    console.log(err)
    res.status(404).send("Database error")
  }
    
});

app.get("/book/:isbn", async (req,res)=>{
  try{
    const isbn = req.params.isbn;
    let book = await checkBookDetails(isbn);
    if(book.length === 0){
      res.status(404).send("No book with this ISBN")
    }
    console.log(book);
    res.send(book);
  }catch(err){
    console.log(err);
    res.status(404).send("Database error")
  } 
});

app.get("/search", async (req,res)=>{
  try{
    const searchQuery  = req.body.search;
    let book = await searchBooks(searchQuery);
    if(book.length === 0){
      res.status(404).send("No book matches criteria")
    }
    console.log(book);
    res.send(book);
  }catch(err){
    console.log(err);
    res.status(404).send("Database error")
  } 
});


// app.post("/addBook", async (req,res)=>{
  
//   try{
//     //Book data
//       const { title, author, isbn, rating,readDate,details, review, summary } = req.body;
//       if(!readDate){
//         const readDate = new Date()
//         const formattedDate = readDate.toISOString().split('T')[0]
//       }
//       const readdate = new Date()
//       const formattedDate = readdate.toISOString().split('T')[0]

//   //Adding new book
//     await db.query("INSERT INTO books (title, author, isbn, rating, readdate, details, review, sumary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [title, author, isbn, rating, formattedDate, details, review, summary])
//     res.status(200).send("book has been added")
//   }catch(err){
//     console.log(err);
//     res.status(404).send("Server error")
//   }
  
// });

app.listen(port, ()=>{
    console.log("server is runing on port " + port)
});