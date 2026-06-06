import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Input from "../component/UI/Input";

// 🌟 PENYESUAIAN: Pakai email & password sesuai testing di Postman
type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const schema = z
  .object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Minimal 8 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

export default function Register() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // 🌟 PERBAIKAN: Menggunakan Fetch API bawaan browser (Tanpa Axios)
  const onSubmit = async (data: FormData) => {
    // payload hanya berisi email dan password saja sesuai dengan Postman kamu
    const payload = {
      email: data.email,
      password: data.password,
    };

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Wajib memberitahu server kalau kita kirim JSON
        },
        body: JSON.stringify(payload), // Mengubah object ke string JSON
      });

      const result = await response.json(); // Membaca response body dari server

      if (response.ok) { // Jika status code 200-299 (di Postman kamu 201 Created)
        alert(result.message || "Register berhasil!");
        navigate("/login"); 
      } else {
        // Jika server mengembalikan error (misal email sudah terdaftar)
        alert(result.message || "Gagal melakukan registrasi");
      }
    } catch (error) {
      console.error("Error saat fetch data:", error);
      alert("Tidak dapat terhubung ke server backend. Pastikan backend menyala.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-md bg-white border border-pink-100 rounded-2xl shadow-xl p-6 flex flex-col gap-5 transition-all duration-300">
        
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase text-[#7B1D3F] tracking-wider">
            <span className="rounded-full" />
            Invofest 2025
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Buat Akun
          </h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">
            Bergabung dan jadilah bagian dari festival inovasi
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-3.5">
            
            {/* 🌟 PENYESUAIAN: Input diganti kembali ke Email */}
            <Input
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email?.message}
            />

            {/* Grid Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                register={register}
                error={errors.password?.message}
              />
              <Input
                label="Konfirmasi Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                register={register}
                error={errors.confirmPassword?.message}
              />
            </div>

            {/* Checkbox Lihat Password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1 -mt-1">
              <p className="text-[11px] text-gray-400 font-medium order-2 sm:order-1">
                Minimal 8 karakter
              </p>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold cursor-pointer select-none order-1 sm:order-2">
                <input 
                  type="checkbox" 
                  checked={showPassword} 
                  onChange={() => setShowPassword(!showPassword)}
                  className="rounded border-gray-300 text-[#7B1D3F] focus:ring-[#7B1D3F] h-3.5 w-3.5"
                />
                Lihat Password
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#7B1D3F] hover:bg-[#5a1530] active:scale-[0.98] text-white font-bold text-[15px] py-3 rounded-xl transition-all duration-200 tracking-wide shadow-md shadow-pink-900/10 hover:shadow-lg hover:shadow-pink-900/20 mt-1"
          >
            Daftar Sekarang
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-medium px-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="uppercase tracking-wider">atau</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Login link */}
        <p className="text-sm text-center text-gray-600 font-medium">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-[#7B1D3F] font-bold hover:text-[#5a1530] hover:underline transition-colors duration-200">
            Login sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}