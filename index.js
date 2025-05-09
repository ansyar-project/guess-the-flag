import express from "express";
import bodyParser from "body-parser";
import pool from "./db.js";


const app = express();
const port = 3000;

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

console.log('Connecting to:', process.env.PG_HOST);
let quiz = [];

async function loadQuiz() {
  const result = await pool.query("SELECT * FROM flags");
  quiz = result.rows;
  // nextQuestion();
}

loadQuiz();

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// POST a new post
app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  if (isCorrect) {
    await nextQuestion();
  }
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
