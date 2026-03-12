"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiBarChart2,
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

const formatNumber = (value: number | string | null | undefined): string => {
  if (typeof value === "number") return value.toFixed(1);
  if (typeof value === "string") {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) return numericValue.toFixed(1);
  }
  return "0.0";
};

// Buat default tanggal untuk custom range (7 hari terakhir)
const defaultEndDate = new Date().toISOString().split("T")[0];
const defaultStartDateObj = new Date();
defaultStartDateObj.setDate(defaultStartDateObj.getDate() - 7);
const defaultStartDate = defaultStartDateObj.toISOString().split("T")[0];

export default function StatistikPage() {
  const [topVisitors, setTopVisitors] = useState<Visitor[]>([]);
  const [groupedTopVisitors, setGroupedTopVisitors] = useState<Record<string, Visitor[]>>({});
  const [levelStats, setLevelStats] = useState<LevelStat[]>([]);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scope, setScope] = useState<"global" | "kelas" | "tingkatan">("global");
  const [timeRange, setTimeRange] = useState<"bulan" | "tahun" | "semester1" | "semester2" | "custom" | "all">("all");
  
  // State untuk tanggal kustom
  const [customStartDate, setCustomStartDate] = useState<string>(defaultStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(defaultEndDate);

  const fetchStatistics = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const currentYear = new Date().getFullYear();

      // Filter Grouping
      if (scope === "kelas") params.append("groupBy", "kelas");
      else if (scope === "tingkatan") params.append("groupBy", "tingkatan");

      // Filter Waktu
      if (timeRange === "bulan") {
        const currentMonth = new Date().getMonth() + 1;
        params.append("bulan", currentMonth.toString());
        params.append("tahun", currentYear.toString());
      } else if (timeRange === "tahun") {
        params.append("tahun", currentYear.toString());
      } else if (timeRange === "semester1") {
        // Semester 1: 1 Juli - 31 Desember
        params.append("startDate", `${currentYear - 1}-07-01`);
        params.append("endDate", `${currentYear - 1}-12-31`);
      } else if (timeRange === "semester2") {
        // Semester 2: 1 Januari - 30 Juni
        params.append("startDate", `${currentYear}-01-01`);
        params.append("endDate", `${currentYear}-06-30`);
      } else if (timeRange === "custom") {
        // Rentang Kustom (Custom Range)
        if (customStartDate && customEndDate) {
          params.append("startDate", customStartDate);
          params.append("endDate", customEndDate);
        }
      }

      // 1. Fetch Statistik Utama
      let apiUrl = "/api/statistik";
      if (params.toString()) apiUrl += `?${params.toString()}`;

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Gagal mengambil data: ${res.status}`);
      const data = await res.json();

      if (scope === "global") {
        if (Array.isArray(data) && data.length > 0) {
          setGlobalStats({ rataRataKunjungan: data[0].rataRataKunjungan || 0, totalSiswa: data[0].totalSiswa || 0 });
        } else if (data && data.rataRataKunjungan !== undefined) {
          setGlobalStats({ rataRataKunjungan: data.rataRataKunjungan, totalSiswa: data.totalSiswa });
        } else {
          setGlobalStats({ rataRataKunjungan: 0, totalSiswa: 0 });
        }
      } else if (scope === "tingkatan") {
        setLevelStats(Array.isArray(data) ? data : []);
      } else if (scope === "kelas") {
        setClassStats(Array.isArray(data) ? data : []);
      }

      // 2. Fetch Top Visitors
      try {
        let topApiUrl = "/api/top-visitors";
        if (params.toString()) topApiUrl += `?${params.toString()}`;
        
        const topRes = await fetch(topApiUrl);
        if (topRes.ok) {
          const topData = await topRes.json();
          
          if (scope === "global") {
            setTopVisitors(topData.data || []);
            setGroupedTopVisitors({});
          } else {
            setGroupedTopVisitors(topData.groupedData || {});
            setTopVisitors([]);
          }
        }
      } catch (err) {
        console.error("Error fetching top visitors:", err);
      }

    } catch (error: unknown) {
      console.error("Error fetching statistics:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui");
    } finally {
      setIsLoading(false);
    }
  }, [scope, timeRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FiBarChart2 size={24} /></div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Statistik Kunjungan Perpustakaan</h1>
      </motion.div>

      {/* Filter Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <FiFilter size={18} />
          <h2 className="font-semibold">Filter Data</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tampilkan Berdasarkan</label>
            <select value={scope} onChange={(e) => setScope(e.target.value as "global" | "kelas" | "tingkatan")} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
              <option value="global">Statistik Global</option>
              <option value="tingkatan">Berdasarkan Tingkatan</option>
              <option value="kelas">Berdasarkan Kelas</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rentang Waktu</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
              <option value="all">Semua Waktu</option>
              <option value="bulan">Bulan Ini</option>
              <option value="tahun">Tahun Ini</option>
              <option value="semester1">Semester 1 (Juli - Des)</option>
              <option value="semester2">Semester 2 (Jan - Jun)</option>
              <option value="custom">Rentang Kustom</option>
            </select>
          </div>
        </div>

        {/* Input Rentang Tanggal Kustom (Muncul jika timeRange === "custom") */}
        {timeRange === "custom" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
              <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
              <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <p className="font-medium">{error}</p>
          <button onClick={fetchStatistics} className="ml-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center">
            <FiRefreshCw className="mr-2" /> Coba Lagi
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md">
          <FiLoader className="animate-spin text-blue-500 text-4xl mb-4" />
          <p className="text-gray-600">Memuat data statistik...</p>
        </div>
      ) : (
        <>
          {/* ================= STATISTIK GLOBAL ================= */}
          {scope === "global" && globalStats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiUsers size={20} /></div>
                    <h3 className="text-lg font-semibold text-gray-800">Total Siswa</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{globalStats.totalSiswa}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FiTrendingUp size={20} /></div>
                    <h3 className="text-lg font-semibold text-gray-800">Rata-rata Kunjungan</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{formatNumber(globalStats.rataRataKunjungan)}</p>
                </div>
              </div>

              {/* Tabel Top 3 Global */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FiAward size={20} /></div>
                  <h3 className="text-lg font-semibold text-gray-800">3 Pengunjung Teraktif Global</h3>
                </div>
                {topVisitors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-y border-gray-200">
                          <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Peringkat</th>
                          <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Nama Pengunjung</th>
                          <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Kelas</th>
                          <th className="py-3 px-4 font-semibold text-gray-700 text-sm">Jumlah Kunjungan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {topVisitors.map((v, i) => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-blue-600">#{i + 1}</td>
                            <td className="py-3 px-4 text-gray-800 font-medium">{v.nama || "-"}</td>
                            <td className="py-3 px-4 text-gray-600">{v.kelas || "-"}</td>
                            <td className="py-3 px-4 font-bold text-green-600">{v.jumlahKunjungan}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada data pengunjung</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= STATISTIK TINGKATAN ================= */}
          {scope === "tingkatan" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><FiBook size={20} /></div>
                  <h2 className="text-xl font-semibold text-gray-800">Statistik per Tingkatan</h2>
                </div>
                {levelStats.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelStats.map((stat, index) => (
                      <motion.div key={stat.tingkatan || index} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <h3 className="font-semibold text-gray-800 mb-2">{stat.tingkatan || "Tidak Diketahui"}</h3>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Rata-rata</span>
                          <span className="font-bold text-blue-600">{formatNumber(stat.rataRataKunjungan)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Siswa</span>
                          <span className="font-bold text-green-600">{stat.totalSiswa || 0}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada data tingkatan</p>
                )}
              </div>

              {/* Tabel Top 3 PER TINGKATAN */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FiAward size={20} /></div>
                  <h3 className="text-lg font-semibold text-gray-800">3 Pengunjung Teraktif per Tingkatan</h3>
                </div>

                {Object.keys(groupedTopVisitors).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedTopVisitors).map(([tingkatan, visitors]) => (
                      <div key={tingkatan} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200 font-semibold text-indigo-800">
                          Tingkatan: {tingkatan}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white border-b border-gray-200">
                                <th className="py-2 px-4 font-semibold text-gray-600 text-sm w-24">Peringkat</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-sm">Nama Pengunjung</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-sm">Nama Kelas</th>
                                <th className="py-2 px-4 font-semibold text-gray-600 text-sm text-right">Jumlah Kunjungan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {visitors.map((v, i) => (
                                <tr key={v.id} className="hover:bg-gray-50">
                                  <td className="py-2 px-4 font-medium text-blue-600">#{i + 1}</td>
                                  <td className="py-2 px-4 text-gray-800 font-medium">{v.nama || "-"}</td>
                                  <td className="py-2 px-4 text-gray-600">{v.kelas || "-"}</td>
                                  <td className="py-2 px-4 font-bold text-green-600 text-right">{v.jumlahKunjungan}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada data pengunjung</p>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= STATISTIK KELAS ================= */}
          {scope === "kelas" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">

              {/* Tabel Top 3 PER KELAS */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FiAward size={20} /></div>
                  <h3 className="text-lg font-semibold text-gray-800">3 Pengunjung Teraktif per Kelas</h3>
                </div>

                {Object.keys(groupedTopVisitors).length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(groupedTopVisitors).map(([kelas, visitors]) => (
                      <div key={kelas} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-purple-50 px-4 py-3 border-b border-gray-200 font-semibold text-purple-800 flex justify-between items-center">
                          <span>Kelas: {kelas}</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-white border-b border-gray-200">
                                <th className="py-2 px-3 font-semibold text-gray-600 text-xs w-16">Rank</th>
                                <th className="py-2 px-3 font-semibold text-gray-600 text-xs">Nama Pengunjung</th>
                                <th className="py-2 px-3 font-semibold text-gray-600 text-xs text-right">Kunjungan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {visitors.map((v, i) => (
                                <tr key={v.id} className="hover:bg-gray-50">
                                  <td className="py-2 px-3 font-medium text-blue-600 text-sm">#{i + 1}</td>
                                  <td className="py-2 px-3 text-gray-800 font-medium text-sm">{v.nama || "-"}</td>
                                  <td className="py-2 px-3 font-bold text-green-600 text-right text-sm">{v.jumlahKunjungan}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 w-full">Tidak ada data pengunjung</p>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}