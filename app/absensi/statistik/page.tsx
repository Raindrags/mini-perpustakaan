"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiGlobe,
  FiBook,
  FiFilter,
  FiLoader,
} from "react-icons/fi";
import { motion } from "framer-motion";

interface Visitor {
  id: string;
  nama: string;
  kelas: string;
  tingkatan: string;
  jumlahKunjungan: number;
}

interface LevelStat {
  tingkatan: string;
  rataRataKunjungan: number;
  totalSiswa: number;
}

interface ClassStat {
  kelas: string;
  rataRataKunjungan: number;
  totalSiswa: number;
}

interface GlobalStat {
  rataRataKunjungan: number;
  totalSiswa: number;
}

interface ApiResponse {
  globalStats?: GlobalStat;
  topVisitors?: Visitor[];
  levelStats?: LevelStat[];
  classStats?: ClassStat[];
}

export default function StatistikPage() {
  const [topVisitors, setTopVisitors] = useState<Visitor[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStat[]>([]);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scope, setScope] = useState<"global" | "kelas" | "tingkatan">(
    "global"
  );
  const [timeRange, setTimeRange] = useState<
    "bulan" | "tahun" | "custom" | "all"
  >("all");

  const fetchStatistics = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query parameters based on scope and timeRange
      const params = new URLSearchParams();
      params.append("scope", scope);

      if (timeRange === "bulan") {
        const currentMonth = new Date().getMonth() + 1;
        params.append("bulan", currentMonth.toString());
      } else if (timeRange === "tahun") {
        const currentYear = new Date().getFullYear();
        params.append("tahun", currentYear.toString());
      }

      // Set groupBy parameter based on scope
      if (scope === "kelas") {
        params.append("groupBy", "kelas");
      } else if (scope === "tingkatan") {
        params.append("groupBy", "tingkatan");
      }

      const res = await fetch(`/api/statistik?${params.toString()}`);

      if (!res.ok) {
        throw new Error(
          `Gagal mengambil data: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      // Process data based on scope
      if (scope === "global") {
        setGlobalStats(
          data.globalStats || {
            rataRataKunjungan: data.rataRataKunjungan || 0,
            totalSiswa: data.totalSiswa || 0,
          }
        );

        // Fetch top visitors separately if not included in response
        if (!data.topVisitors) {
          try {
            const topRes = await fetch("/api/statistik/most-recent-visited");
            if (topRes.ok) {
              const topData = await topRes.json();
              setTopVisitors(topData.data || []);
            }
          } catch (err) {
            console.error("Error fetching top visitors:", err);
          }
        } else {
          setTopVisitors(data.topVisitors);
        }
      } else if (scope === "tingkatan") {
        setLevelStats(data.levelStats || data);
      } else if (scope === "kelas") {
        setClassStats(data.classStats || data);
      }
    } catch (error: unknown) {
      console.error("Error fetching statistics:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak diketahui"
      );
    } finally {
      setIsLoading(false);
    }
  }, [scope, timeRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Fungsi untuk menentukan warna berdasarkan jumlah kunjungan
  const getBarColor = (count: number, max: number) => {
    const percentage = (count / max) * 100;
    if (percentage > 80) return "bg-green-500";
    if (percentage > 50) return "bg-blue-500";
    if (percentage > 30) return "bg-amber-500";
    return "bg-rose-500";
  };

  // Hitung maksimum kunjungan untuk skala grafik
  const maxKunjungan =
    topVisitors.length > 0
      ? Math.max(...topVisitors.map((v) => v.jumlahKunjungan))
      : 1;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <FiBarChart2 size={24} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Statistik Kunjungan Perpustakaan
        </h1>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6"
      >
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <FiFilter size={18} />
          <h2 className="font-semibold">Filter Data</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tampilkan Berdasarkan
            </label>
            <select
              value={scope}
              onChange={(e) =>
                setScope(e.target.value as "global" | "kelas" | "tingkatan")
              }
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
            >
              <option value="global">Statistik Global</option>
              <option value="tingkatan">Berdasarkan Tingkatan</option>
              <option value="kelas">Berdasarkan Kelas</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rentang Waktu
            </label>
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(
                  e.target.value as "bulan" | "tahun" | "custom" | "all"
                )
              }
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
            >
              <option value="all">Semua Waktu</option>
              <option value="bulan">Bulan Ini</option>
              <option value="tahun">Tahun Ini</option>
              <option value="custom">Rentang Kustom</option>
            </select>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md">
          <FiLoader className="animate-spin text-blue-500 text-4xl mb-4" />
          <p className="text-gray-600">Memuat data statistik...</p>
        </div>
      ) : (
        <>
          {/* Statistik Global */}
          {scope === "global" && globalStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <FiUsers size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Total Siswa
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {globalStats.totalSiswa}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Jumlah siswa terdaftar
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <FiTrendingUp size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Rata-rata Kunjungan
                    </h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {globalStats.rataRataKunjungan.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Kunjungan per siswa
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <FiAward size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pengunjung Teraktif
                  </h3>
                </div>

                {topVisitors.length > 0 ? (
                  <div className="space-y-4">
                    {topVisitors.map((visitor, index) => (
                      <motion.div
                        key={visitor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-semibold rounded-full">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {visitor.nama}
                            </p>
                            <p className="text-sm text-gray-500">
                              {visitor.kelas} - {visitor.tingkatan}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {visitor.jumlahKunjungan} kunjungan
                          </p>
                          <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                            <div
                              className={`h-full rounded-full ${getBarColor(
                                visitor.jumlahKunjungan,
                                maxKunjungan
                              )}`}
                              style={{
                                width: `${
                                  (visitor.jumlahKunjungan / maxKunjungan) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Tidak ada data pengunjung
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Statistik per Tingkatan */}
          {scope === "tingkatan" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <FiBook size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Statistik per Tingkatan
                </h2>
              </div>

              {levelStats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {levelStats.map((stat, index) => (
                    <motion.div
                      key={stat.tingkatan || index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {stat.tingkatan || "Tidak Diketahui"}
                      </h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Rata-rata</span>
                        <span className="font-bold text-blue-600">
                          {stat.rataRataKunjungan?.toFixed(1) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Total Siswa
                        </span>
                        <span className="font-bold text-green-600">
                          {stat.totalSiswa || 0}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada data tingkatan
                </p>
              )}
            </motion.div>
          )}

          {/* Statistik per Kelas */}
          {scope === "kelas" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <FiGlobe size={20} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Statistik per Kelas
                </h2>
              </div>

              {classStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Kelas
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Rata-rata Kunjungan
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Total Siswa
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStats.map((stat, index) => (
                        <motion.tr
                          key={stat.kelas || index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-medium">
                            {stat.kelas || "Tidak Diketahui"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span>
                                {stat.rataRataKunjungan?.toFixed(1) || 0}
                              </span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{
                                    width: `${Math.min(
                                      (stat.rataRataKunjungan || 0) * 10,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{stat.totalSiswa || 0}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada data kelas
                </p>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
