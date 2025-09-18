import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Admin, initializeDatabase } from "@/lib/sequelize";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    // Ensure DB initialized (models synced/connected)
    try {
      await initializeDatabase();
    } catch (e) {
      console.error("DB init failed in /api/admin/login:", e);
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (e) {
    console.error("/api/admin/login error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}


