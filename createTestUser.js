const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

async function main() {
  console.log("Starting test user creation script...");
  const uri =
    "mongodb+srv://princyballabh13:v4QP4wQyecSXmGja@cluster0.fxeyrjz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
