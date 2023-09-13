const app = require("./app");
const port = 3000;
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/blog-app").then(() => {
  console.log("connection successful");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
