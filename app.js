/*
    SETUP
*/
const path = require("path");
const express = require("express");
const { engine } = require("express-handlebars");
const db = require("./database/db-connector");

const PORT = 9111;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "public")));
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: {
      json: (context) => JSON.stringify(context),
    },
  })
);
app.set("view engine", ".hbs");

/* Home Page*/
app.get("/", (req, res) => {
  res.render("index");
});

/* View Data */
app.get("/view_data", (req, res) => {
  let query1;

  if (req.query.ssm === undefined) {
    query1 = "SELECT * FROM commutes LIMIT 10;";
  } else {
    query1 = `SELECT * FROM commutes WHERE ssm LIKE "${req.query.ssm}%"`;
  }

  db.pool.query(query1, (error, rows, fields) => {
    res.render("view_data", { data: rows });
  });
});

/*filter*/
app.get("/filtered", (req, res) => {
  let query1;

  if (req.query.ssm === undefined) {
    query1 = "SELECT * FROM commutes LIMIT 10;";
  } else {
    query1 = `SELECT * FROM commutes WHERE ssm LIKE "${req.query.ssm}%" AND minute_id LIKE "${req.query.minute_id}%"`;
  }

  db.pool.query(query1, (error, rows, fields) => {
    res.render("filtered", { data: rows });
  });

  const data = res;
});

/* Attempt at a page that graphs+displays table, crashes without db connection */
app.get("/grapho", (req, res) => {
  const commuteQuery = req.query.ssm
    ? `SELECT * FROM commutes WHERE ssm LIKE "${req.query.ssm}%" AND to_work LIKE "${req.query.to_work}%"`
    : "SELECT * FROM commutes;";

  db.pool.query(commuteQuery, (_error, rows) => {
    //console.log(rows[0]);
    res.render("grapho", { data: rows });
  });
});

/* D3 Graphs - WORKED WITH THE OLD DB
    app.get("/d3_graphs", (req, res) => {
      const commuteQuery = req.query.ssm
        ? `SELECT * FROM commutes WHERE ssm LIKE "${req.query.ssm}%" AND to_work LIKE "${req.query.to_work}%"`
        : "SELECT * FROM commutes;";

      db.pool.query(commuteQuery, (_error, rows) => {
        res.render("d3_graphs", { data: rows });
      });
    });
    */

app.get("/d3_graphs", (req, res) => {
  const selectedMonth = req.query.month || 1; // Default to January if no month is selected

  const commuteQuery = req.query.ssm
    ? `SELECT commute_date, ssm, to_home, to_work FROM commutes
       WHERE ssm LIKE "${req.query.ssm}%" AND to_work LIKE "${req.query.to_work}%"
       AND MONTH(commute_date) = ${selectedMonth};`
    : `SELECT c.commute_date, c.ssm, c.to_home, c.to_work, c.to_work_no_traffic, c.to_home_no_traffic, d.day_of
      FROM commutes c
      INNER JOIN days d ON c.commute_date = d.date
      WHERE MONTH(c.commute_date) = ${selectedMonth};`;

  db.pool.query(commuteQuery, (_error, rows) => {
    res.render("d3_graphs", { data: rows });
  });
});

app.listen(PORT, () => {
  console.log(
    `Express started on http://localhost:${PORT}; press Ctrl-C to terminate.`
  );
});
