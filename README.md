# News Now API

[Live API](https://news-now.onrender.com/)

## Project Overview

News Now API is a RESTful API that serves as the backend for a Reddit-inspired news platform, built using Express.js and Node Postgres to handle requests and interact with a PostgreSQL database. The API provides access to a variety of endpoints for querying and managing news data, supporting features such as retrieving articles, comments, and user information.

Key features:

- RESTful API design with a variety of endpoints for accessing news data
- Data querying and filtering capabilities
- Connection to a PostgreSQL database for reliable data management

## Technologies

- Express.js
- Node.js
- Node Postgres (pg)
- PostgreSQL
- Jest

## Installation and Setup

### Prerequisites

- Ensure **Node.js v21.6.2** and **Node Postgres v8.7.3** are installed on your machine.

### Steps to Set Up Locally

1. **Fork and clone the main branch of the repository:**
   ```bash
   git clone https://github.com/your-username/news-now-api.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   - Create `.env.test` and `.env.development` files in the project root.
   - Add the following to both files, replacing `insert-relevant-database-name-here` with the actual database names:
     ```plaintext
     PGDATABASE=insert-relevant-database-name-here
     ```
   - For database names, please contact [akivakaufman@gmail.com](mailto:akivakaufman@gmail.com).

4. **Set up and seed the databases:**
   - Run the following command to initialise the test and development databases:
     ```bash
     npm run setup-dbs
     ```
   - Seed the development database with sample data:
     ```bash
     npm run seed
     ```

5. **Start the server:**
   ```bash
   npm start
   ```
   The server will begin listening on your local device.
