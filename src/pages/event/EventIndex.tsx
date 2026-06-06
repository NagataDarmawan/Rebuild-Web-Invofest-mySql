import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Menyesuaikan interface agar mendukung data relasi dari Backend
interface EventData {
  id: number;
  name: string;
  location: string;
  dateEvent: string;
  description: string;
  category: {
    id: number;
    name: string;
  };
  pembicara: {
    id: number;
    name: string;
    topik: string;
  };
}

export default function EventIndex() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3000/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi Hapus Data (Logika disederhanakan karena Event tidak lagi dikunci tabel lain)
  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus event ini?")) {
      try {
        const response = await fetch(`http://localhost:3000/events/${id}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          // Update state agar tabel langsung ter-refresh tanpa reload halaman
          setEvents(events.filter((e) => e.id !== id));
          alert("Event berhasil dihapus!");
        } else {
          alert(result.message || "Gagal menghapus event.");
        }
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Terjadi kesalahan koneksi ke server.");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="px-7 py-8 max-w-6xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-[10px] font-semibold text-[#7B1D3F] tracking-widest uppercase">Manajemen</span>
          <h1 className="text-3xl font-bold text-[#1a0a10] tracking-tight">Event</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola dan pantau semua daftar event</p>
        </div>

        <Link
          to="/dashboard/event/create"
          className="bg-[#7B1D3F] hover:bg-[#9e2550] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all"
        >
          + Tambah Event
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-x-auto">
        {isLoading ? (
          <p className="text-center text-gray-400 py-10">Memuat data...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-gray-400 py-10">Daftar event akan muncul di sini.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wider border-b">
                <th className="pb-4">Nama Event</th>
                <th className="pb-4">Kategori</th>
                <th className="pb-4">Pembicara</th>
                <th className="pb-4">Lokasi</th>
                <th className="pb-4">Tanggal</th>
                <th className="pb-4">Deskripsi</th>
                <th className="pb-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {events.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-4 font-semibold text-[#1a0a10]">{e.name}</td>
                  
                  {/* Menampilkan Nama Kategori Dinamis */}
                  <td className="py-4">
                    <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-md">
                      {e.category?.name || "Tanpa Kategori"}
                    </span>
                  </td>

                  {/* Menampilkan Nama Pembicara Dinamis */}
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{e.pembicara?.name || "Tanpa Pembicara"}</span>
                      <span className="text-xs text-gray-400">{e.pembicara?.topik || ""}</span>
                    </div>
                  </td>

                  <td className="py-4 text-gray-600">{e.location}</td>
                  <td className="py-4 text-gray-600">
                    {new Date(e.dateEvent).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 max-w-[180px] truncate text-gray-500" title={e.description}>
                    {e.description}
                  </td>
                  
                  <td className="py-4">
                    <div className="flex justify-center items-center gap-3">
                      <Link 
                        to={`/dashboard/event/edit/${e.id}`} 
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(e.id)} 
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