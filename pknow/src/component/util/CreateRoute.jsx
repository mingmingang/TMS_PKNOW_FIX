import { lazy } from "react";
const Login = lazy(() => import("../page/login/Index"));
const Beranda = lazy(() => import("../backbone/BerandaUtama"));
const BerandaAfterLogin = lazy(() => import("../backbone/BerandaAfterLogin"));
const KelolaKK = lazy(() => import("../page/master-pic-pknow/KelolaKK/Root"));
const KelolaAKK = lazy(() => import("../page/master-pic-pknow/KelolaAKK/Root"));
const Prodi = lazy(() => import("../page/master-prodi/Index"));
const DaftarPustaka = lazy(() => import("../page/DaftarPustaka/Root"));
const KelolaPICKK = lazy(() => import("../page/master-prodi/KelolaPICKK/Root"));
const PersetujuanAnggotaKK = lazy(() => import("../page/master-prodi/PersetujuanAnggotaKK/Root"));
const TenagaKependidikan = lazy(() => import("../page/master-tenaga-kependidikan/Index"));
const Mahasiswa = lazy(() => import("../page/master-mahasiswa/Index"));
const PengajuanKelompokKeahlian = lazy(() => import("../page/master-tenaga-pendidik/PengajuanAnggotaKeahlian/Root"));
const RiwayatPengajuan = lazy(() => import("../page/master-tenaga-pendidik/RiwayatPengajuan/Root"));
const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
const KelolaProgram = lazy(()=> import("../page/master-pic-kk/KelolaProgram/Root"));
const KelolaMateri = lazy(() => import("../page/Materi/master-proses/Root"));
const AksesMateri = lazy(() => import("../page/Materi/master-test/Root"));
const Daftar = lazy(() => import("../page/daftar/Root"));

const routeList = [
  { path: "/", element: <Beranda /> },
  { path: "/beranda", element: <Beranda /> },
  { path: "/beranda_eksternal", element: <BerandaAfterLogin /> },
  { path: "/login", element: <Login /> },
  { path: "/beranda_utama", element: <Beranda /> },
  { path: "/beranda_prodi", element: <Prodi /> },
  { path: "/kelola_kelompok_keahlian", element: <KelolaKK /> },
  { path: "/kelola_anggota", element: <KelolaAKK /> },
  { path: "/daftar_pustaka", element: <DaftarPustaka /> },
  { path: "/pic_kelompok_keahlian", element: <KelolaPICKK /> },
  { path: "/persetujuan_anggota_keahlian", element: <PersetujuanAnggotaKK /> },
  { path: "/pengajuan_kelompok_keahlian", element: <PengajuanKelompokKeahlian /> },
  { path: "/riwayat_pengajuan", element: <RiwayatPengajuan /> },
  { path: "/beranda_tenaga_kependidikan", element: <TenagaKependidikan /> },
  { path: "/beranda_mahasiswa", element: <Mahasiswa /> },
  { path: "/notifications", element: <Notifikasi />},
  { path: "/kelola_program", element: <KelolaProgram />},
  { path: "/kelola_materi", element: <KelolaMateri />},
  { path: "/materi", element: <AksesMateri />},
  { path: "/daftar", element: <Daftar />},
];

export default routeList;
