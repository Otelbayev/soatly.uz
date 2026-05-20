import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

const useConnectionString = !!process.env.DATABASE_URL;

const poolConfig = useConnectionString
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:
        process.env.DB_SSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

const checkConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL database connected successfully.");
    client.release();
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
};

checkConnection();

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

export default pool;
