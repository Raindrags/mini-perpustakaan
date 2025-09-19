"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiDownload,
  FiCalendar,
} from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// === TYPE DEFINITIONS ===
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

export default function StatistikKunjungan() {
  const [scope, setScope] = useState<"global" | "tingkatan" | "kelas">(
    "global"
  );
  const [topVisitors, setTopVisitors] = useState<Visitor[]>([]);
  const [levelStats, setLevelStats] = useState<LevelStat[]>([]);
  const [classStats, setClassStats] = useState<ClassStat[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStat | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"month" | "year">("month");
  const pdfRef = useRef<HTMLDivElement>(null);

  // ✅ gunakan useCallback supaya tidak kena warning useEffect deps
  const fetchStatistics = useCallback(async () => {
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
      const topVisitorsData: Visitor[] = await topVisitorsRes.json();
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
  }, [scope, timeRange]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

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
    const data: GlobalStat[] = await res.json();
    setGlobalStats(Array.isArray(data) && data.length > 0 ? data[0] : null);
  };

  const fetchLevelStats = async () => {
    const res = await fetch(buildUrl("tingkatan"));
    const data: LevelStat[] = await res.json();
    setLevelStats(Array.isArray(data) ? data : []);
  };

  const fetchClassStats = async () => {
    const res = await fetch(buildUrl("kelas"));
    const data: ClassStat[] = await res.json();
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
      return 365;
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

  // ... ⬅️ sisa return JSX-mu bisa dipertahankan sama persis, cuma tipe state sekarang aman
  // karena `any` sudah diganti dengan tipe `Visitor`, `LevelStat`, `ClassStat`, `GlobalStat`.

  return (
    <div ref={pdfRef}>
      {/* taruh kembali JSX milikmu (sudah sesuai, tidak ada any lagi) */}
      {/* ... */}
    </div>
  );
}
