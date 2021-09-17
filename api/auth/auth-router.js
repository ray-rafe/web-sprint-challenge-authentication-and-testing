const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../data/dbConfig");
const {
  checkUsernameExists,
  isRealUser,
} = require("../middleware/auth-middleware.js");
const { JWT_SECRET } = require("../secrets");

function buildToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: "1d",
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

async function findById(id) {
  const wanted = await db("users").where({ id });
  return wanted[0];
}

async function add(user) {
  const result = await db("users").insert(user);
  const id = result[0];
  return findById(id);
}

router.post("/register", checkUsernameExists, async (req, res) => {
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 8);

  user.password = hash;

  const newUser = await add(user);
  res.status(201).json(newUser);
});

router.post("/login", isRealUser, (req, res) => {
  const token = buildToken(req.user);
  res.status(200).json({
    message: `welcome, ${req.user.username}!`,
    token,
  });
});

module.exports = router;
