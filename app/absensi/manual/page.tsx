"use client";

import { useEffect, useState } from "react";
import {
  FiSearch,
  FiX,
  FiUserPlus,
  FiSave,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type Anak = {
  id: number;
  nama: string;
  kelas: string;
  tingkatan: number;
};

export default function AbsensiManualPage() {
  const [anakList, setAnakList] = useState<Anak[]>([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Anak[]>([]);
  const [selected, setSelected] = useState<Anak[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnak() {
      try {
        const res = await fetch("/api/anak");
        if (!res.ok) throw new Error("Gagal mengambil data anak");
        const data = await res.json();
        setAnakList(data);
      } catch (err) {
        setError("Gagal memuat data anak");
        console.error("Error fetching anak:", err);
      }
    }
    fetchAnak();
  }, []);

  // filter berdasarkan search
  useEffect(() => {
    if (search.trim() === "") {
      setFiltered([]);
    } else {
      const keyword = search.toLowerCase();
      setFiltered(
        anakList.filter(
          (anak) =>
            anak.nama.toLowerCase().includes(keyword) ||
            anak.kelas.toLowerCase().includes(keyword) ||
            anak.tingkatan.toString().includes(keyword)
        )
      );
    }
  }, [search, anakList]);

  // tambah murid
  const handleAdd = (anak: Anak) => {
    if (!selected.some((s) => s.id === anak.id)) {
      setSelected([...selected, anak]);
    }
    setSearch("");
    setFiltered([]);
  };

  const handleRemove = (id: number) => {
    setSelected(selected.filter((a) => a.id !== id));
  };

  // Fungsi untuk menyimpan absensi
  const handleSave = async () => {
    if (selected.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      // Kirim data ke API absensi
      const response = await fetch("/api/absensi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selected.map((anak) => ({ id: anak.id }))),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Konflik - beberapa anak sudah absen hari ini
          throw new Error(data.message || "Beberapa anak sudah absen hari ini");
        } else {
          throw new Error(data.message || "Gagal menyimpan absensi");
        }
      }

      // Tampilkan notifikasi berhasil
      setIsSaved(true);

      // Reset state setelah beberapa detik
      setTimeout(() => {
        setIsSaved(false);
        setSelected([]);
      }, 2000);
    } catch (error) {
      console.error("Gagal menyimpan absensi:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Absensi Manual</h2>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
        >
          <FiUserPlus className="mr-1" /> {selected.length} Murid
        </motion.div>
      </div>

      {/* Search Box */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari nama, kelas, atau tingkatan..."
          className="w-full pl-10 text-gray-800 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Suggestion */}
      <AnimatePresence>
        {filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border border-gray-200 rounded-lg bg-white shadow-sm max-h-60 overflow-y-auto mb-6 divide-y divide-gray-100"
          >
            {filtered.map((anak) => (
              <motion.li
                key={anak.id}
                onClick={() => handleAdd(anak)}
                whileHover={{ backgroundColor: "#fef6e6" }}
                className="p-3 cursor-pointer transition flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">{anak.nama}</p>
                  <p className="text-sm text-gray-500">
                    Kelas {anak.kelas} (Tingkat {anak.tingkatan})
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                  Tambah
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Tabel hadir */}
      <div className="rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="bg-amber-50 px-4 py-3 border-b border-amber-200">
          <h3 className="text-lg font-semibold text-amber-800">Daftar Hadir</h3>
        </div>

        <AnimatePresence>
          {selected.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="divide-y divide-amber-100"
            >
              {selected.map((anak) => (
                <motion.div
                  key={anak.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 hover:bg-amber-50"
                >
                  <div>
                    <p className="font-medium text-gray-800">{anak.nama}</p>
                    <p className="text-sm text-gray-500">
                      Kelas {anak.kelas} (Tingkat {anak.tingkatan})
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRemove(anak.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                    aria-label="Hapus"
                  >
                    <FiTrash2 />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 text-gray-500"
            >
              <FiUserPlus className="mx-auto text-3xl mb-2 opacity-50" />
              <p>Belum ada murid ditambahkan</p>
              <p className="text-sm mt-1">
                Gunakan kotak pencarian di atas untuk menambahkan murid
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center"
          >
            <FiAlertCircle className="mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tombol Simpan */}
      <AnimatePresence>
        {isSaved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center bg-green-100 text-green-700"
          >
            <FiCheckCircle className="mr-2" />
            Absensi Berhasil Disimpan!
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: selected.length === 0 ? 1 : 1.02 }}
            whileTap={{ scale: selected.length === 0 ? 1 : 0.98 }}
            onClick={handleSave}
            disabled={selected.length === 0 || isSaving}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition ${
              selected.length === 0 || isSaving
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            }`}
          >
            {isSaving ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <FiSave />
                </motion.span>
                Menyimpan...
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                Simpan Absensi ({selected.length})
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
