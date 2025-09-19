"use client";

import { FiBookOpen, FiUserCheck, FiSquare } from "react-icons/fi";
import Link from "next/link";

import { useState } from "react";

function TataCaraAbsensi() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Manual Attendance Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="bg-amber-100 p-3 rounded-full mr-4">
            <FiUserCheck className="text-amber-600 text-xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Absensi Manual
          </h2>
        </div>
        <p className="text-gray-600 mb-4">
          Input kehadiran siswa secara manual dengan mencari nama atau kelas
          siswa.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
          <li>Buka halaman absensi manual</li>
          <li>Cari siswa berdasarkan nama atau kelas</li>
          <li>Klik tambahkan untuk memilih siswa</li>
          <li>Simpan data absensi ketika selesai</li>
        </ol>
        <Link
          href="/absensi/manual"
          className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
        >
          Buka Absensi Manual
        </Link>
      </div>

      {/* Scanner Attendance Card */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <FiSquare className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Absensi Scanner
          </h2>
        </div>
        <p className="text-gray-600 mb-4">
          Gunakan scanner QR code untuk mencatat kehadiran siswa dengan cepat.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
          <li>Buka halaman absensi scanner</li>
          <li>Hubungkan scanner eksternal ke perangkat</li>
          <li>Scan kartu ID siswa menggunakan scanner</li>
          <li>Absensi akan tercatat secara otomatis</li>
        </ol>
        <Link
          href="/absensi/scanner"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:blue-amber-600 transition"
        >
          Buka Absensi Scanner
        </Link>
      </div>

      {/* Additional Info */}
      <div className="md:col-span-2 bg-amber-50 rounded-xl p-6 mt-4">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          Informasi Penting
        </h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Pastikan data siswa sudah terdaftar sebelum melakukan absensi</li>
          <li>
            Absensi hanya dapat dilakukan sekali per hari untuk setiap siswa
          </li>
          <li>Waktu absensi dicatat secara otomatis oleh sistem</li>
          <li>Laporan absensi dapat diakses melalui halaman statistik</li>
        </ul>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("instructions");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Sistem Absensi Sekolah
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola kehadiran siswa dengan mudah dan efisien
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`flex items-center px-4 py-3 font-medium ${
              activeTab === "instructions"
                ? "text-amber-600 border-b-2 border-amber-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("instructions")}
          >
            <FiBookOpen className="mr-2" />
            Tata Cara Absensi
          </button>
          <button
            className={`flex items-center px-4 py-3 font-medium ${
              activeTab === "statistics"
                ? "text-amber-600 border-b-2 border-amber-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("statistics")}
          ></button>
        </div>

        {/* Tab Content */}
        <TataCaraAbsensi />
      </main>
    </div>
  );
}
