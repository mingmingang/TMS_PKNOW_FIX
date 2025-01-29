import Cookies from "js-cookie";
import { ROOT_LINK } from "../../util/Constants";

export default function Logout() {
  // Hapus token autentikasi dan data pengguna
  Cookies.remove("activeUser");
  localStorage.removeItem("jwtToken"); // Hapus token dari localStorage

  // Redirect ke halaman utama
  window.location.href = ROOT_LINK;
  return;
}
