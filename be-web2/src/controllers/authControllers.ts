import type { Request, Response } from "express";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// Instansiasi PrismaClient langsung di dalam file
const prisma = new PrismaClient();

// ==========================================
// 1. FUNGSI REGISTER
// ==========================================
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validasi input data (Hanya email dan password karena kolom 'name' tidak ada di DB)
        if (!email || !password) {
            return res.status(400).json({
                message: "Email dan password wajib diisi",
            });
        }

        // Cek apakah username sudah terdaftar di database
        const existingUser = await prisma.user.findUnique({
            where: { username: email }, // Mencocokkan input email ke kolom username
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email sudah digunakan",
            });
        }

        // Enkripsi password menggunakan bcryptjs sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan user baru ke database MySQL sesuai kolom yang Anda miliki
        const newUser = await prisma.user.create({
            data: {
                username: email,          // Input email disimpan ke kolom username
                password: hashedPassword,  // Password terenkripsi
                foto: "default.png"        // Nilai default untuk kolom foto Anda
            },
        });

        // Kembalikan respon sukses beserta data user yang berhasil disimpan
        return res.status(201).json({
            message: "Register berhasil",
            data: {
                id: newUser.id,
                email: newUser.username,
                foto: newUser.foto,
                createdAt: newUser.createdAt
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan server saat registrasi",
            error: error.message
        });
    }
};

// ==========================================
// 2. FUNGSI LOGIN
// ==========================================
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validasi input data wajib
        if (!email || !password) {
            return res.status(400).json({
                message: "Email dan password wajib diisi",
            });
        }

        // Cari user berdasarkan username
        const user = await prisma.user.findUnique({
            where: { username: email },
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(401).json({
                message: "Email atau password salah",
            });
        }

        // Bandingkan password inputan dengan password terenkripsi di DB
        const isMatch = await bcrypt.compare(password, user.password);

        // Jika password tidak cocok
        if (!isMatch) {
            return res.status(401).json({
                message: "Email atau password salah",
            });
        }

        // Membuat Token JWT jika email dan password benar
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
            },
            process.env.JWT_SECRET!, // Mengambil JWT Secret key dari file .env
            {
                expiresIn: "1h", // Token hangus dalam 1 jam
            }
        );

        // Kirim token dan data profil user ke client
        return res.json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                email: user.username,
                foto: user.foto,
                createdAt: user.createdAt
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            message: "Terjadi kesalahan server saat login",
            error: error.message
        });
    }
};