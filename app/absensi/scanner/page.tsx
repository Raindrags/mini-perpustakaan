"use client";

import { useState, useRef, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiPlus } from "react-icons/fi";

export default function AbsensiScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus ke input ketika halaman dimuat
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (barcode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulasi pengiriman data ke API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Di sini Anda akan mengirim data ke API sesungguhnya
      console.log("Data barcode yang discan:", barcode);

      setScanResult(barcode);
    } catch (error) {
      setError("Gagal menyimpan absensi");
      console.error("Error scanning barcode:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const barcode = event.currentTarget.value.trim();
      if (barcode) {
        handleScan(barcode);
        event.currentTarget.value = "";
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Absensi Scanner
      </h2>

      <div className="mb-6">
        <label
          htmlFor="barcode"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Scan Kartu Siswa
        </label>
        <input
          ref={inputRef}
          type="text"
          id="barcode"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tempatkan kursor di sini dan scan kartu"
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500 mt-2">
          Letakkan kursor di input box dan gunakan scanner eksternal untuk
          memindai kartu siswa.
        </p>
      </div>

      {/* Manual Input Form */}
      <div className="mb-6">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Atau masukkan ID manual"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !manualInput.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <FiPlus className="text-xl" />
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-blue-700">Memproses absensi...</p>
        </div>
      )}

      {scanResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <FiCheckCircle className="text-green-500 text-2xl mr-2" />
            <span className="text-green-800 font-medium">
              Absensi Berhasil!
            </span>
          </div>
          <p className="text-center text-gray-700">Kartu: {scanResult}</p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Absensi telah tercatat pada {new Date().toLocaleString("id-ID")}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <FiXCircle className="text-red-500 text-2xl mr-2" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-center text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">
          Petunjuk Penggunaan:
        </h3>
        <ol className="list-decimal list-inside text-sm text-amber-700 space-y-1">
          <li>Pastikan scanner eksternal terhubung ke perangkat</li>
          <li>Klik pada input box di atas</li>
          <li>Scan kartu siswa menggunakan scanner eksternal</li>
          <li>Atau masukkan ID siswa secara manual</li>
          <li>Tunggu hingga notifikasi absensi berhasil muncul</li>
        </ol>
      </div>
    </div>
  );
}
