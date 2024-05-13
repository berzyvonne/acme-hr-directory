const pg = require('pg')

const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_notes_categories_db')

const init = async () => {
    await client.connect

    let SQL = `
    DROP table if exists notes;
    DROP table if exists categories;
    CREATE table categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
    );
    CREATE table notes (
        id SERIAL PRIMARY KEY,
        name varchar NOT NULL,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now(),
        ranking integer DEFAULT 3 NOT NULL,
        txt varchar(255) NOT NULL,
        category_id integer references categories(id) NOT NULL
    );
    INSERT INTO categories(name) VALUES('HTML');
    INSERT INTO categories(name) VALUES('CSS');
    INSERT INTO categories(name) VALUES('Javascript');
    INSERT INTO categories(name) VALUES('React');
    INSERT INTO categories(name) VALUES('SQL');
    INSERT INTO notes(txt, ranking, category_id) 
        VALUES('learn postgresql', 5, (SELECT id from categories WHERE name = 'SQL'));
    INSERT INTO notes(txt, ranking, category_id) 
        VALUES('add logging middleware', 5, (SELECT id from categories WHERE name = 'SQL'));
    INSERT INTO notes(txt, ranking, category_id) 
        VALUES('build frontend', 5, (SELECT id from categories WHERE name = 'React'));

    `
}

init()