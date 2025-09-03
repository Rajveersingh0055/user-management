const { faker } = require('@faker-js/faker')
const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname,"/views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "meta_app",
  password: "2004@raj",
});

let getuserdata = () => {
    return [
     faker.string.uuid(),
     faker.internet.username(),
     faker.internet.email(),
     faker.internet.password(),
    ];
};


app.get("/",(req,res) =>{
  let q = `SELECT count(*) FROM users`;
  try {
      connection.query(q, (error, result) => {
          if (error) throw error;
          let count = result[0]["count(*)"];
          console.log(result);
          res.render("home.ejs",{count});
      })
  } catch (error) {
      console.error("Error fetching tables:", error);
      res.send("Error fetching tables");
  }
})

app.get("/user", (req, res) => {
  const query = "SELECT * FROM users";
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.render("showUsers.ejs", { users: results }); // show.ejs should display users
  });
});


app.get("/user",(req,res) =>{
  let q = `SELECT * FROM users`;
  try {
      connection.query(q, (error, users) => {
          if (error) throw error;
          res.render("showUsers.ejs",{users});
      })
  } catch (error) {
      console.error("Error fetching tables:", error);
      res.send("Error fetching tables");
  }
})

app.get("/user/:id/edit",(req,res) =>{
    let {id }= req.params
    let q = `SELECT * FROM users WHERE id = '${id}'`
     try {
       connection.query(q, (error, result) => {
         if (error) throw error;
        // console.log(result);
         let user = result[0];
         res.render("edit.ejs", { user });
       });
     } catch (error) {
       console.error("Error fetching tables:", error);
       res.send("Error fetching tables");
     } 
})

app.patch("/user/:id",(req,res) =>{
   let {id } = req.params;
   let {password:formPass, username:newUsername} = req.body
   let q = `SELECT * FROM users WHERE id = '${id}'`;

    try {
      connection.query(q, (error, result) => {
        if (error) throw error;

         console.log(result);
        let user = result[0];
        if(formPass !== user.password){
          res.send("Password do not match")
        }else{
          let q2 = `UPDATE users SET username = '${newUsername}' WHERE id = '${id}'`
          connection.query(q2, (error, result) => {
            if (error) throw error;
            console.log(result);
            console.log("updated!");
            res.redirect("/user");
          });

        }
      });
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.send("Error fetching tables");
    } 
})

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO users (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM users WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM users WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM users WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});


app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
