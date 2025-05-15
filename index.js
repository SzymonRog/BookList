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


async function checkBooks(order) {
  let dirOrder = "desc"
  if(order == "title"){
    dirOrder = "asc"
  }
  
  let result =  await db.query(`select id, title, author, rating, readdate, details, isbn from books order by ${order} ${dirOrder};`)
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

function formatDate(date) {
  return date.toISOString().split('T')[0]; // np. "2024-04-22"
}

// testing styles
app.get("/", (req,res)=>{
  res.render("books.ejs")
});

// show all boks
app.get("/books", async (req,res)=>{
  try{
    const order = req.query.order || 'title'
    let noFormatedBooks = await checkBooks(order);

    const books = noFormatedBooks.map(book => ({
      ...book,
      formattedDate: formatDate(book.readdate)
    }));
    res.render("books.ejs",{
      Books: books
    })
  }catch(err){
    console.log(err)
    res.status(404).send("Database error")
  }
    
});
// change order by (title,rating,latest)
app.post("/order", async (req,res)=>{
  try{
    let order = req.body.order
    res.redirect(`/books?order=${order}`)
  }catch(err){
    console.log(err)
    res.status(404).redirect("/books")
  }   
});

// show book details
app.get("/book/:isbn", async (req,res)=>{
  try{
    const isbn = req.params.isbn;
    let book = await checkBookDetails(isbn);
    if(book.length === 0){
      res.status(404).send("No book with this ISBN")
    }
    
    res.send(book);
  }catch(err){
    console.log(err);
    res.status(404).send("Database error")
  } 
});

// search for title,author or ISBN
app.post("/search", async (req,res)=>{
  try{
    const searchQuery  = req.body.search;
    let book = await searchBooks(searchQuery);
    if(book.length === 0){
      res.status(404).send("No book matches criteria")
    }
    
    res.send(book);
  }catch(err){
    console.log(err);
    res.status(404).send("Database error")
  } 
});

// Add book
app.post("/addBook", async (req,res)=>{
  
  try{
    //Book data
      const { title, author, isbn, rating,readDate,details, review, summary } = req.body;
      const finalReadDate = readDate ? readDate : new Date().toISOString().split('T')[0];

  //Adding new book
    await db.query("INSERT INTO books (title, author, isbn, rating, readdate, details, review, sumary) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [title, author, isbn, rating, finalReadDate, details, review, summary])
    res.status(200).send("book has been added")
  }catch(err){
    console.log(err);
    res.status(404).send("Server error")
  }
  
});

// Posting edited data
app.post("/editBook", async (req,res)=>{
  
  try{
    //Book data
    const { title, author, rating,isbn, details, review, summary } = req.body;

    //Editing book

    await db.query("update books set title = $1, author = $2, rating = $3, details = $4, review = $5, sumary = $6 where isbn = $7", [title, author, rating, details, review, summary,isbn])

    res.status(200).send("book has been edited")
  }catch(err){
    console.log(err);
    res.status(404).send("Server error")
  }
  
});

// Delete Book
app.post("/deleteBook/:isbn", async (req,res) =>
{
  
  try{
    const isbn = req.params.isbn
    //del book

    await db.query("delete from books where isbn = $1", [isbn])
    res.status(200).send("book has been deleted")
  }catch(err){
    console.log(err);
    res.status(404).send("Server error")
  }
  
});

app.listen(port, ()=>{
    console.log("server is runing on port " + port)
});