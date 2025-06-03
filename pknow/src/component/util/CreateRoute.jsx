import { lazy } from "react";
const Login = lazy(() => import("../page/login/Index"));
const Beranda = lazy(() => import("../backbone/BerandaUtama"));
const BerandaAfterLogin = lazy(() => import("../backbone/BerandaAfterLogin"));
const Notifikasi = lazy(() => import("../page/notifikasi/Root"));
const AksesMateri = lazy(() => import("../page/Materi/master-test/Root"));
const Daftar = lazy(() => import("../page/daftar/Root"));
const TentangKamiLogin = lazy(() => import("../page/tentangkami/tentangkamiafterlogin/Root"));
const TentangPKNOW = lazy(() => import("../page/tentangkami/tentangkamibeforelogin/Root"));
const ClassTraining = lazy(() => import("../page/kelas/kelasafterlogin/Root"));
const Dashboard = lazy(() => import("../page/dashboard/Root"));
const KelasKu = lazy(() => import("../page/dashboard/kelasku/Root"));
const Sertifikat = lazy(() => import("../page/dashboard/sertifikat/Root"));
const Pembelian = lazy(() => import("../page/dashboard/pembelian/Root"));
const MyClass = lazy(() => import("../page/myclass/Root"));

const routeList = [
  { path: "/", element: <Beranda /> },
  { path: "/beranda", element: <Beranda /> },
  { path: "/beranda_eksternal", element: <BerandaAfterLogin /> },
  { path: "/login", element: <Login /> },
  { path: "/beranda_utama", element: <Beranda /> },
  { path: "/notifications", element: <Notifikasi /> },
  { path: "/materi", element: <AksesMateri /> },
  { path: "/daftar", element: <Daftar /> },
  { path: "/dashboard/kelas_saya", element: <KelasKu /> },
  { path: "/tentang_kami", element: <TentangKamiLogin /> },
  { path: "/tentang_pknow", element: <TentangPKNOW /> },
  { path: "/class_training", element: <ClassTraining /> },
  { path: "/dashboard/profil", element: <Dashboard /> },
  { path: "/dashboard/sertifikat", element: <Sertifikat /> },
  { path: "/dashboard/pembelian", element: <Pembelian /> },
  { path: "/my_class", element: <MyClass/>}
];

export default routeList;
