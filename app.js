import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 5432;

const prisma = new PrismaClient();

app.get('/users', async (req, res) => {
  try {
    
    const users = await prisma.user.findMany();
    res.json(users);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.on('close', async () => {
  await prisma.$disconnect();
});
