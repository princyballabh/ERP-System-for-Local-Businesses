const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
require('dotenv').config({ path: '.env.local' });

async function main() {
  console.log("Starting test user creation script...");
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error("Error: MONGODB_URI not found in .env.local");
    process.exit(1);
  }
  
  const dbName = "test";

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);
    const users = db.collection("users");

    const email = "test@example.com";
    const plainPassword = "testpassword";
    const name = "Test User";

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log("Password hashed");

    const result = await users.insertOne({
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
    });

    console.log("Test user created with _id:", result.insertedId);
    console.log("Email:", email);
    console.log("Password:", plainPassword);
  } catch (err) {
    console.error("Error creating test user:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

main();
