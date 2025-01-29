import React, { useState, useRef, useEffect } from "react";
import Header from "../../backbone/Header";
import Footer from "../../backbone/Footer";
import "../../../style/Login.css";
import logoPknow from "../../../assets/pknow.png";
import maskot from "../../../assets/loginMaskotTMS.png";
import { FcGoogle } from "react-icons/fc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { API_LINK, ROOT_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { encryptId } from "../../util/Encryptor";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/AlertLogin";
import CryptoJS from "crypto-js";
import Modal from "../../part/Modal";
import Input from "../../part/Input";
import { object, string } from "yup";

export default function Login() {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listRole, setListRole] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [captchaNumber, setCaptchaNumber] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaImage, setCaptchaImage] = useState("");

  const formDataRef = useRef({
    username: "",
    password: "",
  });

  const loadCaptcha = () => {
    setCaptchaImage(API_LINK + `Utilities/GetCaptcha?rand=${Math.random()}`);
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      window.location.href = `${ROOT_LINK}/beranda_eksternal`; // Redirect ke halaman utama
    }
  }, []);

  
  useEffect(() => {
    loadCaptcha(); // Muat captcha saat komponen di-mount
  }, []);

  const generateCaptcha = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // Angka 1000-9999
    setCaptchaNumber(randomNumber.toString());
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleDaftar = () => {
    window.location.href = ROOT_LINK + "/" + "daftar"; // Redirect to login page
  };

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id:
        "321829758200-6u58g5he387s4tpd19gbchac6ftg4v4u.apps.googleusercontent.com",
      callback: handleGoogleSignIn,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignUpBtn"),
      { theme: "outline", size: "large" }
    );
  }, []);

  const decodeJWT = (token) => {
    try {
      // Pisahkan bagian JWT (header, payload, signature)
      const base64Url = token.split(".")[1];
      if (!base64Url) throw new Error("Token tidak valid");
  
      // Decode payload dari Base64 URL menjadi JSON
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
  
      return JSON.parse(jsonPayload); // Kembalikan payload sebagai objek
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const [draftProfile, setDraftProfile] = useState({}); // State sementara untuk draft
  const [preview, setPreview] = useState(""); // State untuk preview gambar
  const fileGambarRef = useRef(null);
  const [profile, setProfile] = useState({
    ext_id: "",
    NamaLengkap: "",
    JenisKelamin: "",
    NomorTelepon: "",
    Email: "",
    TanggalLahir: "",
    gambar: "",
  });
  
  const handleGoogleSignIn = async (response) => {
    console.log("Response", response);
    try {
      // Validasi token
      if (!response.credential) {
        throw new Error("Token tidak ditemukan.");
      }
  
      // Decode JWT dari Google
      const userData = decodeJWT(response.credential);
      if (!userData) {
        throw new Error("Gagal mendekode token JWT.");
      }
  
      console.log("userData", userData);
  
      const { email, name, picture } = userData;
      const loginData = {
        email,
        namaLengkap: name,
        gender: "",
        noTelp: "",
        createdBy: email,
        gambar: picture
      };

      console.log("login data", loginData);
      try {
        // Kirim data pengguna ke server
        const response = await fetch(`${API_LINK}Utilities/RegisterGoogleUser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
          credentials: "include",
        });
  
        const data = await response.json();

  
        // Handle berbagai kondisi berdasarkan respons server
        if (data === "ERROR") {
          Swal.fire({
            title: "Kesalahan!",
            text: "Akun tidak ditemukan.",
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }
  
        if (data.error === "Captcha tidak valid.") {
          throw new Error("Captcha yang dimasukan tidak sesuai.");
        }
  
        if (data.Status === "Berhasil Mendaftarkan Akun Google") {

          Swal.fire({
            title: "Berhasil!",
            text: "Login Berhasil.",
            icon: "success"
          }).then(() => {
            processLogin(email, name, "Eksternal", picture);
          });
        } else {
          Swal.fire({
            title: "Berhasil!",
            text: "Login Berhasil.",
            icon: "success"
          }).then(() => {
            processLogin(email, name, "Eksternal", picture);
          });
        }
      } catch (error) {
        handleLoginError(error);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsError({ error: true, message: error.message });
    }
  };
  
  const processLogin = async (email, name, peran, gambar) => {
    try {
      // Generate JWT Token
      const role = "ROL07"; // Sesuaikan dengan role default atau dari server
      const token = await UseFetch(`${API_LINK}Utilities/CreateJWTToken`, {
        username: email,
        role,
        nama: name,
      });
  
      if (token === "ERROR") {
        throw new Error("Gagal mendapatkan token autentikasi.");
      }
  
      // Simpan token dan informasi pengguna
      localStorage.setItem("jwtToken", token.Token);
      const userInfo = {
        username: email,
        role,
        nama: name,
        peran,
        profile: gambar,
      };
  
      console.log("Data yang disimpan di cookie:", userInfo);
      Cookies.set("activeUser", encryptId(JSON.stringify(userInfo)), {
        expires: 1,
      });
  
      // Redirect berdasarkan peran
      const redirectPath = {
        "PIC P-KNOW": "beranda_utama",
        "PIC Kelompok Keahlian": "beranda_utama",
        "Tenaga Pendidik": "beranda_utama",
        "Program Studi": "beranda_prodi",
        "Tenaga Kependidikan": "beranda_tenaga_kependidikan",
        "Mahasiswa": "beranda_mahasiswa",
        "Eksternal": "beranda_eksternal",
      }[peran];
  
      window.location.href = `${ROOT_LINK}/${redirectPath}`;
  
      // Mencegah navigasi "back" browser
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, null, window.location.href);
      };
    } catch (error) {
      console.error("Error during login process:", error.message);
    }
  };
  
  
  const handleLoginError = (error) => {
    window.scrollTo(0, 0);
    setIsError((prevError) => ({
      ...prevError,
      error: true,
      message: error.message,
    }));
    loadCaptcha();
  };
  
  

  const modalRef = useRef();

  const userSchema = object({
    username: string()
    .max(50, "Maksimum 50 karakter")
    .matches(/^\S*$/, "Username tidak boleh mengandung spasi") // Tidak boleh mengandung spasi
    .matches(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka, atau garis bawah") // Validasi karakter
    .required("Username harus diisi"),
    password: string().required("Nama Pengguna dan Kata Sandi Wajib Diisi!"),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleLoginClick = async (e) => {
    e.preventDefault();

    if (userCaptchaInput.trim() === "") {
      setIsError({ error: true, message: "Harap masukkan CAPTCHA!" });
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
    const hashedPassword = CryptoJS.SHA256(formDataRef.current.password).toString();
    const loginData = {
      username: formDataRef.current.username,
      password: hashedPassword,
      captcha: userCaptchaInput, // Input CAPTCHA dari pengguna
    };

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        const response = await fetch(`${API_LINK}Utilities/LoginTMS`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
          credentials: "include", // Pastikan session cookie dikirim
        });
        const data = await response.json();
        console.log("hasil login", data);
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal melakukan autentikasi.");
        } else if (data.error === "Captcha tidak valid.") {
          throw new Error("Captcha yang dimasukan tidak sesuai.");
        } else if (data[0].Status === "LOGIN FAILED") {
          throw new Error("Nama akun atau kata sandi salah.");
        } else {
          // setListRole(data);
          // setShowModal(true);
          // modalRef.current.open();
          console.log("data login", data);
          const role = "ROL07"; // Sesuaikan dengan role default atau data dari server
          const nama = name;
          const peran = "Eksternal"; // Contoh peran, sesuaikan sesuai kebutuhan
    
          const token = await UseFetch(API_LINK + "Utilities/CreateJWTToken", {
            username: formDataRef.current.username,
            role : data[0].RoleID,
            nama: data[0].Nama,
          });
    
          if (token === "ERROR") {
            throw new Error("Gagal mendapatkan token autentikasi.");
          }
    
          // Simpan token ke localStorage dan informasi pengguna ke cookie
          localStorage.setItem("jwtToken", token.Token);
    
          const userInfo = {
            username: formDataRef.current.username,
            role : data[0].RoleID,
            nama: data[0].Nama,
            peran: data[0].Role,
          };
    
          console.log("Data yang disimpan di cookie:", userInfo);
          Cookies.set("activeUser", encryptId(JSON.stringify(userInfo)), {
            expires: 1,
          });
    
          // Tentukan path redirect berdasarkan peran
          const redirectPath = {
            "PIC P-KNOW": "beranda_utama",
            "PIC Kelompok Keahlian": "beranda_utama",
            "Tenaga Pendidik": "beranda_utama",
            "Program Studi": "beranda_prodi",
            "Tenaga Kependidikan": "beranda_tenaga_kependidikan",
            "Mahasiswa": "beranda_mahasiswa",
            "Eksternal": "beranda_eksternal"
          }[peran];

          window.location.href = ROOT_LINK + "/" + "beranda_eksternal";
          window.history.pushState(null, null, window.location.href);
          window.onpopstate = () => {
            window.history.pushState(null, null, window.location.href);
          };
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        loadCaptcha();
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
      loadCaptcha();
    }
  };

  async function handleLoginWithRole(role, nama, peran) {
    try {
      const token = await UseFetch(API_LINK + "Utilities/CreateJWTToken", {
        username: formDataRef.current.username,
        role,
        nama,
      });

      if (token === "ERROR") {
        throw new Error("Gagal mendapatkan token autentikasi.");
      }

      localStorage.setItem("jwtToken", token.Token);
      const userInfo = {
        username: formDataRef.current.username,
        role,
        nama,
        peran,
      };

      Cookies.set("activeUser", encryptId(JSON.stringify(userInfo)), {
        expires: 1,
      });

      const redirectPath = {
        "PIC P-KNOW": "beranda_utama",
        "PIC Kelompok Keahlian": "beranda_utama",
        "Tenaga Pendidik": "beranda_utama",
        "Program Studi": "beranda_prodi",
        "Tenaga Kependidikan": "beranda_tenaga_kependidikan",
        Mahasiswa: "beranda_mahasiswa",
      }[peran];

      window.location.href = ROOT_LINK + "/" + redirectPath;
    } catch (error) {
      setIsError({ error: true, message: error.message });
    }
  }



  return (
    <div>
      {isLoading && <Loading />}
      {isError.error && <Alert type="danger" message={isError.message} />}

      <Header showUserInfo={false} />
      <main>
        <section className="login-background">
          <div className="login-container">
            <div
              className="maskotlogin"
              style={{ color: "#0A5EA8", marginLeft: "-40px" }}
            >
              <h2
                className="fw-bold"
                style={{ width: "600px", textAlign: "center" }}
              >
                Mulai langkah awal pembelajaranmu dengan P-KNOW
              </h2>
              <img src={maskot} alt="Maskot Login" width="800px" style={{marginLeft:"-80px"}} />
            </div>
            <div className="login-box">
              <img
                src={logoPknow}
                alt="Logo ASTRAtech"
                width="290px"
                height="43px"
                style={{ marginTop: "10px" }}
              />
              <p style={{ color: "#8C8C8C" }}>
                Mulai langkah awal pembelajaranmu!
              </p>

              <form className="login-form" onSubmit={handleLoginClick}>
                <div className="" style={{ textAlign: "left" }}>
                  <label
                    htmlFor=""
                    className="fw-bold"
                    style={{ textAlign: "left" }}
                  >
                    Nama Pengguna <span style={{ color: "red" }}>*</span>
                  </label>
                </div>
                <Input
                  type="text"
                  forInput="username"
                  placeholder="Masukan Nama Pengguna"
                  isRequired
                  value={formDataRef.current.username}
                  onChange={handleInputChange}
                />
                <div className="" style={{ textAlign: "left" }}>
                  <label
                    htmlFor=""
                    className="fw-bold mt-2"
                    style={{ textAlign: "left" }}
                  >
                    Kata Sandi <span style={{ color: "red" }}>*</span>
                  </label>
                </div>
                <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  forInput="password"
                  placeholder="Masukan Kata Sandi"
                  isRequired
                  value={formDataRef.current.password}
                  onChange={handleInputChange}
                  errorMessage={errors.password}
                />
                <i
                        className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} // Pilih ikon berdasarkan state
                        onClick={() => setShowPassword(!showPassword)} // Toggle visibilitas
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#8c8c8c", // Sesuaikan warna ikon
                        }}
                      ></i>
                      </div>

                <div className="mt-2">
                  <p style={{ textAlign: "left" }}>
                    Captcha <span style={{ color: "red" }}>*</span>
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "5px",
                  }}
                >
                  <img
                    src={captchaImage}
                    alt="Captcha"
                    style={{ height: "50px", marginRight: "10px" }}
                  />

                  <div className="d-flex">
                    <div className="ml-3">
                      <input
                        type="text"
                        placeholder="Masukkan Captcha"
                        value={userCaptchaInput}
                        onChange={(e) => setUserCaptchaInput(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "5px 0px 0px 5px",
                          border: "1px solid #ccc",
                          height: "44px",
                        }}
                      />
                    </div>
                    <div className="">
                      <button
                        type="button"
                        onClick={loadCaptcha}
                        style={{
                          padding: "10px",
                          width: "50px",
                          border: "none",
                          backgroundColor: "#0A5EA8",
                          borderRadius: "0px 5px 5px 0px",
                          cursor: "pointer",
                          color: "white",
                        }}
                      >
                        <FontAwesomeIcon icon={faSyncAlt} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <label>
                    <input type="checkbox" /> Ingat Saya
                  </label>
                  <a
                    href="#"
                    style={{ textDecoration: "none", fontWeight: "600" }}
                  >
                    Lupa Kata Sandi?
                  </a>
                </div>

                <button
                  className="login-button py-2"
                  style={{ backgroundColor: "#0A5EA8", color: "white" }}
                >
                  Masuk
                </button>
                <button
                  className="login-button"
                  id="googleSignUpBtn"
                  type="reset"
                >
                  <FcGoogle size={20} style={{ marginRight: "8px" }} /> Daftar
                  dengan Google
                </button>

                <p style={{ textAlign: "center", marginTop: "15px" }}>
                  Belum memiliki akun?{" "}
                  <span
                    style={{
                      textDecoration: "none",
                      fontWeight: "600",
                      color: "#0A5EA8",
                      cursor: "pointer",
                    }}
                    onClick={handleDaftar}
                  >
                    Daftar
                  </span>
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Modal title="Pilih Peran" ref={modalRef} size="small">
        <div>
          {listRole.map((value, index) => (
            <div key={index} className="d-flex justify-content-between">
              <button
                className="list-group-item"
                onClick={() =>
                  handleLoginWithRole(value.RoleID, value.Nama, value.Role)
                }
              >
                Masuk sebagai {value.Role}
              </button>
              <input
                type="radio"
                name={`role-${index}`}
                onClick={() =>
                  handleLoginWithRole(value.RoleID, value.Nama, value.Role)
                }
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
