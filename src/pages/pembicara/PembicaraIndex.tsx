import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Membuat interface yang aman untuk data relasi baru
interface PembicaraData {
  id: number;
  name: string;
  topik: string;
  events: {
    id: number;
    name: string;
  }[]; // Diubah menjadi array objek karena satu pembicara bisa mengisi banyak event
}

export default function PembicaraIndex() {
  const [pembicara, setPembicara] = useState<PembicaraData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fungsi Fetch Data Pembicara (MENGGUNAKAN URL BACKEND VERCEL)
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:3000/pembicara");
      const data = await res.json();
      setPembicara(data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Fungsi Hapus dengan penanganan catching error P2003 (MENGGUNAKAN URL BACKEND VERCEL)
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pembicara ini?")) return;

    try {
      const res = await fetch(`http://localhost:3000/pembicara/${id}`, {
        method: "DELETE",
      });
      
      const result = await res.json();

      if (res.ok) {
        // Update state lokal agar langsung hilang dari list tanpa hit ulang API refresh
        setPembicara(pembicara.filter((p) => p.id !== id));
        alert("Pembicara berhasil dihapus!");
      } else {
        // Menampilkan pesan proteksi: "Harus hapus event yang diisi oleh pembicara ini dulu..."
        alert(result.message || "Gagal menghapus pembicara");
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
          <h1 className="text-3xl font-bold text-[#1a0a10] tracking-tight">Pembicara</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola dan pantau semua daftar pembicara event</p>
        </div>
        <Link 
          to="/dashboard/pembicara/create" 
          className="bg-[#7B1D3F] hover:bg-[#9e2550] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
        >
          + Tambah Pembicara
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {isLoading ? (
          <p className="text-center py-10 text-gray-400 text-sm">Memuat data pembicara...</p>
        ) : pembicara.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">Belum ada pembicara yang terdaftar.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b">
                <th className="pb-4">Nama</th>
                <th className="pb-4">Topik Keahlian</th>
                <th className="pb-4">Event yang Diisi</th>
                <th className="pb-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {pembicara.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-semibold text-gray-900">{p.name}</td>
                  <td className="py-4 text-gray-600">{p.topik}</td>
                  
                  {/* Rendering dinamis jika pembicara mengisi lebih dari satu atau belum mengisi event sama sekali */}
                  <td className="py-4">
                    {p.events && p.events.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                        {p.events.map((ev) => (
                          <span key={ev.id} className="bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded border border-blue-100" title={ev.name}>
                            {ev.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Belum ada jadwal event</span>
                    )}
                  </td>
                  
                  <td className="py-4">
                    <div className="flex justify-center items-center gap-4">
                      <Link 
                        to={`/dashboard/pembicara/edit/${p.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(p.id)} 
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