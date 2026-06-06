import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom"; // Impor useNavigate
import Button from "../../component/UI/Button";
import Input from "../../component/UI/Input";

const schema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

type FormData = z.infer<typeof schema>;

export default function CategoryCreate() {
  const navigate = useNavigate(); // Inisialisasi hook navigate
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      // MENGUBAH URL KE BACKEND VERCEL YANG ONLINE
      const response = await fetch("http://localhost:3000/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server tidak merespons dengan benar. Pastikan backend aktif.");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan kategori");
      }

      setFeedback({ text: "Kategori berhasil ditambahkan!", isError: false });
      reset(); 
    } catch (error: any) {
      let errorMessage = "Terjadi kesalahan koneksi";
      
      if (error instanceof Error) {
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
      <h1 className="text-2xl font-bold mb-1 text-gray-800">Tambah Kategori</h1>
      <p className="text-sm text-gray-400 mb-6">Masukkan nama kategori baru untuk event</p>
      
      {feedback && (
        <div className={`p-4 mb-4 rounded-lg text-sm font-medium ${feedback.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nama Kategori"
          name="name"
          register={register}
          error={errors.name?.message}
        />

        {/* Pembungkus aksi tombol agar sejajar ke samping */}
        <div className="flex gap-2 pt-2">
          {/* Perbaikan di sini: Menghapus properti disabled agar lolos build TypeScript Vercel */}
          <Button 
            label={isLoading ? "Menyimpan..." : "Simpan Kategori"} 
          />
          <button 
            type="button" 
            onClick={() => navigate(-1)} // Fungsi kembali ke halaman sebelumnya
            className="px-5 py-2.5 border border-gray-200 text-sm font-semibold rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}