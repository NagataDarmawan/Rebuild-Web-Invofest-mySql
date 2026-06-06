import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import Button from "../../component/UI/Button";
import Input from "../../component/UI/Input";

const schema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

type FormData = z.infer<typeof schema>;

export default function CategoryEdit() {
  const { id } = useParams(); // Mengambil ID dari URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // 1. Ambil data kategori lama untuk ditampilkan di form (MENGGUNAKAN URL BACKEND VERCEL)
  useEffect(() => {
    fetch(`http://localhost:3000/categories/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat kategori");
        return res.json();
      })
      .then((data) => {
        setValue("name", data.name); // Mengisi nilai awal ke form
        setIsFetching(false);
      })
      .catch(() => {
        alert("Gagal mengambil data kategori");
        navigate("/dashboard/category");
      });
  }, [id, setValue, navigate]);

  // 2. Fungsi Update ke Backend (MENGGUNAKAN URL BACKEND VERCEL)
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await fetch(`http://localhost:3000/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memperbarui kategori");
      }

      alert("Kategori berhasil diupdate!");
      navigate("/dashboard/category"); 
    } catch (error: any) {
      setFeedback({ text: error.message || "Terjadi kesalahan", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <p className="p-10 text-center text-gray-400">Memuat data kategori...</p>;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-100 font-sans">
      <h1 className="text-2xl font-bold mb-1 text-gray-800">Edit Kategori</h1>
      <p className="text-sm text-gray-400 mb-6">Ubah nama kategori yang Anda pilih</p>
      
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

        <div className="flex gap-2 pt-2">
          {/* Perbaikan di sini: Menghapus atribut disabled */}
          <Button 
            label={isLoading ? "Menyimpan..." : "Update Kategori"} 
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