"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiEdit,
  FiBarChart2,
  FiCreditCard,
  FiHome,
  FiBook,
  FiUser,
  FiSave,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Beranda", icon: <FiHome size={20} /> },
    { href: "/absensi/manual", label: "Manual", icon: <FiEdit size={20} /> },
    {
      href: "/absensi/scanner",
      label: "Scan",
      icon: <FiCreditCard size={20} />,
    },
    {
      href: "/absensi/statistik",
      label: "Statistik",
      icon: <FiBarChart2 size={20} />,
    },
  ];

  return (
    <html lang="id">
      <head>
        <style jsx global>{`
          .textured-nav {
            background: linear-gradient(
                rgba(90, 60, 40, 0.85),
                rgba(90, 60, 40, 0.85)
              ),
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%235a3c28' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
            color: #f5e8d3;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .textured-footer {
            background: linear-gradient(
                rgba(70, 50, 35, 0.9),
                rgba(70, 50, 35, 0.9)
              ),
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23463223' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
            color: #e8d9c0;
          }

          .textured-bg {
            background-color: #f8f3e9;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d7c9ad' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
          }

          .wood-button {
            background: linear-gradient(to bottom, #8b5a2b, #6d4c2c);
            border: 1px solid #5d3c1f;
            color: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -4px 8px rgba(0, 0, 0, 0.2);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
          }

          .wood-button:hover {
            background: linear-gradient(to bottom, #9c6b3c, #7e5d3d);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              inset 0 -4px 8px rgba(0, 0, 0, 0.3);
          }

          .wood-button:active {
            background: linear-gradient(to bottom, #7a4c20, #5c3e23);
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4),
              inset 0 -1px 2px rgba(255, 255, 255, 0.2);
          }
        `}</style>
      </head>
      <body className="textured-bg min-h-screen flex flex-col overflow-x-hidden">
        {/* HEADER (desktop only) */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="textured-nav hidden md:block sticky top-0 z-10"
        >
          <div className="container mx-auto flex justify-between items-center p-4">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="text-xl font-bold tracking-wide flex items-center gap-2"
            >
              <span className="bg-amber-100 text-amber-900 p-2 rounded-lg">
                📚
              </span>
              <span className="text-amber-100">Cheerful Library</span>
            </motion.h1>
            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1 p-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-amber-600 text-amber-100 shadow-md font-semibold"
                        : "hover:bg-amber-700 hover:text-amber-50"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-1">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.header>

        {/* MAIN CONTENT WITH SLIDE ANIMATION */}
        <main className="container mx-auto flex-1 p-4 md:p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* FOOTER (desktop only) */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="textured-footer text-center p-4 text-sm hidden md:block"
        >
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <p>Cheerful Library Maitreyawira © 2025 - All rights reserved</p>
            <div className="flex gap-4 mt-2 md:mt-0">
              <a
                href="#"
                className="text-amber-200 hover:text-amber-100 transition"
              >
                Kebijakan Privasi
              </a>
              <a
                href="#"
                className="text-amber-200 hover:text-amber-100 transition"
              >
                Syarat & Ketentuan
              </a>
              <a
                href="#"
                className="text-amber-200 hover:text-amber-100 transition"
              >
                Bantuan
              </a>
            </div>
          </div>
        </motion.footer>

        {/* BOTTOM NAV (mobile only) */}
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 textured-nav shadow-lg flex justify-around p-2 md:hidden z-10"
        >
          {navItems.slice(0, 4).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  active
                    ? "text-amber-200 bg-amber-700 bg-opacity-30"
                    : "text-amber-100"
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </motion.nav>
      </body>
    </html>
  );
}
