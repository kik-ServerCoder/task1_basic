const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

app.use(express.json()); 


app.get('/users', async (req, res) => {
  try {
    // Fetch all users from the database
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

    res.status(201).json({ message: 'Successfully inserted new user' }); 
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Close the Prisma client when the server stops
app.on('close', async () => {
  await prisma.$disconnect();
});
