import Header from "../../backbone/Header";
import Footer from "../../backbone/Footer";
import "../../../style/Login.css";
import logoPknow from "../../../assets/pknow.png";
import { useState, useRef } from "react";
import Role from "../../part/Role";
import Cookies from "js-cookie";
import maskot from "../../../assets/loginMaskotTMS.png";
import { FcGoogle } from "react-icons/fc";
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

  const formDataRef = useRef({
    username: "",
    password: "",
  });

  const modalRef = useRef();

  // Validation schema for user inputs
  const userSchema = object({
    username: string().max(50, "maksimum 50 karakter").required("harus diisi"),
    password: string().required("Nama Pengguna dan Kata Sandi Wajib Diisi!"),
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
  const handleLoginClick = async (e) => {
    e.preventDefault();
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      try {
        const data = await UseFetch(API_LINK + "Utilities/Login", formDataRef.current);
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal melakukan autentikasi.");
        } else if (data[0].Status === "LOGIN FAILED") {
          throw new Error("Nama akun atau kata sandi salah.");
        } else {
            setListRole(data);
            setShowModal(true);
            modalRef.current.open();
        }
      } catch (error) {
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
              <h3 className="fw-bold" style={{width:"600px", textAlign:"center"}}>Gabung menjadi P-Knowers untuk mendapatkan pembelajaran lengkap</h3>
              <img src={maskot} alt="" />
            </div>
          
              <div className="login-box-daftar" style={{marginBottom:"60px"}}>
                <img
                  src={logoPknow}
                  className="pknow"
                  alt="Logo ASTRAtech"
                  title="Logo ASTRAtech"
                  width="230px"
                  height="35px"
                />
                <p style={{color:"#8C8C8C", marginTop:"10px"}}>Daftarkan dirimu dan menjadi bagian dari P-KNOW!</p>
                <form className="login-form" onSubmit={handleLoginClick} style={{textAlign:"left"}}>
                  
                <Input
                    type="text"
                    forInput="username"
                    placeholder="Nama Lengkap"
                    label="Nama Lengkap"
                    isRequired
                    value={formDataRef.current.username}
                    onChange={handleInputChange}
                  />
                   <Input
                    type="text"
                    forInput="username"
                    placeholder="Nama Pengguna"
                    label="Nama Pengguna"
                    isRequired
                    value={formDataRef.current.username}
                    onChange={handleInputChange}
                  />
                  <Input
                    type="password"
                    forInput="password"
                    placeholder="Kata Sandi"
                    isRequired
                    value={formDataRef.current.password}
                    onChange={handleInputChange}
                    errorMessage={errors.password}
                    label="Kata Sandi"
                  />
                  <Input
                    type="password"
                    forInput="password"
                    placeholder="Konfirmasi Kata Sandi"
                    isRequired
                    value={formDataRef.current.password}
                    onChange={handleInputChange}
                    errorMessage={errors.password}
                    label="Konfirmasi Kata Sandi"
                  />
                  {/* <div className="d-flex" style={{justifyContent:"space-between"}}>
                    <div className="">
                      <input type="checkbox" /><label htmlFor="" className="ml-2">Ingat Saya</label>
                    </div>
                    <div className="" >
                      <a href="" style={{textDecoration:"none", fontWeight:"600"}}>Lupa Kata Sandi?</a>
                    </div>
                  </div> */}

                  <button className="login-button" style={{border:'none', width:'100%', backgroundColor:'#0A5EA8', height:'40px', color:'white', borderRadius:'10px'}}
                    type="submit"
                    label="MASUK">Daftar</button>

                  <button className="login-button" style={{ width:'100%', backgroundColor:'white', border:"1px solid #0A5EA8 ", height:'40px', color:'black', borderRadius:'10px'}}
                    type="submit"
                    label="MASUK"> <FcGoogle size={20} style={{ marginRight: "8px" }} /> Daftar dengan Google</button>

                    <p style={{textAlign:"center", marginTop:"10px"}}>Belum memiliki akun?  <a href="" style={{textDecoration:"none", fontWeight:"600"}}>Daftar</a></p>
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
