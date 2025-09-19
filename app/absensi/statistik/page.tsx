"use client";

import { useState, useEffect, useCallback } from "react";

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

export default function StatistikPage() {
  const [topVisitors, setTopVisitors] = useState<Visitor[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStat[]>([]);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStat | null>(null);

  const [scope, setScope] = useState<"global" | "kelas" | "tingkatan">(
    "global"
  );
  const [timeRange, setTimeRange] = useState<
    "bulan" | "tahun" | "custom" | "all"
  >("all");

  // ✅ fetchStatistics aman dari warning useEffect
  const fetchStatistics = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/statistik?scope=${scope}&timeRange=${timeRange}`
      );
      if (!res.ok) throw new Error("Gagal mengambil data");

      const data = await res.json();

      if (scope === "global") {
        setGlobalStats(data.globalStats ?? null);
        setTopVisitors(data.topVisitors ?? []);
      } else if (scope === "tingkatan") {
        setLevelStats(data.levelStats ?? []);
      } else if (scope === "kelas") {
        setClassStats(data.classStats ?? []);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, [scope, timeRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📊 Statistik Kunjungan</h1>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <select
          value={scope}
          onChange={(e) =>
            setScope(e.target.value as "global" | "kelas" | "tingkatan")
          }
          className="border p-2 rounded"
        >
          <option value="global">Global</option>
          <option value="tingkatan">Tingkatan</option>
          <option value="kelas">Kelas</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) =>
            setTimeRange(e.target.value as "bulan" | "tahun" | "custom" | "all")
          }
          className="border p-2 rounded"
        >
          <option value="all">Semua Waktu</option>
          <option value="bulan">Per Bulan</option>
          <option value="tahun">Per Tahun</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Statistik Global */}
      {scope === "global" && globalStats && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">🌍 Global Stats</h2>
          <p>Rata-rata kunjungan: {globalStats.rataRataKunjungan}</p>
          <p>Total siswa: {globalStats.totalSiswa}</p>

          <h3 className="mt-4 font-semibold">👥 Top Visitors</h3>
          <ul className="list-disc list-inside">
            {topVisitors.map((visitor: Visitor) => (
              <li key={visitor.id}>
                {visitor.nama} ({visitor.kelas} - {visitor.tingkatan}) —{" "}
                {visitor.jumlahKunjungan}x
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistik per Tingkatan */}
      {scope === "tingkatan" && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            📚 Statistik per Tingkatan
          </h2>
          <ul className="list-disc list-inside">
            {levelStats.map((stat: LevelStat) => (
              <li key={stat.tingkatan}>
                {stat.tingkatan} — rata-rata {stat.rataRataKunjungan} kunjungan,{" "}
                total {stat.totalSiswa} siswa
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Statistik per Kelas */}
      {scope === "kelas" && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">🏫 Statistik per Kelas</h2>
          <ul className="list-disc list-inside">
            {classStats.map((stat: ClassStat) => (
              <li key={stat.kelas}>
                {stat.kelas} — rata-rata {stat.rataRataKunjungan} kunjungan,
                total {stat.totalSiswa} siswa
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
