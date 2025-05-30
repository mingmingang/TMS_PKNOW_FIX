import { useState, useEffect, useRef } from "react";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import Swal from "sweetalert2";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import FileUpload from "../../part/FileUpload2";
import UploadFile from "../../util/UploadFile";
import SweetAlert from "../../util/SweetAlert";
import he from "he";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import "../../../index.css";
import Konfirmasi from "../../part/Konfirmasi";

export default function Profil({ onChangePage, konfirmasi = "Konfirmasi",
  pesanKonfirmasi = "Apakah Anda yakin ingin keluar?", }) {
  let activeUser = "";
  let email = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

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


  const [profile, setProfile] = useState({
    ext_id: "",
    NamaLengkap: "",
    JenisKelamin: "",
    NomorTelepon: "",
    Email: "",
    TanggalLahir: "",
    gambar: "",
  });

  const [draftProfile, setDraftProfile] = useState({}); // State sementara untuk draft
  const [preview, setPreview] = useState(""); // State untuk preview gambar
  const fileGambarRef = useRef(null);

  const fetchProfileData = async () => {
    try {
      const response = await UseFetch(API_LINK + "Utilities/GetUserExternal", {
        username: activeUser,
      });

      if (response && response.length > 0) {
        const userData = response[0];
        const initialProfile = {
          ext_id: userData.ext_id || "",
          NamaLengkap: he.decode(userData.ext_nama_lengkap || "Belum Diisi"),
          JenisKelamin: userData.ext_gender || "Belum Diisi",
          NomorTelepon: userData.ext_no_telp || "Belum Diisi",
          Email: userData.ext_email || "",
          TanggalLahir: userData.ext_tanggal_lahir || "",
          gambar: userData.ext_gambar || "",
        };

        email = initialProfile.Email;

        setProfile(initialProfile);
        setDraftProfile(initialProfile); // Sinkronkan draft dengan data awal
        setPreview(
          userData.ext_gambar
            ? `${API_LINK}Upload/GetFile/${userData.ext_gambar}`
            : ""
        );
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
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

  const handleSave = async () => {
    const {
      ext_id,
      NamaLengkap,
      JenisKelamin,
      NomorTelepon,
      Email,
      TanggalLahir,
      gambar,
    } = draftProfile;

    if (!ext_id) {
      Swal.fire("Error", "ID pengguna tidak ditemukan!", "error");
      return;
    }

    let uploadedGambar = gambar;

    if (fileGambarRef.current?.files.length > 0) {
      try {
        const uploadResponse = await UploadFile(fileGambarRef.current);
        if (uploadResponse !== "ERROR") {
          uploadedGambar = uploadResponse.Hasil;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        Swal.fire("Error", "Gagal mengunggah gambar!", "error");
        return;
      }
    }

    try {
      const response = await UseFetch(API_LINK + "Utilities/EditUserExternal", {
        p1: ext_id,
        p2: NamaLengkap,
        p3: JenisKelamin,
        p4: NomorTelepon,
        p5: activeUser,
        p6: uploadedGambar,
        p7: Email,
        p8: TanggalLahir,
      });

      if (response === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengedit data profil.");
      } else {
        SweetAlert("Sukses", "Profil berhasil diubah", "success");
        setProfile(draftProfile); // Perbarui state utama dengan draft
       
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleEdit = (key, value) => {
    setDraftProfile((prevDraft) => ({ ...prevDraft, [key]: value }));
  };

  const handlePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Set preview URL dari FileReader
      };
      reader.readAsDataURL(file);
    }
  };
  const today = new Date(); // Hari ini
  const [selectedDate, setSelectedDate] = useState(draftProfile.TanggalLahir);

  
function decode(htmlString) {
  if (!htmlString) return ""; // Jika htmlString null atau undefined, return string kosong
  return he.decode(htmlString); // Decode string HTML
}


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
            
            textDecoration: "none",
            borderRadius: "5px",
            backgroundColor: "#FAFAFA",
            color: "#1a73e8",
          }}
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
          onClick={() => onChangePage("katasandi")}
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
          Profil
        </h1>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {profile.gambar || preview ? (
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
              className="chakra-avatar css-uzt5s3"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: "#e0e7ff",
                color: "#1a73e8",
                fontWeight: "bold",
                fontSize: "36px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 10px",
              }}
            >
              {getInitials(profile.NamaLengkap)}
            </div>
          )}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <FileUpload
              forInput="gambarProfile"
              label=""
              formatFile=".png"
              ref={fileGambarRef}
              onChange={handlePreview} // Tambahkan handler untuk preview
              errorMessage={""}
            />
          </div>

          <p style={{ color: "#888", fontSize: "12px" }}>
            Ukuran gambar maksimum 10 MB dengan format file: .jpg, .png, atau
            .jpeg.
          </p>
        </div>
        <hr />
        <form
  style={{
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  }}
>
  <div>
    <label
      htmlFor="NamaLengkap"
      style={{ fontSize: "14px", fontWeight: "bold", color: "#4A5568" }}
    >
      Nama Lengkap
    </label>
    <input
      type="text"
      value={decode(draftProfile.NamaLengkap)}
      onChange={(e) => handleEdit("NamaLengkap", e.target.value)}
      placeholder="Belum Diisi"
      style={{
        width: "100%",
        padding: "10px",
        border: "1px solid #E2E8F0",
        borderRadius: "5px",
        marginTop: "5px",
      }}
    />
  </div>

  <input
  type="email"
  value={draftProfile.Email}
  onChange={(e) => handleEdit("Email", e.target.value)}
  placeholder="Belum Diisi"
  disabled={!!email} // Jika ada isinya, input jadi nonaktif
  style={{
    width: "100%",
    padding: "10px",
    border: "1px solid #E2E8F0",
    borderRadius: "5px",
    marginTop: "5px",
    backgroundColor: draftProfile.Email ? "#F5F6F8" : "white", // Tambahkan efek visual
    cursor: draftProfile.Email ? "not-allowed" : "text",
  }}
/>


  <div>
    <label
      htmlFor="NomorTelepon"
      style={{ fontSize: "14px", fontWeight: "bold", color: "#4A5568" }}
    >
      Nomor Telepon
    </label>
    <PhoneInput
      country="id"
      value={draftProfile.NomorTelepon}
      onChange={(value) => handleEdit("NomorTelepon", value)}
      inputStyle={{
        marginLeft: "45px",
        width: "96%",
        padding: "10px",
        border: "1px solid #E2E8F0",
        borderRadius: "5px",
      }}
      placeholder="Belum Diisi"
    />
  </div>

<div className="d-flex">
  <div style={{marginRight:"50px"}}>
      <label
        htmlFor="TanggalLahir"
        style={{ fontSize: "14px", fontWeight: "bold", color: "#4A5568" }}
      >
        Tanggal Lahir
      </label>
      <br />
      <div className="">
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="d MMMM yyyy" // Format 1 November 2005
        locale={id} // Bahasa Indonesia
        showYearDropdown // Dropdown tahun
        scrollableYearDropdown // Bisa scroll di dropdown tahun
        yearDropdownItemNumber={100} // Menampilkan tahun lebih banyak
        maxDate={today} // Membatasi agar tidak bisa memilih tanggal setelah hari ini
        placeholderText="Pilih Tanggal Lahir"
        className="custom-datepicker"
      />
      </div>
    </div>

  <div>
    <label
      style={{ fontSize: "14px", fontWeight: "bold", color: "#4A5568" }}
    >
      Jenis Kelamin
    </label>
    <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
      <label>
        <input
          type="radio"
          name="JenisKelamin"
          value="Pria"
          checked={draftProfile.JenisKelamin === "Pria"}
          onChange={(e) => handleEdit("JenisKelamin", e.target.value)}
        />
        <span style={{ marginLeft: "5px" }}>Laki-laki</span>
      </label>
      <label>
        <input
          type="radio"
          name="JenisKelamin"
          value="Wanita"
          checked={draftProfile.JenisKelamin === "Wanita"}
          onChange={(e) => handleEdit("JenisKelamin", e.target.value)}
        />
        <span style={{ marginLeft: "5px" }}>Perempuan</span>
      </label>
    </div>
  </div>
  </div>
</form>


        <div>
          
        </div>
        <div style={{ textAlign: "right" }}>
        <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "grey",
              color: "#fff",
              margin: "0 10px",
            }}
            
          >
            Batal
          </button>
          <button
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: "#1a73e8",
              color: "#fff",
              margin: "0 10px",
            }}
            onClick={handleSave}
          >
            Simpan
          </button>
          
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
