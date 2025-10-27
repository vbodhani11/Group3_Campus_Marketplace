const express = require("express");
const {Pool} = require("pg");
const dotenv = require("dotenv");
const {buildSignupSchema} = require("./validators/signupSchema");
const cors =  require('cors');

dotenv.config();

const ORIGIN = 'http://localhost:5173';   //  TODO: Change to ENV value

const app = express();
app.use(express.json());  

app.use(cors({
  origin: ORIGIN,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  //credentials: true,
}));

// DB pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const signupSchema = buildSignupSchema(process.env.CAMPUS_DOMAIN);

app.get("/", (req, res) => {
  res.send("Hello from API!");
});

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});

app.post("/auth/signup", async (req, res) => {
  try {
    const input = signupSchema.parse(req.body); //  Throws error if invalid due to Zod
    const {email, password} = input;

    //  TODO: Abstract this to keep path logic the focus and clean

    //  See if duplicate in Database
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: "Account already exists for this email." });
    }

    const password_hash = password; //  TODO: Actually hash and salt(?) password

    const insert = await pool.query(
      `INSERT INTO users (email, password_hash, email_verified)
       VALUES ($1, $2, FALSE)
       RETURNING id, email, email_verified`,
      [email, password_hash]
    );

    return res.status(201).json(insert.rows[0]);

  } catch(err) {
    if(err.name === "ZodError") { //  Was thrown by parse
      const msg = err.message;
      return res.status(400).json({error: msg});
    }
    if (err.code === "23505") { //  Code for duplicate entry in PostgreSQL
      return res.status(409).json({ error: "Account already exists for this email." });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});