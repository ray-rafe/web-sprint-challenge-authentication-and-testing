const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");

const checkUsernameExists = async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    next({ status: 401, message: "username and password required" });
  } else {
    const { username } = req.body;
    const result = await db("users")
      .where({ username })
      .select("users.id", "users.username");
    const exists = result[0];

    if (exists) {
      next({ status: 401, message: "username taken" });
    } else {
      next();
    }
  }
};

const isRealUser = async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    next({ status: 401, message: "username and password required" });
  } else {
    const { username, password } = req.body;
    const result = await db("users")
      .where("username", username)
      .select("username", "password");
    const exists = result[0];
    if (!exists) {
      next({ status: 401, message: "invalid credentials" });
    } else {
      const hash = exists.password;
      const verified = bcrypt.compareSync(password, hash);
      if (exists && verified) {
        req.user = exists;
        next();
      } else {
        next({ status: 401, message: "invalid credentials" });
      }
    }
  }
};

module.exports = {
  checkUsernameExists,
  isRealUser,
};
