\d
\dt

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author VARCHAR(100),
    url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES 
('Dan Abramov', 'https://reactjs.org/blog', 'On Let vs Const', 0),
('Laurenz Albe', 'https://blog.postgresql.org', 'Gaps in Sequences in PostgreSQL', 0);

SELECT * FROM blogs;

drop table blogs;

