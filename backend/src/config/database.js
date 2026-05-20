import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // user: process.env.DB_USER,
  // host: process.env.DB_HOST,
  // database: process.env.DB_NAME,
  // password: process.env.DB_PASSWORD,
  // port: process.env.DB_PORT,
  // ssl: {
  //   rejectUnauthorized: false, // SSL sertifikatini tekshirishni o'chirish
  // },
});

const checkConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL database connected successfully.");
    client.release(); // Clientni poolga qaytarish
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
};

checkConnection();

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
  process.exit(-1);
});

export default pool;
