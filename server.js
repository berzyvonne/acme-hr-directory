const pg = require("pg");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(require("morgan")("dev"));

const { Client } = pg;

const client = new Client(
  process.env.DATABASE_URL || "postgres://localhost/acme-hr-directory"
);

// GET /api/employees
app.get("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * FROM employee;
        `;
    const response = await client.query(SQL);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/departments
app.get("/api/departments", async (req, res, next) => {
  try {
    const SQL = `
            SELECT * FROM department;
        `;
    const response = await client.query(SQL);
    res.send(response);
  } catch (error) {
    next(error);
  }
});

// POST /api/employees
app.post("/api/employees", async (req, res, next) => {
  try {
    const SQL = `
        INSERT into employee (name, department_id)
            VALUES($1, $2)
            RETURNING *
        `;

    const result = await client.query(SQL, [
      req.body.name,
      req.body.department_id,
    ]);
    res.send("ok");
  } catch (error) {
    next(error);
  }
});

// PUT /api/employees/:id
app.put("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `
        UPDATE employee
        SET name=$1, department_id=$2, updated_at=now()
            WHERE id=$3 RETURNING *
        `;
    const result = await client.query(SQL, [
      req.body.name,
      req.body.department_id,
      req.params.id,
    ]);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/employees/:id
app.delete("/api/employees/:id", async (req, res, next) => {
  try {
    const SQL = `
        DELETE from employee WHERE id = $1
        `;
    const result = await client.query(SQL, [req.params.id]);
    res.send("ok");
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();

  let SQL = `
      DROP TABLE IF EXISTS employee;
      DROP TABLE IF EXISTS department;
  
      CREATE TABLE department (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL
      );
      CREATE TABLE employee (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT now(),
          updated_at TIMESTAMP DEFAULT now(),
          department_id INTEGER REFERENCES department(id) NOT NULL
        );
  
        INSERT INTO department(name) VALUES('IT');
        INSERT INTO department(name) VALUES('Human Resources');
        INSERT INTO department(name) VALUES('Accounting and Finance');
        INSERT INTO department(name) VALUES('Research and Development');
  
        INSERT INTO employee(name, department_id) 
        VALUES('Devon', (SELECT id FROM department WHERE name='Research and Development'));
        
        INSERT INTO employee(name, department_id) 
        VALUES('Robin', (SELECT id FROM department WHERE name='Research and Development'));
        
        INSERT INTO employee(name, department_id) 
        VALUES('Abby', (SELECT id FROM department WHERE name='IT'));

        INSERT INTO employee(name, department_id) 
        VALUES('Tyler', (SELECT id FROM department WHERE name='IT'));
        
        INSERT INTO employee(name, department_id) 
        VALUES('Jackson', (SELECT id FROM department WHERE name='Human Resources'));

        INSERT INTO employee(name, department_id) 
        VALUES('Amy', (SELECT id FROM department WHERE name='Human Resources'));

        INSERT INTO employee(name, department_id) 
        VALUES('Pat', (SELECT id FROM department WHERE name='Accounting and Finance'));
        
        INSERT INTO employee(name, department_id) 
        VALUES('Yvonne', (SELECT id FROM department WHERE name='Accounting and Finance'));
  
    `;

  await client.query(SQL);
  console.log("data seeded");
  app.listen(port, () => {
    console.log("server listening on port: " + port);
  });
};

init();
