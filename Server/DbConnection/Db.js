import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';

dotenv.config();

let connection;

const connectToDatabase = async () => {
    if (!connection) {
        try {
            connection = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            console.log('Database connected successfully!');
        } catch (error) {
            console.error('Database connection failed:', error.message);
            throw error;
        }
    }
    return connection;
};

export default connectToDatabase;
