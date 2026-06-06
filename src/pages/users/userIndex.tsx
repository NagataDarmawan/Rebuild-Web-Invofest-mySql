import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface UserData {
  id: number;
  username: string;
  foto: string;
  created_at: string;
}

export default function UserIndex() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await fetch("http://localhost:3000/users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data user");
        }
        
        setUsers(Array.isArray(result) ? result : result.data || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan jaringan saat memuat data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus user dengan ID #${id}?`)) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/users/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || "Gagal menghapus user");
        }

        setUsers(users.filter((user) => user.id !== id));
        alert("User berhasil dihapus.");
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert("Gagal menghapus akun pengguna.");
        }
      }
    }
  };

  return (
    <div className="px-7 py-8 max-w-5xl mx-auto font-sans">
      
      {/* 🌟 PERBAIKAN: Struktur tata letak header disamakan persis dengan PembicaraIndex */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[10px] font-semibold text-[#7B1D3F] tracking-widest uppercase">Manajemen</span>
          <h1 className="text-3xl font-bold text-[#1a0a10] tracking-tight">Users</h1>
          <p className="text-sm text-gray-400 mt-1">Manajemen akun pengguna aplikasi INVOFEST.</p>
        </div>
        
        <Link 
          to="/dashboard/user/create" 
          className="bg-[#7B1D3F] hover:bg-[#9e2550] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Tambah User</span>
        </Link>
      </div>

      {/* ALERT ERROR DATA */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl text-center shadow-sm">
          ⚠️ {error}
        </div>
      )}

      {/* TABLE DATA CONTAINER */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <p className="text-center py-10 text-gray-400 text-sm">Memuat data pengguna...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">Tidak ada data user yang ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b">
                  <th className="pb-4 w-16">ID</th>
                  <th className="pb-4 w-20">Foto</th>
                  <th className="pb-4">Username</th>
                  <th className="pb-4">Tanggal Dibuat</th>
                  <th className="pb-4 text-center w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-mono font-medium text-gray-400">#{user.id}</td>
                    
                    {/* Render Foto */}
                    <td className="py-4">
                      <img
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        src={user.foto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                        alt={user.username}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80";
                        }}
                      />
                    </td>
                    
                    <td className="py-4 font-semibold text-gray-900">{user.username}</td>
                    
                    {/* Render Tanggal Dibuat */}
                    <td className="py-4 text-gray-500">
                      {(() => {
                        const rawDate = user.created_at || (user as any).createdAt;
                        if (!rawDate) return <span className="text-gray-400 italic text-xs">Tidak ada tanggal</span>;
                        const parsedDate = new Date(rawDate);
                        if (isNaN(parsedDate.getTime())) {
                          return <span className="text-gray-400 text-xs">{String(rawDate)}</span>;
                        }
                        return parsedDate.toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        });
                      })()}
                    </td>
                    
                    {/* Aksi Edit & Hapus */}
                    <td className="py-4">
                      <div className="flex justify-center items-center gap-4">
                        <Link
                          to={`/dashboard/user/edit/${user.id}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}