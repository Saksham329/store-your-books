import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv";


dotenv.config();
const app = express()
const port = process.env.port

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine","ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:false}));

const db = new pg.Client({
    user: process.env.db_user,
    host:process.env.db_host,
    database:process.env.db_database,
    password:process.env.db_password,
    port:process.env.db_port,
})
const connectionString = "postgresql://shivam_practice_user:rmFTLVJZMNgSloBgmdEGPNhCT6At0Mn3@dpg-cs5eptd6l47c73f458dg-a.oregon-postgres.render.com/shivam_practice";//you can create your postgreSQL server on render.com or Vercel and then they'll give u external URL copy that and paste it here
 
const db = new Pool({
  connectionString: connectionString,
  // If you're using a service like Heroku, you might need this for SSL:
  ssl: {
    rejectUnauthorized: false,
  },
});
db.connect();

app.get("/",async(req,res)=>{
    try {
        const books = await db.query(`SELECT * FROM books `)
        const results = books.rows
        res.render("index.ejs", { books: results });
    } catch (error) {
        console.log(error)
    }
})

app.get("/add",async(req,res)=>{
    res.render("addPost")
})

app.post("/add",async(req,res)=>{
    try {await db.query(`INSERT INTO books(title,isbn,summary,rating) VALUES ($1,$2,$3,$4)`,
        [req.body.title,req.body.isbn,req.body.summary,req.body.rating]);

        res.redirect("/")
        
    } catch (error) {
        console.log(error)
    }
})

app.post("/edit",async (req,res)=>{
   
    try { const book_Id=req.body.book_id
        console.log(book_Id)
        
        const books = await db.query(`SELECT * FROM books WHERE id = $1`,[book_Id])
        const results = books.rows[0]
        console.log(results.title)
        res.render("editPost", { book: results })
    } catch (error) {
        console.log(error)
    }
    
});

app.post("/save",async(req,res)=>{
    const { upd_title , upd_isbn, upd_summary, upd_rating, upd_book_id} = req.body;
    try {
        await db.query(`UPDATE books SET title = $1,  isbn = $2 ,  summary = $3 , rating = $4 WHERE id = $5 `,[
        upd_title, upd_isbn, upd_summary, upd_rating, upd_book_id]
        );
        res.redirect("/")
    } catch (error) {
        console.log(error)
    }
   
})

app.post("/delete",async(req,res)=>{
    const book_id=req.body.upd_book_id
    
    try {
        await db.query(`DELETE FROM reviews WHERE review_id = $1`, [book_id]);
        await db.query(`DELETE FROM books WHERE id = $1`,[book_id])
    } catch (error) {
        console.log(error)
    }
    res.redirect("/")
})

app.post("/reviews",async (req,res)=>{
    try { const book_Id=req.body.book_id
        console.log(book_Id)
        const books = await db.query(`select * from books WHERE books.id = $1`,[book_Id])
        const results = books.rows[0]
        const reviews = await db.query(`select * from reviews WHERE review_id=$1`,[book_Id])
        const results2 = reviews.rows
        res.render("reviews", { book: results,reviews:results2 })
    } catch (error) {
        console.log(error)
    }
});

app.get("/reviews",async (req,res)=>{
    try { const book_Id=req.body.book_id
        console.log(book_Id)
        const books = await db.query(`select * from books WHERE books.id = $1`,[book_Id])
        const results = books.rows[0]
        const reviews = await db.query(`select * from reviews WHERE review_id=$1`,[book_Id])
        const results2 = reviews.rows
        res.render("reviews", { book: results,reviews:results2 })
    } catch (error) {
        console.log(error)
    }
});

app.post("/addReview",async (req,res)=>{
    try {const review_Id=req.body.review_id;
        const book_Id = req.body.review_id
        const review=req.body.review
        
        await db.query(`INSERT INTO reviews(review_id,review) VALUES($1,$2)`,[review_Id,review])
        res.redirect(`/`)
    } catch (error) {
        console.log(error)
    }
})

app.listen(port,()=>{
    console.log(`port is running on ${port}`)
})