
import { PrismaClient } from '@prisma/client';
import express from 'express';

const app = express();

const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const prisma = new PrismaClient();

app.use(express.json());




app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.post('/addusers', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required fields' });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    res.status(201).json({ message: 'Successfully inserted new user', identity : newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.put('/updateuser/:id', async (req, res) => {
  try {
    const userId: number = parseInt(req.params.id, 10);
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required fields' });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
        name,
      },
    });

    res.json("updated user:");
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.delete('/deleteuser/:id', async (req, res) => {
  try {
    const userId: number = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.json({ message: 'User deleted successfully', deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




app.on('close', async () => {
  await prisma.$disconnect();
});
