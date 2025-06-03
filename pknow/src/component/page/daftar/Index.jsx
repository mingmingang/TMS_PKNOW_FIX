import Header from "../../backbone/Header";
import Footer from "../../backbone/Footer";
import "../../../style/Login.css";
import logoPknow from "../../../assets/pknow.png";
import { useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import maskot from "../../../assets/loginMaskotTMS.png";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import {
  API_LINK,
  APPLICATION_ID,
  APPLICATION_NAME,
  ROOT_LINK,
} from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { encryptId } from "../../util/Encryptor";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/AlertLogin";
import Modal from "../../part/Modal";
import Input from "../../part/Input";
import { object, string } from "yup"; 

export default function Daftar() {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listRole, setListRole] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const formDataRef = useRef({
    username: "",
    namaLengkap: "",
    password: "",
    confirmPassword: "",
  });

  const modalRef = useRef();

  const handleLogin = () => {
    window.location.href = ROOT_LINK + "/" + "login"; // Redirect to login page
  };


  

  // Validation schema for user inputs
  const userSchema = object({
    username: string()
    .max(50, "Maksimum 50 karakter")
    .matches(/^\S*$/, "Username tidak boleh mengandung spasi") // Tidak boleh mengandung spasi
    .matches(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka, atau garis bawah") // Validasi karakter
    .required("Username harus diisi"),
    namaLengkap: string().max(50, "maksimum 50 karakter").required("harus diisi"),
    password: string()
    .min(8, "Password harus memiliki minimal 8 karakter") // Minimal 8 karakter
    .max(16, "Password maksimal 16 karakter") // Maksimal 16 karakter
    .matches(/^[a-zA-Z0-9]+$/, "Password hanya boleh mengandung huruf dan angka") // Hanya huruf dan angka
    .required("Password harus diisi"),
    confirmPassword: string().max(50, "maksimum 50 karakter").required("harus diisi"),
    
  });

  // Input change handler with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  // Login button click handler
  const handleDaftarClick = async (e) => {
    e.preventDefault();
    if (formDataRef.current.password !== formDataRef.current.confirmPassword) {
      Swal.fire({
        title: "Kesalahan!",
        text: "Password dan Konfirmasi Password tidak cocok.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return; // Hentikan proses jika tidak cocok
    }
    
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );
    const hashedPassword = CryptoJS.SHA256(formDataRef.current.password).toString();

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(API_LINK + "Utilities/RegisterUser",{
          username: formDataRef.current.username,
          namaLengkap: formDataRef.current.namaLengkap,
          password: hashedPassword,
          confirmPassword: "",
        } );

        console.log("payload data",{
          username: formDataRef.current.username,
          namaLengkap: formDataRef.current.namaLengkap,
          password: hashedPassword,
          confirmPassword: "",
        });
        console.log("data", data);
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal melakukan autentikasi.");
        } else if (data.Status === "Berhasil mendaftarkan pengguna") {
          Swal.fire({
            title: "Berhasil!",
            text: "Akun Anda berhasil didaftarkan. Silahkan Login!",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            // Refresh halaman atau arahkan ke halaman login
            window.location.href = ROOT_LINK + "/login";
          });
        } else {
          Swal.fire({
            title: "Akun Telah Terdaftar",
            text: "Akun Anda sudah ada di sistem P-KNOW.",
            icon: "info",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        console.error("Error in CreateMenu:", error.message);
        console.error("Stack trace:", error.stack);
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
    }
  };

  async function handleLoginWithRole(role, nama, peran) {
    try {
      const ipAddress = await fetch("https://api.ipify.org/?format=json")
      .then(response => response.json())
      .then(data => data.ip)
      .catch(error => console.error("Gagal mendapatkan IP:", error));
      
      if (ipAddress === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mendapatkan alamat IP.");
      }
  
      const token = await UseFetch(API_LINK + "Utilities/CreateJWTToken", {
        username: formDataRef.current.username,
        role: role,
        nama: nama,
      });
  
      if (token === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mendapatkan token autentikasi."
        );
      }
  
      localStorage.setItem("jwtToken", token.Token);
      const userInfo = {
        username: formDataRef.current.username,
        role: role,
        nama: nama,
        peran: peran,
        lastLogin: null,
      };
      console.log("pengguna",userInfo);
  
      let user = encryptId(JSON.stringify(userInfo));


      Cookies.set("activeUser", user, { expires: 1 });

      if(userInfo.peran == 'PIC P-KNOW' || userInfo.peran == 'PIC Kelompok Keahlian' || userInfo.peran == 'Tenaga Pendidik' ){
        window.location.href = ROOT_LINK + "/" + "beranda_utama";
      } else if(userInfo.peran == 'Program Studi') {
        window.location.href = ROOT_LINK + "/" + "beranda_prodi";
      }else if(userInfo.peran == 'Tenaga Kependidikan') {
        window.location.href = ROOT_LINK + "/" + "beranda_tenaga_kependidikan";
      }else if(userInfo.peran == 'Mahasiswa') {
        window.location.href = ROOT_LINK + "/" + "beranda_mahasiswa";
      }
      
    } catch (error) {
      window.scrollTo(0, 0);
      modalRef.current.close();
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  }
  
    if (Cookies.get("activeUser")) {
      window.location.href = "/";
    } else {
    return (
      <div>
        {isLoading && <Loading />}
        {isError.error && (
          <div className="flex-fill m-3">
            <Alert type="danger" message={isError.message} />
          </div>
        )}

        <Header  showUserInfo={false} />
        <main>
          <section className="login-background">
          <div className="login-container">
            <div className="maskotlogin mr-5" style={{color:"#0A5EA8"}}>
              <h3 className="fw-bold" style={{width:"700px", textAlign:"center"}}>Gabung menjadi P-Knowers untuk mendapatkan pembelajaran lengkap</h3>
              <img src={maskot} alt="Maskot Login" width="800px" style={{marginLeft:"-80px"}} />
            </div>
              <div className="login-box-daftar">
                <img
                  src={logoPknow}
                  className="pknow"
                  alt="Logo ASTRAtech"
                  title="Logo ASTRAtech"
                  width="230px"
                  height="35px"
                  style={{marginTop:"10px"}}
                />
                <p style={{color:"#8C8C8C", marginTop:"10px"}}>Daftarkan dirimu dan menjadi bagian dari P-KNOW!</p>
                <form className="login-form" onSubmit={handleDaftarClick} style={{textAlign:"left"}}>
                <Input
                    type="text"
                    forInput="namaLengkap"
                    placeholder="Nama Lengkap"
                    label="Nama Lengkap"
                    isRequired
                    value={formDataRef.current.namaLengkap}
                    onChange={handleInputChange}
                    errorMessage={errors.namaLengkap}
                  />
                   <Input
                    type="text"
                    forInput="username"
                    placeholder="Nama Pengguna"
                    label="Nama Pengguna"
                    isRequired
                    value={formDataRef.current.username}
                    onChange={handleInputChange}
                    errorMessage={errors.username}
                  />
                  <div style={{ position: "relative" }}>
                      <Input
                        type={showPassword ? "text" : "password"} // Ubah tipe input berdasarkan state
                        forInput="password"
                        placeholder="Kata Sandi"
                        isRequired
                        value={formDataRef.current.password}
                        onChange={handleInputChange}
                        errorMessage={errors.password}
                        label="Kata Sandi"
                      />
                      <i
                        className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} // Pilih ikon berdasarkan state
                        onClick={() => setShowPassword(!showPassword)} // Toggle visibilitas
                        style={{
                          position: "absolute",
                          top: "70%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#8c8c8c", // Sesuaikan warna ikon
                        }}
                      ></i>
                    </div>
                  
                    <div style={{ position: "relative" }}>
                  <Input
                      type={showConfirmPassword ? "text" : "password"} 
                    forInput="confirmPassword"
                    placeholder="Konfirmasi Kata Sandi"
                    isRequired
                    value={formDataRef.current.confirmPassword}
                    onChange={handleInputChange}
                    errorMessage={errors.confirmPassword}
                    label="Konfirmasi Kata Sandi"
                  />
                   <i
                        className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} // Pilih ikon berdasarkan state
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Toggle visibilitas
                        style={{
                          position: "absolute",
                          top: "70%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#8c8c8c", // Sesuaikan warna ikon
                        }}
                      ></i>
                      </div>

                  <button className="login-button" style={{border:'none', width:'100%', backgroundColor:'#0A5EA8', height:'40px', color:'white', borderRadius:'10px'}}
                    type="submit"
                    label="MASUK">Daftar</button>

                    <p style={{textAlign:"center", marginTop:"15px"}}>Sudah memiliki akun? <span style={{textDecoration:"none", fontWeight:"600", color:"#0A5EA8", cursor:"pointer"}} onClick={handleLogin}>Masuk</span></p>
                </form>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <Modal title="Pilih Peran" ref={modalRef} size="small">
          <div className="list-group">
            {listRole.map((value, index) => (
              <button
                key={index}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() =>
                  handleLoginWithRole(value.RoleID, value.Nama, value.Role)
                }
              >
                Login sebagai {value.Role}
              </button>
            ))}
          </div>
        </Modal>
      </div>
    );
  }
}
