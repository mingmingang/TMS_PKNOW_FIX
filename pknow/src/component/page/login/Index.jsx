import React, { useState, useRef, useEffect } from "react";
import Header from "../../backbone/Header";
import Footer from "../../backbone/Footer";
import "../../../style/Login.css";
import logoPknow from "../../../assets/pknow.png";
import maskot from "../../../assets/loginMaskotTMS.png";
import { FcGoogle } from "react-icons/fc";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import Cookies from "js-cookie";
import {
  API_LINK,
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

export default function Login() {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listRole, setListRole] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [captchaNumber, setCaptchaNumber] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");

  const formDataRef = useRef({
    username: "",
    password: "",
  });

  const modalRef = useRef();

  const userSchema = object({
    username: string().max(50, "Maksimum 50 karakter").required("Harus diisi"),
    password: string().required("Nama Pengguna dan Kata Sandi Wajib Diisi!"),
  });

  const generateCaptcha = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    setCaptchaNumber(randomNumber.toString());
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

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

    if (userCaptchaInput.trim() !== captchaNumber) {
      setIsError({ error: true, message: "Jawaban CAPTCHA salah!" });
      generateCaptcha();
      setUserCaptchaInput("");
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError({ error: false, message: "" });

      try {
        const data = await UseFetch(API_LINK + "Utilities/Login", {
          ...formDataRef.current,
        });
        if (data === "ERROR" || data[0]?.Status === "LOGIN FAILED") {
          throw new Error("Nama akun atau kata sandi salah.");
        }
        setListRole(data);
        setShowModal(true);
        modalRef.current.open();
      } catch (error) {
        setIsError({ error: true, message: error.message });
      } finally {
        setIsLoading(false);
      }
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

      Cookies.set("activeUser", encryptId(JSON.stringify(userInfo)), { expires: 1 });

      const redirectPath = {
        "PIC P-KNOW": "beranda_utama",
        "PIC Kelompok Keahlian": "beranda_utama",
        "Tenaga Pendidik": "beranda_utama",
        "Program Studi": "beranda_prodi",
        "Tenaga Kependidikan": "beranda_tenaga_kependidikan",
        "Mahasiswa": "beranda_mahasiswa",
      }[peran];

      window.location.href = ROOT_LINK + "/" + redirectPath;
    } catch (error) {
      setIsError({ error: true, message: error.message });
    }
  }

  if (Cookies.get("activeUser")) {
    window.location.href = "/";
    return null;
  }

  return (
    <div>
      {isLoading && <Loading />}
      {isError.error && <Alert type="danger" message={isError.message} />}

      <Header showUserInfo={false} />
      <main>
        <section className="login-background">
          <div className="login-container">
            <div className="maskotlogin" style={{ color: "#0A5EA8" }}>
              <h3 className="fw-bold" style={{ width: "600px", textAlign: "center" }}>
                Mulai langkah awal pembelajaranmu dengan P-KNOW
              </h3>
              <img src={maskot} alt="Maskot Login" width="600px" />
            </div>

            <div className="login-box">
              <img src={logoPknow} alt="Logo ASTRAtech" width="290px" height="43px" />
              <p style={{ color: "#8C8C8C" }}>Mulai langkah awal pembelajaranmu!</p>

              <form className="login-form" onSubmit={handleLoginClick}>
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

                <div className="d-flex justify-content-between">
                  <label>
                    <input type="checkbox" /> Ingat Saya
                  </label>
                  <a href="#" style={{ textDecoration: "none", fontWeight: "600" }}>
                    Lupa Kata Sandi?
                  </a>
                </div>

                <button className="login-button" style={{ backgroundColor: "#0A5EA8", color: "white" }}>
                  Masuk
                </button>
                <button className="login-button" style={{ backgroundColor: "white", color: "black", border: "1px solid #0A5EA8" }}>
                  <FcGoogle size={20} style={{ marginRight: "8px" }} /> Masuk dengan Google
                </button>

                <p style={{ textAlign: "center" }}>
                  Belum memiliki akun? <a href="#" style={{ fontWeight: "600" }}>Daftar</a>
                </p>

                <div className="captcha-container">
                  <div className="captcha-number" style={{ backgroundColor: "#0A5EA8", color: "white" }}>
                    {captchaNumber}
                  </div>
                  <div className="d-flex">
                    <input
                      type="text"
                      placeholder="Masukkan Captcha"
                      value={userCaptchaInput}
                      onChange={(e) => setUserCaptchaInput(e.target.value)}
                    />
                    <button type="button" onClick={generateCaptcha} style={{ backgroundColor: "#0A5EA8", color: "white" }}>
                      <FontAwesomeIcon icon={faSyncAlt} />
                    </button>
                  </div>
                </div>
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
                onClick={() => handleLoginWithRole(value.RoleID, value.Nama, value.Role)}
              >
                Masuk sebagai {value.Role}
              </button>
              <input
                type="radio"
                name={`role-${index}`}
                onClick={() => handleLoginWithRole(value.RoleID, value.Nama, value.Role)}
              />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
