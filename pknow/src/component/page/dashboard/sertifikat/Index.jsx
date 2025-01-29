import { useState, useEffect, useRef } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import { decode } from 'he';
import Konfirmasi from "../../../part/Konfirmasi";


export default function Sertifikat({onChangePage,  konfirmasi = "Konfirmasi",
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

  const handleProfile = () => {
    window.location.replace("/dashboard/profil"); // Redirect ke profil
  };

  const handleKelas = () => {
    window.location.replace("/dashboard/kelas_saya"); // Redirect to login page
  };

  const handlePembelian = () => {
    window.location.replace("/dashboard/pembelian"); // Redirect to login page
  };
  

  const handleUbahKataSandi = () => {
    localStorage.setItem("redirectTo", "katasandi"); // Simpan informasi tujuan
    window.location.replace("/dashboard/profil"); // Redirect ke profil
  };

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


  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("Semua Kelas");

//   useEffect(() => {
//     const fetchClasses = async () => {
//       try {
//         const response = await UseFetch(`${API_LINK}Utilities/GetUserClasses`, {
//           username: activeUser,
//         });

//         if (response) {
//           setClasses(response);
//         }
//       } catch (error) {
//         console.error("Error fetching classes:", error);
//       }
//     };

//     fetchClasses();
//   }, [activeUser]);


useEffect(() => {
    // Data statis sementara
    const staticClasses = [
      {
        id: 1,
        title: "C++ Dasar",
        description: "Materi dasar pemrograman C++",
        status: "Belum Dimulai",
        progress: 0,
        image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fen%2Ffree-png-nwvsu&psig=AOvVaw0y1K9HUxEgtTZj4-t3L4Fa&ust=1738128184912000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOim7JnWl4sDFQAAAAAdAAAAABAP", // Gambar placeholder
      },
      {
        id: 2,
        title: "React Native",
        description: "Belajar dasar pengembangan aplikasi mobile dengan React Native",
        status: "Sedang Dipelajari",
        progress: 6.7,
        image: "https://via.placeholder.com/80",
      },
      {
        id: 3,
        title: "React Dasar",
        description: "Belajar React dari awal hingga mahir",
        status: "Selesai",
        progress: 100,
        image: "https://via.placeholder.com/80",
      },
      {
        id: 4,
        title: "Unix Command Line Dasar",
        description: "Dasar penggunaan command line pada sistem operasi Unix/Linux",
        status: "Selesai",
        progress: 100,
        image: "https://via.placeholder.com/80",
      },
    ];
  
    // Set data statis ke state
    setClasses(staticClasses);
  }, []);
  
  const filteredClasses = Array.isArray(classes) ? classes.filter((cls) => {
    if (activeTab === "Belum Dimulai") return cls.status === "Belum Dimulai";
    if (activeTab === "Sedang Dipelajari") return cls.status === "Sedang Dipelajari";
    if (activeTab === "Selesai") return cls.status === "Selesai";
    return true;
  }) : [];

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
          onClick={handleProfile}
        >
          <i className="fas fa-user" style={{ marginRight: "10px" }}></i>
          Profil
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
          onClick={handleUbahKataSandi}
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
            textDecoration: "none",
            borderRadius: "5px",
            backgroundColor: "#FAFAFA",
            color: "#1a73e8",
          }}
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



      <div style={{ flex: 1, padding: "30px" }}>
        <h1 style={{ fontSize: "24px", color: "#0A5EA8", marginBottom: "20px" }}>Sertifikat Saya</h1>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {[
            "Semua Kelas",
            "Belum Dimulai",
            "Sedang Dipelajari",
            "Selesai",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                borderRadius: "5px",
                backgroundColor: activeTab === tab ? "#0A5EA8" : "#E9ECEF",
                color: activeTab === tab ? "#fff" : "#333",
                border: "none",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Class Cards */}
        <div style={{ display: "grid", gap: "20px" }}>
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={cls.image}
                alt={cls.title}
                style={{ width: "80px", height: "80px", borderRadius: "5px" }}
              />
              <div style={{ flex: 1, marginLeft: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>{cls.title}</h3>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#888" }}>
                  {cls.description}
                </p>
                <div
                  style={{
                    height: "5px",
                    backgroundColor: "#E9ECEF",
                    borderRadius: "5px",
                    overflow: "hidden",
                    marginRight:"40px"
                  }}
                >
                  <div
                    style={{
                      width: `${cls.progress}%`,
                      height: "100%",
                      backgroundColor: "#0A5EA8",
                    }}
                  ></div>
                </div>
              </div>
              <button
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#DB4437",
                  color: "#fff",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Lihat Detail Kelas
              </button>
            </div>
          ))}
        </div>
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
