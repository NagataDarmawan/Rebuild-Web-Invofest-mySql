import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom"; // Impor useNavigate
import Button from "../../component/UI/Button";
import Input from "../../component/UI/Input";

// Schema Zod disederhanakan
const schema = z.object({
  name: z.string().min(3, "Nama pembicara minimal 3 karakter"),
  topik: z.string().min(3, "Topik pembicara minimal 3 karakter"),
});

type FormData = z.infer<typeof schema>;

export default function PembicaraCreate() {
  const navigate = useNavigate(); // Inisialisasi hook navigate
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ 
    resolver: zodResolver(schema) 
  });

  const onsubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setFeedback(null); 
    
    try {
      // MENGUBAH URL KE BACKEND VERCEL YANG ONLINE
      const response = await fetch("http://localhost:3000/pembicara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Validasi tipe konten dari backend
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server tidak merespons dengan benar. Pastikan backend aktif.");
      }

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Gagal menyimpan data pembicara");

      setFeedback({ text: "Pembicara berhasil ditambahkan!", isError: false });
      reset(); 
            
    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan koneksi";
      
      if (error instanceof Error) {
        // Deteksi jika server backend mati (Failed to fetch)
        if (error.message.includes("fetch")) {
          errorMessage = "Gagal terhubung ke server. Pastikan server backend sudah dinyalakan!";
        } else {
          errorMessage = error.message;
        }
      }
      
      setFeedback({ text: errorMessage, isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 font-sans">
      <h1 className="text-2xl font-bold mb-1 text-gray-800">Tambah Pembicara</h1>
      <p className="text-sm text-gray-400 mb-6">Daftarkan profil pembicara baru untuk mengisi event</p>

      {/* Komponen Feedback Dinamis */}
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
        
        {/* Kontainer Tombol - Flexbox Sejajar */}
        <div className="flex gap-2 pt-2">
          {/* Perbaikan di sini: Menghapus properti disabled */}
          <Button 
            label={isLoading ? "Menyimpan..." : "Simpan Pembicara"} 
          />
          <button 
            type="button" 
            onClick={() => navigate(-1)} // Kembali ke daftar list pembicara
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}