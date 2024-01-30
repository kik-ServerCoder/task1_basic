import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 5432;

const prisma = new PrismaClient();

app.get('/users', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await prisma.user.findMany();

    // Send the users as a JSON response
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Close the Prisma client when the server stops
app.on('close', async () => {
  await prisma.$disconnect();
});
