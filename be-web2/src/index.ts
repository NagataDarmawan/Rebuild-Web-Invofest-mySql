import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/eventRoute.js';      
import categoryRoutes from './routes/categoryRoute.js'; 
import pembicaraRoutes from './routes/pembicaraRoute.js'; 
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'; // Pastikan ada akhiran .js

const app = express();
const port = process.env.PORT || 3000;

// Middleware Global
app.use(cors());
app.use(express.json());

// Halaman Utama / Tes Koneksi
app.get('/', (req, res) => {
  res.send('API be-web2 is running!');
});

// Pendaftaran Routing API
app.use("/events", eventRoutes);
app.use("/categories", categoryRoutes);
app.use("/pembicara", pembicaraRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes); // Jalur utama untuk register dan login

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;