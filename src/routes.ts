import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyToken } from './middleware';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();



const router = express.Router();


router.post('/register', async (req:Request, res:Response) => {
    try {
      const { email, name, age, password, username } = req.body;
      const parsedAge = parseInt(age, 10);
      const hashedPassword = await bcrypt.hash(password, 10);
      if (isNaN(parsedAge)) {
        return res.status(400).json({ errors: ['Age must be a valid integer'] });
      }
  
      if (!email || !name || !age || !password || !username) {
        return res.status(400).json({ errors: ['Email, name, age, password and username are required fields'] });
      }
  
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          age:parsedAge,
          password:hashedPassword,
          username
        },
      });
  
      res.status(201).json({ message: 'Successfully inserted new user', identity: newUser.id });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });




  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
  
      const user = await prisma.user.findUnique({ where: { username } });
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
  
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });
      res.status(201).json({ message: 'login Successful', identity: token });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

  


  router.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });
      await prisma.passwordResetToken.create({
        data: {
          token: resetToken,
          expiresAt: new Date(Date.now() + 3600000),
          userId: user.id,
        },
      });
      res.json({ message: 'Password reset initiated. Check your email for instructions.', resetToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });


  router.post('/reset-password/:token', async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    try {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
      });
  
      if (!resetToken || resetToken.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired token.' });
      }
  
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });
      try{await prisma.passwordResetToken.delete({
        where: { token },
      });}catch(error){
        res.status(400).json({message: 'Token Expired'})
      }
      
  
      res.json({ message: 'Password reset successful.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

  router.get('/users', verifyToken, async (req:Request, res:Response) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/updateuser', async (req:Request, res:Response) =>{
    try {
      const userId: number = parseInt(req.params.id, 10);
      const { email, name, age, password, username } = req.body;
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge)) {
        return res.status(400).json({ errors: ['Age must be a valid integer'] });
      }
  
      if (!email || !name || !age || !password  || !username) {
        return res.status(400).json({ errors: ['Email, name, age, and password are required fields'] });
      }
  
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          email,
          name,
          age:parsedAge,
          password,
          username
        },
      });
  
      res.status(201).json({message: 'updated user:', identity: updatedUser.id});
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

  router.delete('/delete', async (req:Request, res:Response) => {
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


  export default router;