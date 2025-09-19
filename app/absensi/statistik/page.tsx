"use client";

import { useEffect, useState, useRef } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiDownload,
  FiCalendar,
} from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function StatistikKunjungan() {
  const [scope, setScope] = useState<"global" | "tingkatan" | "kelas">(
    "global"
  );
  const [topVisitors, setTopVisitors] = useState<any[]>([]);
  const [levelStats, setLevelStats] = useState<any[]>([]);
  const [classStats, setClassStats] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"month" | "year">("month");
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // === FETCH TOP VISITORS ===
      let topVisitorsUrl = `/api/statistik/kunjungan-terbanyak?scope=${scope}`;
      if (timeRange === "month") {
        const currentMonth = new Date().toISOString().slice(0, 7);
        topVisitorsUrl += `&bulan=${currentMonth}`;
      } else {
        const currentYear = new Date().getFullYear();
        topVisitorsUrl += `&tahun=${currentYear}`;
      }

      const topVisitorsRes = await fetch(topVisitorsUrl);
      const topVisitorsData = await topVisitorsRes.json();
      setTopVisitors(
        Array.isArray(topVisitorsData) ? topVisitorsData.slice(0, 5) : []
      );

      // === FETCH STATS BERDASARKAN SCOPE ===
      switch (scope) {
        case "global":
          await fetchGlobalStats();
          break;
        case "tingkatan":
          await fetchLevelStats();
          break;
        case "kelas":
          await fetchClassStats();
          break;
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildUrl = (scope: string) => {
    let url = `/api/statistik/rata-rata-kunjungan?scope=${scope}`;
    if (timeRange === "month") {
      const currentMonth = new Date().toISOString().slice(0, 7);
      url += `&bulan=${currentMonth}`;
    } else {
      const currentYear = new Date().getFullYear();
      url += `&tahun=${currentYear}`;
    }
    return url;
  };

  const fetchGlobalStats = async () => {
    const res = await fetch(buildUrl("global"));
    const data = await res.json();
    setGlobalStats(Array.isArray(data) && data.length > 0 ? data[0] : {});
  };

  const fetchLevelStats = async () => {
    const res = await fetch(buildUrl("tingkatan"));
    const data = await res.json();
    setLevelStats(Array.isArray(data) ? data : []);
  };

  const fetchClassStats = async () => {
    const res = await fetch(buildUrl("kelas"));
    const data = await res.json();
    setClassStats(Array.isArray(data) ? data : []);
  };

  const calculatePercentage = (average: number, daysInPeriod: number) => {
    if (!average || !daysInPeriod) return "0.0";
    return ((average / daysInPeriod) * 100).toFixed(1);
  };

  const getDaysInPeriod = () => {
    const now = new Date();
    if (timeRange === "month") {
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }
    if (timeRange === "year") {
      return 365; // setahun penuh
    }
    return 30;
  };

  const downloadPDF = async () => {
    if (!pdfRef.current) return;
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `laporan-kunjungan-${scope}-${timeRange}-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const daysInPeriod = getDaysInPeriod();

  return (
    <div className="space-y-8">
      {/* Filter & Download */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-4">
          {/* Scope */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scope
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as any)}
              className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="global">Global</option>
              <option value="tingkatan">Per Tingkatan</option>
              <option value="kelas">Per Kelas</option>
            </select>
          </div>

          {/* Periode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
          </div>
        </div>

        <button
          onClick={downloadPDF}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <FiDownload className="mr-2" />
          Unduh PDF
        </button>
      </div>

      {/* Konten PDF */}
      <div ref={pdfRef} className="bg-white p-6 rounded-xl shadow-md">
        {/* Header PDF */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Laporan Statistik Kunjungan
          </h1>
          <p className="text-gray-600">
            {scope === "global"
              ? "Seluruh Sekolah"
              : scope === "tingkatan"
              ? "Per Tingkatan"
              : "Per Kelas"}
          </p>
          <div className="flex items-center justify-center mt-2 text-gray-500 text-sm">
            <FiCalendar className="mr-2" />
            <span>
              Periode: {timeRange === "month" ? "Bulan Ini" : "Tahun Ini"}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Dicetak pada: {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>

        {/* --- Statistik Umum --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Rata-rata Kehadiran */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <FiTrendingUp className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Rata-rata Kehadiran</p>
                <p className="text-xl font-bold text-amber-800">
                  {scope === "global"
                    ? `${calculatePercentage(
                        globalStats.rataRataKunjungan || 0,
                        daysInPeriod
                      )}%`
                    : "Lihat Detail"}
                </p>
              </div>
            </div>
          </div>

          {/* Total Siswa */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <FiUsers className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Total Siswa</p>
                <p className="text-xl font-bold text-blue-800">
                  {scope === "global"
                    ? globalStats.totalSiswa || "0"
                    : "Lihat Detail"}
                </p>
              </div>
            </div>
          </div>

          {/* Hari dalam periode */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <FiAward className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-700">Hari dalam Periode</p>
                <p className="text-xl font-bold text-green-800">
                  {daysInPeriod}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistik Detail */}
        {scope === "global" && globalStats && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Statistik Global
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                Rata-rata kehadiran:{" "}
                <span className="font-semibold">
                  {globalStats.rataRataKunjungan || "0"}
                </span>{" "}
                hari (
                {calculatePercentage(
                  globalStats.rataRataKunjungan || 0,
                  daysInPeriod
                )}
                %)
              </p>
              <p className="text-gray-700 mt-2">
                Total siswa:{" "}
                <span className="font-semibold">
                  {globalStats.totalSiswa || "0"}
                </span>
              </p>
            </div>
          </div>
        )}

        {scope === "tingkatan" && levelStats.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Statistik Per Tingkatan
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Tingkatan</th>
                    <th className="py-3 px-4 text-left">Jumlah Siswa</th>
                    <th className="py-3 px-4 text-left">Rata-rata Kehadiran</th>
                    <th className="py-3 px-4 text-left">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {levelStats.map((stat: any) => (
                    <tr key={stat.tingkatan}>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        Tingkat {stat.tingkatan}
                      </td>
                      <td className="py-3 px-4">{stat.totalSiswa}</td>
                      <td className="py-3 px-4">
                        {stat.rataRataKunjungan || "0"} hari
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {calculatePercentage(
                          stat.rataRataKunjungan || 0,
                          daysInPeriod
                        )}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {scope === "kelas" && classStats.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Statistik Per Kelas
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Kelas</th>
                    <th className="py-3 px-4 text-left">Jumlah Siswa</th>
                    <th className="py-3 px-4 text-left">Rata-rata Kehadiran</th>
                    <th className="py-3 px-4 text-left">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {classStats.map((stat: any) => (
                    <tr key={stat.kelas}>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        Kelas {stat.kelas}
                      </td>
                      <td className="py-3 px-4">{stat.totalSiswa}</td>
                      <td className="py-3 px-4">
                        {stat.rataRataKunjungan || "0"} hari
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {calculatePercentage(
                          stat.rataRataKunjungan || 0,
                          daysInPeriod
                        )}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Visitors */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            5 Siswa dengan Kunjungan Terbanyak
          </h2>

          {topVisitors.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Peringkat</th>
                    <th className="py-3 px-4 text-left">Nama Siswa</th>
                    <th className="py-3 px-4 text-left">Kelas</th>
                    <th className="py-3 px-4 text-left">Jumlah Kunjungan</th>
                    <th className="py-3 px-4 text-left">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topVisitors.map((student, index) => (
                    <tr key={student.id || index}>
                      <td className="py-3 px-4">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                          <span className="text-amber-700 font-medium">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {student.nama}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        Kelas {student.kelas} (Tingkat {student.tingkatan})
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {student.jumlahKunjungan}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        {calculatePercentage(
                          student.jumlahKunjungan,
                          daysInPeriod
                        )}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Tidak ada data kunjungan
            </p>
          )}
        </div>

        {/* Footer PDF */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>
            Sistem Absensi Sekolah - Dicetak pada{" "}
            {new Date().toLocaleDateString("id-ID")}
          </p>
        </div>
      </div>

      {/* Reload */}
      <div className="text-center">
        <button
          onClick={fetchStatistics}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Muat Ulang Data
        </button>
      </div>
    </div>
  );
}
