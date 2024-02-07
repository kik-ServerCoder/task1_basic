import { PrismaClient } from '@prisma/client'
import routes from './routes'
import express from 'express';

const app = express();
const prisma = new PrismaClient()
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;


app.use(express.json());
app.use('/api', routes);


const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.on('close', async () => {
  await prisma.$disconnect();
});
