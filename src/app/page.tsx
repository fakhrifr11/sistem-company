// app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Otomatis melempar pengunjung yang mengakses "/" ke "/login"
  redirect("/login");
}