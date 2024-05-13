const pg = require('pg')
const express = require('express');

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(require('morgan')('dev'))

const { Client } = pg

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost:5432/acme_notes_categories_db')

// GET /api/employees
app.get('/api/employees', (req, res, next) => {
    try {
        res.send('ok')
    } catch (error) {
        next(error)
    }
})
// GET /api/departments
// POST /api/employees
// PUT /api/employees/:id
// DELETE /api/employees/:id

const init = async () => {
    await client.connect

    let SQL = `
    DROP table if exists employees;
    DROP table if exists departments;
    CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
    );
    CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name varchar NOT NULL,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        ranking integer DEFAULT 3 NOT NULL,
        txt varchar(255) NOT NULL,
        category_id integer references departments(id) NOT NULL
    );
    INSERT INTO departments(name) VALUES('HTML');
    INSERT INTO departments(name) VALUES('CSS');
    INSERT INTO departments(name) VALUES('Javascript');
    INSERT INTO departments(name) VALUES('React');
    INSERT INTO departments(name) VALUES('SQL');
    INSERT INTO employees(txt, ranking, category_id) 
        VALUES('learn postgresql', 5, (SELECT id from departments WHERE name = 'SQL'));
    INSERT INTO employees(txt, ranking, category_id) 
        VALUES('add logging middleware', 5, (SELECT id from departments WHERE name = 'SQL'));
    INSERT INTO employees(txt, ranking, category_id) 
        VALUES('build frontend', 5, (SELECT id from departments WHERE name = 'React'));

    `

    await client.query(SQL)
    console.log('data seeded');
    app.listen(port, () => {
        console.log('server listening on port: ' + port);
    })
}

init()