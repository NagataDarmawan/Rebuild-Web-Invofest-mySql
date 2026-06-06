import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [foto, setFoto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false); // 🌟 TAMBAHAN: State Lihat Password

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/users/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          let errorMessage = "Gagal memuat data user";
          try {
            const result = await response.json();
            errorMessage = result.message || errorMessage;
          } catch {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setUsername(data.username);
        // Jika fotonya default.png, dikosongkan di input biar bersih
        setFoto(data.foto === "default.png" ? "" : data.foto || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // 🌟 VALIDASI: Jika password diisi, wajib minimal 8 karakter
    if (password.trim() !== "" && password.length < 8) {
      setError("Password baru harus minimal 8 karakter");
      return;
    }

    // 🌟 PENYESUAIAN PAYLOAD: Foto opsional jika dikosongkan diganti ke default.png
    const payload: any = { 
      username, 
      foto: foto.trim() === "" ? "default.png" : foto 
    };
    
    if (password.trim() !== "") {
      payload.password = password;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Gagal memperbarui data user");
      }

      alert("User berhasil diperbarui!");
      navigate("/dashboard/user");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    // 🌟 DISESUAIKAN: Layout container mengecil ke tengah (max-w-md) & mt-10 agar identik dengan UserCreate
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl border border-gray-100 shadow-md">
      
      {/* HEADER FORM */}
      <div className="mb-6 text-center">
        <span className="text-[10px] font-semibold text-[#7B1D3F] tracking-widest uppercase block">Manajemen</span>
        <h2 className="text-2xl font-bold text-[#1a0a10]">Edit Akun Pengguna</h2>
      </div>

      {/* ALERT ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm text-center">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <p className="text-center py-10 text-gray-400 text-sm">Memuat data pengguna...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Input Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Masukkan username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1D3F]"
            />
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
            </label>
            <input
              type={showPassword ? "text" : "password"} // 🌟 DISESUAIKAN: Berubah dinamis
              placeholder="Kosongkan jika tidak ingin diubah (min. 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1D3F]"
            />
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
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              placeholder="Masukkan URL foto profil jika ada (kosongkan jika tidak ada)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1D3F]"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-medium transition-colors"
              onClick={() => navigate("/dashboard/user")}
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 bg-[#7B1D3F] hover:bg-[#9e2550] text-white py-2 rounded-xl font-medium transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}