import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// 1. Definisikan Schema Zod
const createUserSchema = z.object({
  username: z.string().min(1, { message: "Username wajib diisi" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }), // 🌟 PERBAIKAN: Diubah dari 3 menjadi 8 karakter
  foto: z.string().optional(),
});

type CreateUserFields = z.infer<typeof createUserSchema>;

export default function UserCreate() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  // 2. Inisialisasi React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFields>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      foto: "",
    },
  });

  // 3. Handler Kirim Data
  const onSubmit: SubmitHandler<CreateUserFields> = async (data) => {
    setIsLoading(true);
    setError(null);

    const payload = {
      username: data.username,
      password: data.password,
      foto: data.foto?.trim() === "" ? "default.png" : data.foto, 
    };

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan user baru.");
      }

      alert("User berhasil ditambahkan!");
      navigate("/dashboard/user");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan saat menghubungi server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl border border-gray-100 shadow-md">
      <div className="mb-6 text-center">
        <span className="text-[10px] font-semibold text-[#7B1D3F] tracking-widest uppercase block">Manajemen</span>
        <h2 className="text-2xl font-bold text-[#1a0a10]">Tambah User Baru</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Input Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            placeholder="Masukkan username baru"
            {...register("username")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1D3F]"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
          )}
        </div>

        {/* Input Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password (minimal 8 karakter)"
            {...register("password")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1D3F]"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Checkbox Lihat Password */}
        <div className="flex justify-end px-0.5 -mt-2">
          <label className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showPassword} 
              onChange={() => setShowPassword(!showPassword)}
              className="rounded border-gray-300 text-[#7B1D3F] focus:ring-[#7B1D3F] h-3.5 w-3.5"
            />
            Lihat Password
          </label>
        </div>

        {/* Input URL Foto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Foto <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
          </label>
          <input
            type="text"
            placeholder="Masukkan URL foto profil jika ada (kosongkan jika tidak ada)"
            {...register("foto")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1D3F]"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-medium transition-colors"
            onClick={() => navigate("/dashboard/user")}
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-1/2 bg-[#7B1D3F] hover:bg-[#9e2550] text-white py-2 rounded-xl font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan User"}
          </button>
        </div>
      </form>
    </div>
  );
}