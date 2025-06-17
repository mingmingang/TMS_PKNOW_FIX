import { useState, useEffect, useRef } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import { decode } from "he";
import Konfirmasi from "../../../part/Konfirmasi";
import axios from "axios";
import PDF_Viewer from "../../../part/PDF_Viewer";

export default function Sertifikat({
  onChangePage,
  konfirmasi = "Konfirmasi",
  pesanKonfirmasi = "Apakah Anda yakin ingin keluar?",
}) {
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

  const [fileData, setFileData] = useState({
    file: "",
    judul: "",
    formattedFileName: "",
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
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handleViewCertificate = (cert) => {
    if (!cert.url) {
      Swal.fire("Error", "File sertifikat tidak tersedia", "error");
      return;
    }
    setSelectedCertificate(cert);
    setShowPdfModal(true);
  };

  const handleDownload = (cert) => {
    if (!cert.url) {
      Swal.fire("Error", "File sertifikat tidak tersedia", "error");
      return;
    }

    const ext = cert.url.split(".").pop().toLowerCase();
    const formattedFileName = `${cert.title.replace(/\s+/g, "_")}.${ext}`;

    setupDownload(`${API_LINK}Upload/GetFile/${cert.url}`, formattedFileName);
  };

  // const certificates = [
  //   {
  //     title: "Web Development Pemula",
  //     id: "wep574epGtKzupX75srOM0",
  //     level: "Pemula",
  //     date: "15 Mei 2025",
  //   },
  //   {
  //     title: "Algorithm & Data Structures with Python",
  //     id: "itiTGimxqRlLy_m8JxdSS4rw",
  //     level: "Ahli",
  //     date: "10 April 2025",
  //   },
  //   {
  //     title: "Python Lanjutan",
  //     id: "b_3n9fK_aO2y0uaiSM-XeQ",
  //     level: "Menengah",
  //     date: "5 Maret 2025",
  //   },
  //   {
  //     title: "Python Dasar",
  //     id: "IGOTIK_ETWqXsMMHQKxfYA",
  //     level: "Pemula",
  //     date: "20 Februari 2025",
  //   },
  // ];

  const capitalizeLevel = (level) => {
    if (!level) return "";
    return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
  };

  const getLevelColor = (level) => {
    if (!level) return "#9E9E9E";
    const lowerLevel = level.toLowerCase();
    switch (lowerLevel) {
      case "pemula":
        return "#4CAF50"; // Hijau
      case "menengah":
        return "#2196F3"; // Biru
      case "ahli":
        return "#FF9800"; // Oranye
      default:
        return "#9E9E9E"; // Abu-abu
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch user profile
        const profileResponse = await UseFetch(
          API_LINK + "Utilities/GetUserExternal",
          {
            username: activeUser,
          }
        );

        if (profileResponse && profileResponse.length > 0) {
          const userData = profileResponse[0];
          console.log("Data dari API:", userData); // Periksa data sebelum di-set

          const newProfile = {
            ext_id: userData.ext_id || "",
            gambar: userData.ext_gambar || "",
            NamaLengkap: userData.ext_nama_lengkap
              ? decode(userData.ext_nama_lengkap)
              : "",
            Password: userData.ext_password || "",
          };

          setProfile(newProfile);
          console.log("tes profile", newProfile);

          // 2. Fetch certificates menggunakan ext_id dari userData (bukan dari state)
          const certificatesResponse = await UseFetch(
            API_LINK + "Klaim/GetSertifByUser",
            { ext_id: userData.ext_id }
          );

          console.log("sertif", certificatesResponse[0]);

          if (certificatesResponse && Array.isArray(certificatesResponse)) {
            const formattedCertificates = certificatesResponse.map((cert) => ({
              title: cert.NamaProgram ? decode(cert.NamaProgram) : "",
              id: cert.KlaimID || "",
              level: cert.Level ? capitalizeLevel(cert.Level) : "",
              date: cert.TanggalKlaim
                ? new Date(cert.TanggalKlaim).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "",
              url: cert.FileSertifikat || "",
            }));
            setCertificates(formattedCertificates);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Gagal memuat data", "error");
      }
    };

    fetchData();
  }, [activeUser]); // Tambahkan activeUser sebagai dependency

  const setupDownload = async (fileUrl, formattedFileName) => {
    try {
      // Fetch file dari server
      const response = await axios.get(fileUrl, {
        responseType: "blob", // Pastikan menerima data dalam bentuk Blob
      });

      // Buat URL untuk Blob
      const blob = new Blob([response.data]);
      const blobUrl = window.URL.createObjectURL(blob);

      // Buat elemen <a> untuk unduhan
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = formattedFileName; // Tetapkan nama file unduhan

      // Tambahkan ke DOM dan klik untuk memulai unduhan
      document.body.appendChild(link);
      link.click();

      // Hapus elemen <a> setelah selesai
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Bersihkan URL Blob
    } catch (error) {
      console.error("Error setting up download:", error);
      Swal.fire("Error", "Gagal mengunduh sertifikat", "error");
    }
  };

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
        Swal.fire(
          "Error",
          response?.hasil || "Gagal memperbarui password",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Swal.fire(
        "Error",
        "Terjadi kesalahan saat memperbarui password",
        "error"
      );
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
        image:
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngwing.com%2Fen%2Ffree-png-nwvsu&psig=AOvVaw0y1K9HUxEgtTZj4-t3L4Fa&ust=1738128184912000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOim7JnWl4sDFQAAAAAdAAAAABAP", // Gambar placeholder
      },
      {
        id: 2,
        title: "React Native",
        description:
          "Belajar dasar pengembangan aplikasi mobile dengan React Native",
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
        description:
          "Dasar penggunaan command line pada sistem operasi Unix/Linux",
        status: "Selesai",
        progress: 100,
        image: "https://via.placeholder.com/80",
      },
    ];

    // Set data statis ke state
    setClasses(staticClasses);
  }, []);

  const filteredClasses = Array.isArray(classes)
    ? classes.filter((cls) => {
        if (activeTab === "Belum Dimulai")
          return cls.status === "Belum Dimulai";
        if (activeTab === "Sedang Dipelajari")
          return cls.status === "Sedang Dipelajari";
        if (activeTab === "Selesai") return cls.status === "Selesai";
        return true;
      })
    : [];

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
            cursor: "pointer",
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
            cursor: "pointer",
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
            cursor: "pointer",
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
        <h1
          style={{ fontSize: "24px", color: "#0A5EA8", marginBottom: "20px" }}
        >
          Sertifikat Saya
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {certificates.map((cert, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Badge Level */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  backgroundColor: getLevelColor(cert.level),
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {cert.level}
              </div>

              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "18px",
                  color: "#333",
                  paddingRight: "60px", // Untuk memberi space untuk badge
                }}
              >
                {cert.title}
              </h3>

              <div style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  {/* <i
                    className="fas fa-id-card"
                    style={{
                      color: "#0A5EA8",
                      marginRight: "8px",
                      width: "20px",
                      textAlign: "center",
                    }}
                  ></i>
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    {cert.id}
                  </span> */}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <i
                    className="fas fa-calendar-alt"
                    style={{
                      color: "#0A5EA8",
                      marginRight: "8px",
                      width: "20px",
                      textAlign: "center",
                    }}
                  ></i>
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    {cert.date}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <i
                    className="fas fa-certificate"
                    style={{
                      color: getLevelColor(cert.level),
                      marginRight: "8px",
                      width: "20px",
                      textAlign: "center",
                    }}
                  ></i>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      fontWeight: "500",
                    }}
                  >
                    Level:{" "}
                    <span style={{ color: getLevelColor(cert.level) }}>
                      {cert.level}
                    </span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleViewCertificate(cert)}
                style={{
                  width: "100%",
                  backgroundColor: "#0A5EA8",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background-color 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ":hover": {
                    backgroundColor: "#084b8a",
                  },
                }}
              >
                <i
                  className="fas fa-download"
                  style={{ marginRight: "8px" }}
                ></i>
                Lihat Sertifikat
              </button>
            </div>
          ))}
        </div>
      </div>

      {showPdfModal && selectedCertificate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              width: "90%",
              maxHeight: "95vh", // batasi tinggi agar tidak keluar viewport
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              overflow: "auto", // ini penting untuk scroll konten dalam modal
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>{selectedCertificate.title}</h3>
              <button
                onClick={() => setShowPdfModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <PDF_Viewer
                pdfFileName={selectedCertificate.url}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

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
