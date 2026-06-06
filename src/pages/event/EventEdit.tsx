import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
}

interface Speaker {
  id: number;
  name: string;
  topik: string;
}

export default function EventEdit() {
  const { id } = useParams(); // Mengambil ID dari URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // State loading untuk tombol submit
  
  // State untuk menyimpan daftar master data dropdown
  const [categories, setCategories] = useState<Category[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);

  // State Form (dateEvent hanya menyimpan string tanggal "YYYY-MM-DD")
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    dateEvent: "",
    description: "",
    categoryId: "",
    pembicaraId: ""
  });

  // 1. Ambil data master dropdown & detail event saat halaman dimuat
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Fetch daftar kategori untuk dropdown
        const resCat = await fetch("http://localhost:3000/categories");
        const dataCat = await resCat.json();
        setCategories(dataCat);

        // Fetch daftar pembicara untuk dropdown
        const resSpeaker = await fetch("http://localhost:3000/pembicara");
        const dataSpeaker = await resSpeaker.json();
        setSpeakers(dataSpeaker);

        // Fetch detail data event yang mau diedit
        const resEvent = await fetch(`http://localhost:3000/events/${id}`);
        const dataEvent = await resEvent.json();

        // Format tanggal ISO dari backend agar pas dibaca oleh type="date" (YYYY-MM-DD)
        let formattedDate = "";
        if (dataEvent.dateEvent) {
          const date = new Date(dataEvent.dateEvent);
          // Menghasilkan format murni tanggal sepanjang 10 karakter: YYYY-MM-DD
          formattedDate = date.toISOString().slice(0, 10);
        }

        setFormData({
          name: dataEvent.name || "",
          location: dataEvent.location || "",
          dateEvent: formattedDate,
          description: dataEvent.description || "",
          categoryId: dataEvent.categoryId ? String(dataEvent.categoryId) : "",
          pembicaraId: dataEvent.pembicaraId ? String(dataEvent.pembicaraId) : ""
        });

      } catch (err) {
        console.error("Gagal mengambil data komponen edit:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id]);

  // 2. Fungsi simpan perubahan (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Membersihkan string tanggal dari whitespace tidak terlihat sebelum disatukan
      const cleanDate = formData.dateEvent.trim();
      const fullDateTimeString = `${cleanDate}T07:00:00.000Z`;

      const response = await fetch(`http://localhost:3000/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          description: formData.description,
          categoryId: Number(formData.categoryId),
          pembicaraId: Number(formData.pembicaraId),
          dateEvent: new Date(fullDateTimeString).toISOString() // Dikirim kembali sebagai ISO String ke backend
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Event berhasil diperbarui!");
        navigate("/dashboard/event"); // Balik ke halaman daftar event
      } else {
        alert(result.message || "Gagal memperbarui data event.");
      }
    } catch (error) {
      console.error("Gagal update:", error);
      alert("Gagal terhubung ke server. Pastikan server backend sudah dinyalakan!");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400 text-sm">Memuat data event...</div>;

  return (
    // Ukuran kontainer disamakan dengan EventCreate (max-w-2xl)
    <div className="p-6 max-w-2xl mx-auto font-sans">
      
      {/* Box Utama Form dengan padding p-8 dan rounded-3xl sesuai EventCreate */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm p-8 rounded-3xl space-y-4">
        
        {/* Teks Judul dan Sub-deskripsi */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-[#1a0a10]">Edit Event</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ubah data event yang diperlukan di bawah ini</p>
        </div>

        {/* Nama Event */}
        <div>
          <label className="block text-xs font-semibold text-[#1a0a10] mb-1.5">Nama Event</label>
          <input 
            type="text"
            className="border border-gray-300 p-2.5 w-full rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-[#7B1D3F]"
            placeholder="Masukkan nama event..."
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        {/* Grid Kolom: Kategori & Pembicara */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dropdown Kategori */}
          <div>
            <label className="block text-xs font-semibold text-[#1a0a10] mb-1.5">Kategori Event</label>
            <select 
              className="border border-gray-300 p-2.5 w-full rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:border-[#7B1D3F]"
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Dropdown Pembicara */}
          <div>
            <label className="block text-xs font-semibold text-[#1a0a10] mb-1.5">Pembicara</label>
            <select 
              className="border border-gray-300 p-2.5 w-full rounded-xl text-sm bg-white text-gray-700 focus:outline-none focus:border-[#7B1D3F]"
              value={formData.pembicaraId}
              onChange={(e) => setFormData({...formData, pembicaraId: e.target.value})}
              required
            >
              <option value="">-- Pilih Pembicara --</option>
              {speakers.map((spk) => (
                <option key={spk.id} value={spk.id}>{spk.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Kolom: Lokasi & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Lokasi */}
          <div>
            <label className="block text-xs font-semibold text-[#1a0a10] mb-1.5">Lokasi</label>
            <input 
              type="text"
              className="border border-gray-300 p-2.5 w-full rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-[#7B1D3F]"
              placeholder="Gedung / Link Online..."
              value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          {/* Tanggal Event */}
          <div>
            <label className="block text-xs font-semibold text-[#1a0a10] mb-1.5">Tanggal Event</label>
            <input 
              type="date" 
              className="border border-gray-300 p-2.5 w-full rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#7B1D3F]"
              value={formData.dateEvent || ""} 
              onChange={(e) => setFormData({...formData, dateEvent: e.target.value})}
              required
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-xs font-semibold text-[#1a0a10] mb-1.5">Deskripsi Event</label>
          <textarea 
            rows={4}
            className="border border-gray-300 p-2.5 w-full rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-[#7B1D3F] resize-none"
            placeholder="Tulis detail deskripsi event di sini..."
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        {/* Tombol Aksi Kanan Bawah */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 border border-gray-300 text-sm font-semibold rounded-xl text-gray-500 hover:bg-gray-50 transition-all"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={isUpdating}
            className="bg-[#7B1D3F] hover:bg-[#611631] text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:bg-gray-400"
          >
            {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}