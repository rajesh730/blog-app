const express = require("express");
const app = express();
const Blog = require("./model/BlogModel");
const bodyParser = require("body-parser");
const path = require("path");

// ----------------------------------------------
const User = require("./model/UserModel");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./authentication/auth");
// ----------------------------------------------

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());

// to display the html files
// app.get(["/", "/blog"], async (req, res) => {
//   try {
//     res.sendFile(__dirname + "/public/index.html");
//   } catch (err) {
//     res.status(404).json({ message: err });
//   }
// });

app.get("/alldata", async (req, res) => {
  try {
    const data = await Blog.find();
    res.status(200).json({
      data,
    });
  } catch (err) {
    res.status(404).json({
      statud: "fail",
      message: err,
    });
  }
});

// -------------------------Profile Page after login---------------------

app.get("/profileblog", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const postData = await Blog.find({ userId: userId });
    res.status(200).json({
      status: "success",
      postData,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

const fs = require("fs");

app.get("/fullblog.html", async (req, res) => {
  try {
    const id = req.query.id;
    const data = await Blog.findOne({ _id: id });

    if (data) {
      const templatePath = path.join(__dirname, "public", "fullblog.html");
      let template = fs.readFileSync(templatePath, "utf8");

      template = template.replace("{{ topic }}", data.topic);
      template = template.replace(
        "{{ description }}",
        data.description.replace(/\n/g, "<br>")
      );

      res.send(template);
    } else {
      res.status(404).json({
        status: "fail",
        message: "Blog post not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

//---------------------------------------------------------------------------------------
// -----------------for blog CRUD-----------------
// -------------------------------------------------------------------------------------
//////----------create new blog---------///////
app.post("/admin", auth, async (req, res) => {
  // const newBlog = new Blog(req.body);
  const userId = req.user._id;
  const newBlog = new Blog({
    topic: req.body.topic,
    description: req.body.description,
    userId,
  });

  try {
    await newBlog.save();

    // Send a success response
    res.status(201).json({
      status: "success",
      data: newBlog,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

////////--------update the given blog------////////
app.patch("/admin/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const update = await Blog.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    await update.save();
    console.log(update);
    res.status(200).json({
      update,
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
});

app.get("/adminData/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    const update = await Blog.findById({ _id: id });
    console.log(update);
    res.status(200).json({
      update,
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
});

////////--------gt all blogs------////////

app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json({
      blogs,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
});

/////////----------delete the blogs---------//////////
// app.delete("/admin/:id", auth, async (req, res) => {
//   try {
//     const deletedPost = await Blog.findByIdAndDelete(req.params.id);

//     if (deletedPost) {
//       res.status(200).json({
//         message: "The blog has been deleted.",
//       });
//     } else {
//       res.status(404).json({
//         message: "No blog post with that ID was found.",
//       });
//     }
//   } catch (err) {
//     res.status(404).json({
//       message: err,
//     });
//   }
// });

app.delete("/admin/:id", auth, async (req, res) => {
  try {
    const deletedPost = await Blog.findByIdAndDelete(req.params.id);

    if (deletedPost) {
      res.status(200).json({
        message: "The blog has been deleted.",
      });
    } else {
      res.status(404).json({
        message: "No blog post with that ID was found.",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: "An error occurred while deleting the blog post.",
      error: err.message,
    });
  }
});

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
// ----------------------------------------For User----------------------------------------------
// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
// const User = require("./model/UserModel");
// const bcrypt = require("bcryptjs");
// const cookieParser = require("cookie-parser");
// const auth = require("./authentication/auth");

// app.use(cookieParser());

// ------------------create new user-----------------
app.post("/register", async (req, res) => {
  try {
    const user = await new User(req.body);
    await user.save();
    res.status(200).json({
      user,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
});

// ----------------------------login---------------------------

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // generate token
    const token = await user.generateAuthToken();

    // create cookie
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 60 * 60 * 90 * 24),
      // httpOnly: true,
    });

    console.log("Login successful"); // Debug statement

    res.status(200).json({ status: "success", token });
  } catch (err) {
    console.error("Error:", err); // Debug statement
    res.status(400).json({ status: "fail from catch", err });
  }
});

// -------------------------logout---------------------
app.get("/logout", auth, (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({
      status: "success",
      message: "logout successful",
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      err,
    });
  }
});

// Start the server
module.exports = app;
