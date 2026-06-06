import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
}

export default function CategoryIndex() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fungsi Fetch Data Kategori (MENGGUNAKAN URL BACKEND VERCEL)
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Fungsi Hapus Kategori dengan Catching Error P2003 Dinamis (MENGGUNAKAN URL BACKEND VERCEL)
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    try {
      const res = await fetch(`http://localhost:3000/categories/${id}`, {
        method: "DELETE",
      });
      
      const result = await res.json();

      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        alert("Kategori berhasil dihapus!");
      } else {
        // Berhasil menampilkan alert: "Harus hapus event yang menggunakan kategori ini dulu..."
        alert(result.message || "Gagal menghapus kategori");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div className="px-7 py-8 max-w-5xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[10px] font-semibold text-[#7B1D3F] tracking-widest uppercase">Manajemen</span>
          <h1 className="text-3xl font-bold text-[#1a0a10] tracking-tight">Kategori</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola daftar kategori untuk mengelompokkan event</p>
        </div>
        <Link 
          to="/dashboard/category/create" 
          className="bg-[#7B1D3F] hover:bg-[#9e2550] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
        >
          + Tambah Kategori
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Memuat data kategori...</p>
        ) : categories.length === 0 ? (
          <p className="text-center py-10 text-gray-400">Belum ada kategori yang terdaftar.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b">
                <th className="pb-4 w-24">ID</th>
                <th className="pb-4">Nama Kategori</th>
                <th className="pb-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 text-gray-500 font-mono">#{cat.id}</td>
                  <td className="py-4 font-semibold text-gray-900">{cat.name}</td>
                  <td className="py-4">
                    <div className="flex justify-center items-center gap-4">
                      <Link 
                        to={`/dashboard/category/edit/${cat.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(cat.id)} 
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
        )}
      </div>
    </div>
  );
}