import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import Input from "../component/UI/Input";
import { useAuthStore } from "../store/useAuthStore";

type FormData = {
  username: string;
  password: string;
};

const schema = z.object({
  username: z.string().min(2, "Username harus diisi").max(100),
  password: z.string().min(8, "Minimal 8 karakter").max(100),
});

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false); // State untuk mengontrol tombol loading
  const [showPassword, setShowPassword] = useState<boolean>(false); // 🌟 TAMBAHAN: State untuk show/hide password

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 🌟 DI SINI PERUBAHANNYA:
        // Mengirimkan nilai 'data.username' ke backend dengan nama properti 'email'
        body: JSON.stringify({
          email: data.username, 
          password: data.password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Menangkap pesan error spesifik yang dilempar oleh backend kamu
        throw new Error(result.message || "Username atau password salah.");
      }

      alert("Login berhasil!");
      
      // Simpan JWT token ke localStorage jika dikembalikan oleh backend
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      // 🌟 PERBAIKAN DI SINI: Ambil objek user dari db (termasuk foto profilnya)
      const userFromDB = result.user || result.data || result;
      login({
        username: userFromDB.username || data.username,
        foto: userFromDB.foto || "default.png" // default.png jika foto kosong di DB
      });

      navigate("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Login gagal! Pastikan jaringan Anda terhubung.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-transparent">
      <div className="w-full max-w-md bg-white border border-pink-100 rounded-2xl shadow-xl p-8 flex flex-col gap-7 transition-all duration-300">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase text-[#7B1D3F] tracking-wider">
            <span className="rounded-full" />
            Invofest 2025
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Selamat Datang
          </h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed">
            Masuk untuk melanjutkan ke dashboard kamu
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
          <div className="flex flex-col gap-4">
            <Input
              label="Username"
              name="username"
              register={register}
              error={errors.username?.message}
            />

            <div className="flex flex-col gap-2">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"} // 🌟 TAMBAHAN: Tipe berubah dinamis tergantung state
                register={register}
                error={errors.password?.message}
              />
              
              {/* 🌟 TAMBAHAN: Fitur Toggle Lihat Password & Lupa Password */}
              <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 text-xs text-gray-500 font-medium cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showPassword} 
                    onChange={() => setShowPassword(!showPassword)}
                    className="rounded border-gray-300 text-[#7B1D3F] focus:ring-[#7B1D3F] h-3.5 w-3.5"
                  />
                  Tampilkan Password
                </label>
                
                <span className="text-xs text-[#7B1D3F] font-semibold cursor-pointer hover:text-[#5a1530] hover:underline transition-colors duration-200">
                  Lupa password?
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7B1D3F] hover:bg-[#5a1530] active:scale-[0.98] disabled:bg-gray-400 text-white font-bold text-[15px] py-3.5 rounded-xl transition-all duration-200 tracking-wide shadow-md shadow-pink-900/10 hover:shadow-lg hover:shadow-pink-900/20 mt-2"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 text-gray-400 text-xs font-medium px-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="uppercase tracking-wider">atau</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Register link */}
        <p className="text-sm text-center text-gray-600 font-medium">
          Belum punya akun?{" "}
          <Link to="/register" className="text-[#7B1D3F] font-bold hover:text-[#5a1530] hover:underline transition-colors duration-200">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}