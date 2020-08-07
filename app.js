const express = require("express");
const { check, validationResult } = require("express-validator");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = express();
const saltRounds = 10;

var question = [
  {
    id: "1",
    question: "Who is prime minister in India?",
    op1: "Trump",
    op2: "Modi",
    op3: "Obama",
    ans: "Modi",
  },
  {
    id: "2",
    question: "What is the answer for 10/2 ?",
    op1: "5",
    op2: "2",
    op3: "1",
    ans: "5",
  },
  {
    id: "3",
    question: "What is the opposite for Sad?",
    op1: "Happy",
    op2: "Neutral",
    op3: "Very Sad",
    ans: "Happy",
  },
  {
    id: "4",
    question: "What is Capital of India ?",
    op1: "Assam",
    op2: "UP",
    op3: "New Delhi",
    ans: "New Delhi",
  },
  {
    id: "5",
    question: "What is the answer for 0/0 ?",
    op1: "Indefinite",
    op2: "Infinity",
    op3: "Zero",
    ans: "Indefinite",
  },
  {
    id: "6",
    question: "What is the opposite for Cruel?",
    op1: "Kind",
    op2: "Loyal",
    op3: "Descent",
    ans: "Kind",
  },
  {
    id: "7",
    question: "Who is Cheif minister in Tamilnadu?",

    op1: "Jeyalalitha",
    op2: "Edapadi Palanisamy",
    op3: "Modi",
    ans: "Edapadi Palanisamy",
  },
  {
    id: "8",
    question: "What is the answer for 10 * 2 ?",
    op1: "5",
    op2: "10",
    op3: "20",
    ans: "20",
  },
  {
    id: "9",
    question: "What is the answer for 10 ^ 2 ?",
    op1: "1000",
    op2: "100",
    op3: "10",
    ans: "100",
  },
  {
    id: "10",
    question: "Who invented the BALLPOINT PEN ?",
    op1: "Biro Brothers",
    op2: "Waterman Brothers",
    op3: "Bicc Brothers",
    ans: "Biro Brothers",
  },
  {
    id: "11",
    question: "Which scientist discovered the radioactive element radium ?",
    op1: "Isaac Newton",
    op2: "Marie Curie",
    op3: "Albert Einstein",
    ans: "Marie Curie",
  },
  {
    id: "12",
    question: "What Galileo invented ?",
    op1: "Microscope",
    op2: "Thermometer",
    op3: "Pendulum clock",
    ans: "Thermometer",
  },
  {
    id: "13",
    question: "The ratio of width of our National flag to its length is ?",
    op1: "2:4",
    op2: "3:4",
    op3: "2:3",
    ans: "2:3",
  },
  {
    id: "14",
    question: "Which of the following is Scripting language ?",
    op1: "Javascript",
    op2: "HTML",
    op3: "CSS",
    ans: "Javascript",
  },
  {
    id: "15",
    question: "Dandia is a popular dance of ?",
    op1: "Gujarat",
    op2: "Tamil Nadu",
    op3: "Punjab",
    ans: "Gujarat",
  },
  {
    id: "16",
    question: "What is the answer for 10 + 2 ?",
    op1: "14",
    op2: "12",
    op3: "2",
    ans: "12",
  },
  {
    id: "17",
    question: "Find Odd One Out!",
    op1: "Lion",
    op2: "Tiger",
    op3: "Lion Dates",
    ans: "Lion Dates",
  },
  {
    id: "18",
    question: "How many laws newton invented ?",
    op1: "1",
    op2: "3",
    op3: "4",
    ans: "3",
  },
];
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
//MongoDB Atlas Connection
mongoose.connect(
  "mongodb+srv://admin-shree:atchu67@cluster0.v7bwr.mongodb.net/userDB",
  { useNewUrlParser: true }
);
//Questions and Answer Schema
const QuesSchema = new mongoose.Schema({
  questions: Array,
});
const qwitha = new mongoose.model("qwitha", QuesSchema);
const qwithans = new qwitha({
  questions: question,
});
//save to the DB
qwithans.save();
//User Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = new mongoose.model("User", userSchema);

//GET route for Home Page
app.get("/", function (req, res) {
  res.render("home");
});
//GET route for Register Page
app.get("/register", function (req, res) {
  res.render("register");
});
//POST route for registering the user
app.post(
  "/register",
  [
    check("username", "Email is Mandatory").isEmail(),
    check("password", "Password with min 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const { username, password } = req.body;
      let user = await User.findOne({ email: username });
      //check if user already exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already exists" }] });
        // res.send("<h1>User Already exists</h1>");
      }
      bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
          email: req.body.username,
          password: hash,
        });
        newUser.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/bot");
          }
        });
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);
//GET route for Login Page
app.get("/login", function (req, res) {
  res.render("login");
});
//POST route for Logging in Users
app.post(
  "/login",
  [
    check("username", "Email is Mandatory").isEmail(),
    check("password", "Password with min 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const username = req.body.username;
    const password = req.body.password;
    try {
      let user = await User.findOne({ email: username });
      if (!user) {
        res.send("User does not Exists");
        return res
          .status(400)
          .json({ errors: [{ msg: "User does not Exists" }] });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.send("Invalid Credentials");
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      } else {
        res.redirect("bot");
      }
    } catch (err) {
      res.status(500).send("Server Error!");
    }
  }
);
//GET Route for display quiz-BOT
app.get("/bot", function (req, res) {
  res.sendFile(__dirname + "/views/qbot.html");
});
//GET Route for getting questions from MONGODB
app.get("/getquestion", async (req, res) => {
  const data = await qwitha.find({});
  console.log(data);
  const arr = data[0].questions;
  let randIdx = Math.floor(Math.random() * arr.length);
  const questionToPass = arr[randIdx];
  console.log(questionToPass);
  return res.json({ questionToPass });
});
//POST Route for validating the answers
app.post("/validateanswers", function (req, res) {
  const answers = req.body.answers;
  const userEntered = req.body.userEntered;
  let i,
    score = 0;
  for (i = 0; i < answers.length; i++) {
    if (answers[i] === userEntered[i]) {
      score = score + 1;
    }
  }
  console.log(score);
  return res.json({ score });
});
//GET Route for Logout Users
app.get("/logout", function (req, res) {
  res.redirect("/");
});
//Listening Server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started Successfully!");
});
