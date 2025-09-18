// db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const anak = pgTable("anak", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 100 }).notNull(),
  kelas: varchar("kelas", { length: 10 }).notNull(),
  tingkatan: integer("tingkatan").notNull(),
  kartuId: varchar("kartu_id", { length: 50 }).notNull().unique(),
});

export const absensi = pgTable(
  "absensi",
  {
    id: serial("id").primaryKey(),
    anakId: integer("anak_id")
      .references(() => anak.id)
      .notNull(),
    tanggal: varchar("tanggal", { length: 10 }).notNull(), // YYYY-MM-DD
    waktu: varchar("waktu", { length: 8 }).notNull(), // HH:MM
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueAbsensi: uniqueIndex("unique_absensi").on(
      table.anakId,
      table.tanggal
    ),
  })
);
