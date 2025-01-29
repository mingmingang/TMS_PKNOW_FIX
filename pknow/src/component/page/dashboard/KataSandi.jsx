import { useState, useEffect, useRef } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import { decode } from 'he';
import Konfirmasi from "../../part/Konfirmasi";

export default function KataSandi({onChangePage,  konfirmasi = "Konfirmasi",
  pesanKonfirmasi = "Apakah Anda yakin ingin keluar?",}) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [profile, setProfile] = useState({
    ext_id: "",
    NamaLengkap: "",
    gambar: "",
    Password: "", // Tambahkan field password dari backend
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleLogoutClick = () => {
    setShowConfirmation(true); // Show confirmation modal on logout click
  };
  const [showConfirmation, setShowConfirmation] = useState(false);
  const handleConfirmYes = () => {
    window.location.replace("/logout"); // Redirect to login page
    setShowConfirmation(false); // Hide the confirmation dialog
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false); // Just close the confirmation modal
  };


  const handleKelas = () => {
    window.location.replace("/dashboard/kelas_saya"); // Redirect to login page
  };

  const handleSertifikat = () => {
    window.location.replace("/dashboard/sertifikat"); // Redirect to login page
  };
  const handlePembelian = () => {
    window.location.replace("/dashboard/pembelian"); // Redirect to login page
  };

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await UseFetch(API_LINK + "Utilities/GetUserExternal", {
          username: activeUser,
        });

        if (response && response.length > 0) {
          const userData = response[0];
          setProfile({
            ext_id: userData.ext_id || "",
            gambar: userData.ext_gambar || "",
            NamaLengkap: decode(userData.ext_nama_lengkap) || "",
            Password: userData.ext_password || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [activeUser]);

  const handleEditPassword = (key, value) => {
    setPasswords((prev) => ({ ...prev, [key]: value }));
  };

  const handleSavePassword = async () => {
    const { oldPassword, newPassword, confirmPassword } = passwords;

    // Validasi input
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire("Error", "Semua kolom harus diisi!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "Konfirmasi password tidak sesuai!", "error");
      return;
    }

    // Validasi Password Lama
    const hashedOldPassword = CryptoJS.SHA256(oldPassword).toString();
    if (hashedOldPassword !== profile.Password) {
      Swal.fire("Error", "Password lama tidak sesuai!", "error");
      return;
    }

    // Enkripsi Password Baru
    const hashedNewPassword = CryptoJS.SHA256(newPassword).toString();

    try {
      const response = await UseFetch(`${API_LINK}Utilities/EditPassword`, {
        p1: profile.ext_id, // ID pengguna
        p2: hashedNewPassword, // Password baru yang sudah dienkripsi
        p3: activeUser, // Username aktif
      });

      if (response && response.hasil !== "ERROR") {
        Swal.fire("Sukses", "Password berhasil diperbarui!", "success");
        setPasswords({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        Swal.fire("Error", response?.hasil || "Gagal memperbarui password", "error");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Swal.fire("Error", "Terjadi kesalahan saat memperbarui password", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2); // Ambil maksimal 2 karakter
  };


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        marginTop: "75px",
        padding: 0,
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <div
        style={{
          width: "400px",
          backgroundColor: "#F5F6F8",
          padding: "50px",
          boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        }}
      >
        {profile.gambar ? (
          <img
          src={
            profile.gambar.includes("https://lh3.googleusercontent.com")
              ? profile.gambar // Jika URL mengandung Googleusercontent, langsung gunakan
              : `${API_LINK}Upload/GetFile/${profile.gambar}` // Jika tidak, tambahkan API_LINK
          }
          alt="Profile Picture"
          style={{
            borderRadius: "50%",
            width: "80px",
            height: "80px",
            display: "block",
            margin: "0 auto 10px",
          }}
        />
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#e0e7ff",
              color: "#1a73e8",
              fontWeight: "bold",
              fontSize: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              margin: "0 auto 10px",
            }}
          >
            {getInitials(profile.NamaLengkap)}
          </div>
        )}

        <h2
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "30px",
          }}
        >
          {decode(profile.NamaLengkap)}
        </h2>
        <a

          style={{
            display: "block",
            padding: "10px 15px",
            marginBottom: "10px",
            color: "#333",
            textDecoration: "none",
            borderRadius: "5px",
          }}
          onClick={() => onChangePage("index")}
        >
          <i className="fas fa-user" style={{ marginRight: "10px" }}></i>
          Profil
        </a>
        <a
          style={{
            display: "block",
            padding: "10px 15px",
            marginBottom: "10px",
            textDecoration: "none",
            borderRadius: "5px",
            backgroundColor: "#FAFAFA",
            color: "#1a73e8",
          }}
        >
          <i className="fas fa-lock" style={{ marginRight: "10px" }}></i>
          Ubah Kata Sandi
        </a>

        <a
          style={{
            display: "block",
            padding: "10px 15px",
            marginBottom: "10px",
            color: "#333",
            textDecoration: "none",
            borderRadius: "5px",
            cursor:"pointer"
          }}
          onClick={handleKelas}
        >
          <i className="fas fa-book" style={{ marginRight: "10px" }}></i>
          Kelas Saya
        </a>

        <a
          style={{
            display: "block",
            padding: "10px 15px",
            marginBottom: "10px",
            color: "#333",
            textDecoration: "none",
            borderRadius: "5px",
            cursor:"pointer"
          }}
          onClick={handleSertifikat}
        >
          <i className="fas fa-award" style={{ marginRight: "10px" }}></i>
          Sertifikat
        </a>


        <a
          style={{
            display: "block",
            padding: "10px 15px",
            marginBottom: "10px",
            color: "#333",
            textDecoration: "none",
            borderRadius: "5px",
            cursor:"pointer"
          }}
          onClick={handlePembelian}
        >
          <i className="fas fa-money-bill" style={{ marginRight: "10px" }}></i>
          Pembelian
        </a>

        <a
          style={{
            display: "block",
            padding: "10px 15px",
            marginBottom: "10px",
            color: "red",
            textDecoration: "none",
            borderRadius: "5px",
          }}
          onClick={handleLogoutClick}
        >
          <i
            className="fas fa-sign-out-alt"
            style={{ marginRight: "10px" }}
          ></i>
          Keluar
        </a>
      </div>
      <div style={{ flex: 1, padding: "40px", backgroundColor: "#fff" }}>
        <h1
          style={{ fontSize: "24px", color: "#0A5EA8", marginBottom: "20px" }}
        >
          Ubah Kata Sandi
        </h1>
        
        {/* Form Ubah Password */}
        {profile.Password ? (
        <>
          <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* Input Password Lama */}
            <div style={{ position: "relative" }}>
              <label htmlFor="oldPassword" style={{ fontWeight: "bold" }}>
                Password Lama
              </label>
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                value={passwords.oldPassword}
                onChange={(e) =>
                  handleEditPassword("oldPassword", e.target.value)
                }
                placeholder="Masukkan password lama"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "5px",
                  marginTop: "5px",
                }}
              />
              <i
                className={showOldPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{
                  position: "absolute",
                  top: "72%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#8c8c8c",
                }}
              ></i>
            </div>

            {/* Input Password Baru */}
            <div style={{ position: "relative" }}>
              <label htmlFor="newPassword" style={{ fontWeight: "bold" }}>
                Password Baru
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={passwords.newPassword}
                onChange={(e) =>
                  handleEditPassword("newPassword", e.target.value)
                }
                placeholder="Masukkan password baru"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "5px",
                  marginTop: "5px",
                }}
              />
              <i
                className={showNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: "absolute",
                  top: "72%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#8c8c8c",
                }}
              ></i>
            </div>

            {/* Input Konfirmasi Password Baru */}
            <div style={{ position: "relative" }}>
              <label htmlFor="confirmPassword" style={{ fontWeight: "bold" }}>
                Konfirmasi Password Baru
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  handleEditPassword("confirmPassword", e.target.value)
                }
                placeholder="Konfirmasi password baru"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "5px",
                  marginTop: "5px",
                }}
              />
              <i
                className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={{
                  position: "absolute",
                  top: "72%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  fontSize: "16px",
                  color: "#8c8c8c",
                }}
              ></i>
            </div>
          </form>

          <div style={{ textAlign: "right", marginTop: "20px" }}>
            <button
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                backgroundColor: "#1a73e8",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={handleSavePassword}
            >
              Simpan
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
        <i
          className="fab fa-google"
          style={{
            fontSize: "50px",
            color: "#DB4437",
            marginBottom: "10px",
            marginTop:"100px"
          }}
        ></i>
        <p style={{ marginTop: "25px", fontSize: "25px", color :"#0A5EA8", fontWeight:"bold" }}>
          Maaf, akun Anda terkait dengan Google.
        </p>
        <p style={{ margin: "10px 100px", fontSize: "18px", color :"#0A5EA8",}}>
          Mohon maaf apabila akun anda tertaut dengan Google anda tidak dapat mengubah Password pada sistem P-KNOW.
        </p>
      </div>
      )}

       
      </div>
      {showConfirmation && (
        <Konfirmasi
          title={konfirmasi} // Pass the title
          pesan={pesanKonfirmasi} // Pass the message
          onYes={handleConfirmYes} // Handle Yes click
          onNo={handleConfirmNo} // Handle No click
        />
      )}
    </div>
  );
}
