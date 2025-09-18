CREATE TABLE "absensi" (
	"id" serial PRIMARY KEY NOT NULL,
	"anak_id" integer NOT NULL,
	"tanggal" varchar(10) NOT NULL,
	"waktu" varchar(8) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "anak" (
	"id" serial PRIMARY KEY NOT NULL,
	"nama" varchar(100) NOT NULL,
	"kelas" varchar(10) NOT NULL,
	"tingkatan" integer NOT NULL,
	"kartu_id" varchar(50) NOT NULL,
	CONSTRAINT "anak_kartu_id_unique" UNIQUE("kartu_id")
);
--> statement-breakpoint
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_anak_id_anak_id_fk" FOREIGN KEY ("anak_id") REFERENCES "public"."anak"("id") ON DELETE no action ON UPDATE no action;