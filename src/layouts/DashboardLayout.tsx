import { useEffect } from "react"; // 🌟 TAMBAHAN: Impor useEffect
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function DashboardLayout() {
  // 🌟 Ambil state logout dan state user (berupa objek lengkap) dari Zustand
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => (state as any).user); 
  const navigate = useNavigate();

  // 🌟 TAMBAHAN: Ambil fungsi penyeleksi aksi dari Zustand (biasanya bernama setUser atau login)
  // Sesuaikan jika nama fungsi di useAuthStore kamu berbeda untuk menyimpan data user
  const setUserStore = useAuthStore((state) => (state as any).setUser || (state as any).loginSuccess);

  // 🌟 TAMBAHAN: Efek untuk fetch data user yang sedang login dari database
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:3000/auth/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();

        if (response.ok && setUserStore) {
          // Masukkan data profile terbaru (termasuk .foto) dari DB ke dalam Zustand Store
          const userData = result.data ? result.data : result;
          setUserStore(userData); 
        }
      } catch (err) {
        console.error("Gagal sinkronisasi foto profil dari DB:", err);
      }
    };

    fetchCurrentUser();
  }, [setUserStore]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token"); // Hapus token dari storage saat keluar
      logout();
      alert("Logout berhasil!");
      navigate("/login");
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#7A1C3D] text-white flex flex-col justify-between shadow-lg">
        
        <div>
          {/* LOGO */}
          <div className="h-16 flex items-center justify-center border-b border-white/20">
            <h2 className="text-xl font-bold tracking-wide">
              INVOFEST
            </h2>
          </div>

          {/* MENU */}
          <nav className="flex flex-col gap-2 p-4 text-sm">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg hover:bg-[#5C142E] transition"
            >
              Dashboard
            </Link>

            <Link
              to="/dashboard/category"
              className="px-4 py-2 rounded-lg hover:bg-[#5C142E] transition"
            >
              Category Event
            </Link>

            <Link
              to="/dashboard/event"
              className="px-4 py-2 rounded-lg hover:bg-[#5C142E] transition"
            >
              Event
            </Link>

            <Link
              to="/dashboard/pembicara"
              className="px-4 py-2 rounded-lg hover:bg-[#5C142E] transition"
            >
              Pembicara
            </Link>

            <Link
              to="/dashboard/user"
              className="px-4 py-2 rounded-lg hover:bg-[#5C142E] transition"
            >
              User
            </Link>
          </nav>
        </div>

        {/* PROFIL PENGGUNA AKTIF & LOGOUT */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-4">
          
          {/* Info User yang Sedang Login */}
          <div className="flex items-center gap-3 px-2 py-1">
            
            {/* 🌟 PERBAIKAN: Menampilkan Foto Profil dari Database */}
            <img
              className="h-10 w-10 rounded-full object-cover border border-white/20 shadow-sm"
              src={
                user?.foto 
                  ? (user.foto.startsWith("http") ? user.foto : `http://localhost:3000/uploads/${user.foto}`)
                  : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
              }
              alt={user?.username || "User"}
              onError={(e) => {
                // Fallback jika url gambar rusak atau tidak dapat di-load
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";
              }}
            />

            {/* Teks Nama/Username */}
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-pink-300 font-semibold uppercase tracking-wider">masuk sebagai</span>
              <span className="text-sm font-medium tracking-wide truncate text-white" title={user?.username || (typeof user === "string" ? user : "Pengguna")}>
                {user?.username || (typeof user === "string" ? user : "Pengguna")}
              </span>
            </div>
          </div>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-[#A52A2A] hover:bg-[#8B1E1E] py-2 rounded-lg transition font-semibold text-sm tracking-wide shadow-inner"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}