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
  FiRefreshCw,
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

// Fungsi helper untuk memformat angka
const formatNumber = (value: any): string => {
  if (typeof value === "number") {
    return value.toFixed(1);
  }
  if (typeof value === "string" && !isNaN(parseFloat(value))) {
    return parseFloat(value).toFixed(1);
  }
  return "0.0";
};

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

      // Set groupBy parameter based on scope
      if (scope === "kelas") {
        params.append("groupBy", "kelas");
      } else if (scope === "tingkatan") {
        params.append("groupBy", "tingkatan");
      }

      // Add time range parameters
      if (timeRange === "bulan") {
        const currentMonth = new Date().getMonth() + 1;
        params.append("bulan", currentMonth.toString());
        const currentYear = new Date().getFullYear();
        params.append("tahun", currentYear.toString());
      } else if (timeRange === "tahun") {
        const currentYear = new Date().getFullYear();
        params.append("tahun", currentYear.toString());
      } else if (timeRange === "custom") {
        // For custom range, you might need to add date inputs in your UI
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        params.append("startDate", startDate.toISOString().split("T")[0]);
        params.append("endDate", new Date().toISOString().split("T")[0]);
      }

      let apiUrl = "/api/statistik";
      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      const res = await fetch(apiUrl);

      if (!res.ok) {
        throw new Error(
          `Gagal mengambil data: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      // Process data based on scope
      if (scope === "global") {
        // If the API returns an array, take the first item
        if (Array.isArray(data) && data.length > 0) {
          setGlobalStats({
            rataRataKunjungan: data[0].rataRataKunjungan || 0,
            totalSiswa: data[0].totalSiswa || 0,
          });
        } else if (data.rataRataKunjungan !== undefined) {
          setGlobalStats({
            rataRataKunjungan: data.rataRataKunjungan,
            totalSiswa: data.totalSiswa,
          });
        } else {
          setGlobalStats({
            rataRataKunjungan: 0,
            totalSiswa: 0,
          });
        }

        // Fetch top visitors from a different endpoint
        try {
          const topRes = await fetch("/api/statistik/top-visitors");
          if (topRes.ok) {
            const topData = await topRes.json();
            setTopVisitors(topData.data || topData || []);
          }
        } catch (err) {
          console.error("Error fetching top visitors:", err);
          setTopVisitors([]);
        }
      } else if (scope === "tingkatan") {
        setLevelStats(Array.isArray(data) ? data : []);
      } else if (scope === "kelas") {
        setClassStats(Array.isArray(data) ? data : []);
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
    if (max === 0) return "bg-gray-300";
    const percentage = (count / max) * 100;
    if (percentage > 80) return "bg-green-500";
    if (percentage > 50) return "bg-blue-500";
    if (percentage > 30) return "bg-amber-500";
    return "bg-rose-500";
  };

  // Hitung maksimum kunjungan untuk skala grafik
  const maxKunjungan =
    topVisitors.length > 0
      ? Math.max(...topVisitors.map((v) => v.jumlahKunjungan || 0))
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
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
        >
          <div className="flex justify-between items-center">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchStatistics}
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
            >
              <FiRefreshCw className="mr-2" />
              Coba Lagi
            </button>
          </div>
          <p className="mt-2 text-sm">
            Pastikan server API sedang berjalan dan endpoint /api/statistik
            tersedia.
          </p>
        </motion.div>
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
                    {formatNumber(globalStats.rataRataKunjungan)}
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
                        key={visitor.id || index}
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
                              {visitor.nama || "Nama tidak tersedia"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {visitor.kelas} - {visitor.tingkatan}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            {visitor.jumlahKunjungan || 0} kunjungan
                          </p>
                          <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                            <div
                              className={`h-full rounded-full ${getBarColor(
                                visitor.jumlahKunjungan || 0,
                                maxKunjungan
                              )}`}
                              style={{
                                width: `${
                                  ((visitor.jumlahKunjungan || 0) /
                                    maxKunjungan) *
                                  100
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
                          {formatNumber(stat.rataRataKunjungan)}
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
                                {formatNumber(stat.rataRataKunjungan)}
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
