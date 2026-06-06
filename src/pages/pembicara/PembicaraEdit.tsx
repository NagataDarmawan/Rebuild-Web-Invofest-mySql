import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../component/UI/Button";
import Input from "../../component/UI/Input";

// Schema Zod disederhanakan (eventId dihapus)
const schema = z.object({
  name: z.string().min(3, "Minimal 3 karakter"),
  topik: z.string().min(3, "Minimal 3 karakter"),
});

type FormData = z.infer<typeof schema>;

export default function PembicaraEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // 1. Load data lama pembicara berdasarkan ID (MENGGUNAKAN URL BACKEND VERCEL)
  useEffect(() => {
    fetch(`http://localhost:3000/pembicara/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data pembicara");
        return res.json();
      })
      .then((data) => {
        setValue("name", data.name);
        setValue("topik", data.topik);
        setIsFetching(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Gagal mengambil data pembicara.");
        navigate("/dashboard/pembicara");
      });
  }, [id, setValue, navigate]);

  // 2. Submit Update Data ke Backend (MENGGUNAKAN URL BACKEND VERCEL)
  const onsubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`http://localhost:3000/pembicara/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Hanya mengirim nama dan topik yang diubah
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal update data");
      
      alert("Data pembicara berhasil diperbarui!");
      navigate("/dashboard/pembicara");
    } catch (error: any) {
      setFeedback({ text: error.message || "Terjadi kesalahan koneksi", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <p className="p-10 text-center text-gray-400 text-sm">Memuat data pembicara...</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 font-sans">
      <h1 className="text-2xl font-bold mb-1 text-gray-800">Edit Pembicara</h1>
      <p className="text-sm text-gray-400 mb-6">Ubah informasi profil atau keahlian dari pembicara</p>

      {/* Komponen Feedback */}
      {feedback && (
        <div className={`p-4 mb-4 rounded-lg text-sm font-medium ${
          feedback.isError 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onsubmit)} className="space-y-4">
        <Input 
          label="Nama Pembicara" 
          name="name" 
          register={register} 
          error={errors.name?.message} 
        />
        
        <Input 
          label="Topik Keahlian / Materi" 
          name="topik" 
          register={register} 
          error={errors.topik?.message} 
        />
        
        <div className="flex gap-2 pt-2">
          {/* Perbaikan di sini: Menghapus properti disabled */}
          <Button 
            label={isLoading ? "Menyimpan..." : "Simpan Perubahan"} 
          />
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}