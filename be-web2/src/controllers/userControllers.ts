import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 1. Menampilkan semua user
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal mengambil data user', error: error.message });
    }
};

// 2. Menyimpan data user baru
export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, foto } = req.body;
        
        // 🌟 PERBAIKAN: Validasi dinamis untuk user baru (hanya memunculkan field yang kosong)
        const missingFields: string[] = [];
        if (!username) missingFields.push('Username');
        if (!password) missingFields.push('Password');

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `${missingFields.join(' dan ')} wajib diisi` 
            });
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                password: await bcrypt.hash(password, 10), // Hash password sebelum disimpan
                // Jika foto kosong atau hanya spasi, otomatis berikan default.png
                foto: (foto && foto.trim() !== "") ? foto : "default.png"
            }
        });
        res.status(201).json(newUser);
    } catch (error: any) {
        res.status(500).json({ message: 'Gagal membuat user', error: error.message });
    }  
};

// 3. Menampilkan data user berdasarkan ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID harus berupa angka' });

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'Data user tidak ditemukan' });
        
        res.json(user);
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error saat mengambil detail data user', error: error.message });
    }
};

// 4. Mengupdate data user berdasarkan ID
export const updateUserById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID harus berupa angka' });

        const { username, password, foto } = req.body;
        
        // 🌟 PERBAIKAN: Saat edit akun, hanya Username yang wajib diisi jika kosong
        if (!username || username.trim() === "") {
            return res.status(400).json({ message: 'Username wajib diisi' });
        }

        // Siapkan objek penampung data yang dinamis
        const updateData: any = {
            username,
            // Jika foto dikosongkan oleh admin di form edit, kembalikan ke default.png
            foto: (foto && foto.trim() !== "") ? foto : "default.png"
        };

        // Jika password diisi (artinya admin mengetikkan sesuatu untuk mengganti password lama)
        if (password && password.trim() !== "") {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        });
        res.json(updatedUser);
    }
    catch (error: any) {
        res.status(500).json({
            message: 'Error saat mengupdate data user', 
            error: error.message 
        });
    }
};

// 5. Menghapus data user berdasarkan ID
export const deleteUserById = async (req: Request, res: Response) => {
    try {        
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: 'ID harus berupa angka' });

        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Data user berhasil dihapus' });
    }
    catch (error: any) {
        res.status(500).json({ message: 'Error saat menghapus data user', error: error.message });
    }
};