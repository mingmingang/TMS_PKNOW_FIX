import { useEffect, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Alert from "../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import { decode } from "he";
import Konfirmasi from "../../../part/Konfirmasi";
import "../../../../index.css";
import AppContext_test from "./TestContext.jsx";
import AppContext_master from "./MasterContext.jsx";
import AnimatedSection from "../../../part/AnimatedSection.jsx";
import SweetAlert from "../../../util/SweetAlert.js";
import Swal from 'sweetalert2';

export default function DetailKelas({ withID, onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [activeCategory, setActiveCategory] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [listMateri, setlistMateri] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  console.log("AppContext_test.klaim", AppContext_test.klaim);

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
    KKid: "",
  });

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index", withID);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };
  console.log("data withid", withID);
  const getListKategoriProgram = async (filter) => {
    console.log("data program", withID);
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "KategoriProgram/GetKategoriByIDProgram",
          {
            page: withID.id,
            query: "",
            sort: "[Nama Kategori] asc",
            status: "Aktif",
          }
        );

        console.log("data kategori:", data);

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setListKategoriProgram([]);
          break;
        } else if (data.length === 0) {
          setListKategoriProgram([]);
          break;
        } else {
          setListKategoriProgram(data);
          break;
        }
      }
    } catch (e) {
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getListKategoriProgram();
    };

    fetchData();
  }, []);

  const getDataMateriKategori = async (index) => {
    console.log("Mendapatkan data materi untuk kategori:", index);
    const kategoriKey = index;
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Materi/GetDataMateriByKategori", {
          page: 1,
          status: "Semua",
          query: "",
          sort: "Judul",
          order: "asc",
          kategori: kategoriKey,
        });

        console.log("data materi:", data);

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setlistMateri([]);
          break;
        } else if (data.length === 0) {
          setlistMateri([]);
          break;
        } else {
          setlistMateri(data);
          setActiveCategory(kategoriKey); // Set kategori aktif
          break;
        }
      }
    } catch (e) {
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  const toggleCategory = (kategoriKey) => {
    // Jika kategori yang diklik adalah kategori aktif, tutup (set null).
    if (activeCategory === kategoriKey) {
      setActiveCategory(null);
    } else {
      // Jika kategori yang diklik berbeda, jadikan kategori aktif.
      setActiveCategory(kategoriKey);
      getDataMateriKategori(kategoriKey);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    console.log("bukaa");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowSkalaModal(false);
  };

  const [showSkalaModal, setShowSkalaModal] = useState(false); // Modal Skala disembunyikan pada awalnya
  const [selectedValue, setSelectedValue] = useState(null); // Untuk menyimpan nilai skala

  const handleNextToSkala = () => {
    setShowModal(false);
    setShowSkalaModal(true);
  };

  const handleNextToFinish = () => {
    console.log("Pendidikan Data Disimpan");
    console.log("Skala Pemahaman:", selectedValue);
  };

  const handleBacaMateri = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    AppContext_test.refreshPage += 1;
    onChangePage("pengenalan", true, book.Key, true);
  };

  const handleBeliKelas = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    AppContext_test.refreshPage += 1;
    onChangePage("beli", book);
  };

  const handleGabungClick = () => {
    setShowModal(true);
  };

  const handleClaim = async (e) => {
    e.preventDefault();

    try {
      const response = await UseFetch(API_LINK + "Klaim/CreateKlaim", {
        ext_username: activeUser,
        prg_id: withID.id,
        klaim_catatan: "8",
        klaim_bukti: "",
        klaim_status: "sukses", // atau isi dari form kalau ada
      });

      if (response?.hasil === "ERROR") {
        throw new Error(
          response.message || "Terjadi kesalahan saat menyimpan klaim."
        );
      }

      SweetAlert("Sukses", "Klaim berhasil disimpan", "success");
      onChangePage("index"); // kembali ke halaman sebelumnya jika ada
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError({
        error: true,
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBelajarClick = () => {
    const elemenMateri = document.querySelector(".materi");
    if (elemenMateri) {
      elemenMateri.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatedSection delay={0.4}>
      <div className="app-container">
        <div
          className="header"
          style={{
            width: "100%",
            padding: "100px 100px",
            backgroundImage: `linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0)), url(${API_LINK}Upload/GetFile/${withID.gambar})`,
            objectFit: "cover",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right",
          }}
        >
          <>
            <div className="background">
              <h4
                style={{
                  color: "white",
                  paddingBottom: "0px",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.73)",
                }}
              >
                <button
                  style={{ backgroundColor: "transparent", border: "none" }}
                  onClick={handleGoBack}
                >
                  <i
                    className="fas fa-arrow-left mr-3"
                    style={{
                      color: "white",
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.73)",
                    }}
                  ></i>
                </button>
                {decode(withID.title ? withID.title : "")}
              </h4>
              <p
                style={{
                  color: "white",
                  fontSize: "14px",
                  textAlign: "justify",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.73)",
                }}
              >
                {decode(withID.desc).substring(0, 500)}
                {/* Menampilkan 200 huruf pertama */}
                {withID.desc.length > 500 && "..."}
              </p>
              {AppContext_test.klaim === "yes" ? (
                <div style={{ color: "white", fontWeight: "bold" }}>
                  Kelas Anda{" "}
                  <div>
                    <button
                      className="btn btn-outline-primary mt-3"
                      type="button"
                      style={{
                        fontSize: "15px",
                        marginTop: "-10px",
                        color: "white",
                        borderColor: "white",
                      }}
                      onClick={handleBelajarClick}
                    >
                      <i className="fas fa-play mr-2"></i>Belajar
                    </button>
                  </div>
                </div>
              ) : withID.harga && withID.harga > 0 ? (
                <div>
                  <div style={{ color: "red", fontWeight: "bold" }}>
                    <p
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "35px",
                      }}
                    >
                      Rp.{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })
                        .format(withID.harga)
                        .replace("Rp", "")
                        .trim()}
                    </p>
                  </div>
                  <div>
                    <button
                      className="btn btn-outline-primary mt-3"
                      type="button"
                      style={{
                        fontSize: "15px",
                        marginTop: "-10px",
                        color: "white",
                        borderColor: "white",
                      }}
                      onClick={() => handleBeliKelas(withID)}
                    >
                      <i className="fas fa-shopping-cart mr-2"></i> Beli Kelas
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ color: "white", fontWeight: "bold" }}>
                  Gratis{" "}
                  <div>
                    <button
                      className="btn btn-outline-primary mt-3"
                      type="button"
                      style={{
                        fontSize: "15px",
                        marginTop: "-10px",
                        color: "white",
                        borderColor: "white",
                      }}
                      onClick={handleGabungClick}
                    >
                      <i className="fas fa-add mr-2"></i>Gabung
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        </div>
        <div className="" style={{ margin: "40px 100px" }}>
          <h3 style={{ fontWeight: "500", color: "#0A5EA8" }}>Tentang Kelas</h3>
          <p
            style={{
              textAlign: "justify",
              marginTop: "20px",
              lineHeight: "30px",
            }}
          >
            {decode(withID.desc)}
          </p>
        </div>

        <div className="materi" style={{ margin: "40px 100px" }}>
          <h3 className="mb-4" style={{ fontWeight: "500", color: "#0A5EA8" }}>
            Materi Kelas
          </h3>
          {console.log("kategori", listKategoriProgram.length)}
          {listKategoriProgram.length > 0 ? (
            listKategoriProgram.map((kategori, index) => (
              <div
                key={index}
                className="section"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  padding: "10px",
                  marginBottom: "10px",
                }}
                onClick={() => toggleCategory(kategori.Key)}
              >
                <div
                  className="section-header"
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                ></div>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#555",
                    fontWeight: "bold",
                  }}
                >
                  <i
                    className={`fas ${
                      activeCategory === kategori.Key
                        ? "fa-chevron-up"
                        : "fa-chevron-down"
                    } mr-3 ml-3`}
                    style={{
                      fontSize: "16px",
                    }}
                  ></i>
                  {kategori["Nama Kategori Program"] || "Tidak ada deskripsi."}{" "}
                  <br />
                </p>
                {activeCategory === kategori.Key && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      borderTop: "1px solid #ccc",
                    }}
                  >
                    {console.log("data materii", listMateri)}
                    {listMateri.length > 0 ? (
                      listMateri
                        .filter((materi) => materi.Status === "Aktif")
                        .map((materi, materiIndex) => (
                          <div
                            className="d-flex"
                            key={materiIndex}
                            style={{
                              background: "#f9f9f9",
                              marginBottom: "8px",
                              padding: "8px",
                              borderRadius: "5px",
                            }}
                          >
                            <div className="">
                              <img
                                className="cover-daftar-kk"
                                style={{ borderRadius: "20px" }}
                                height="150"
                                src={`${API_LINK}Upload/GetFile/${materi.Gambar}`}
                                width="300"
                              />
                            </div>
                            <div className="ml-3 d-flex">
                              <div className="">
                                <p
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: "600",
                                    color: "#0A5EA8",
                                    margin: "0",
                                  }}
                                >
                                  {materi.Judul || "Judul tidak tersedia"}
                                </p>
                                <p
                                  style={{
                                    fontSize: "15px",
                                    color: "#555",
                                    width: "90%",
                                    textAlign: "justify",
                                  }}
                                >
                                  {materi.Keterangan ||
                                    "Deskripsi tidak tersedia"}
                                </p>
                              </div>
                              <div className="">
                                {console.log("harga materi", withID.harga)}
                                {withID.harga &&
                                withID.harga > 0 ||
                                AppContext_test.klaim !== "yes" ? (
                                  <button
                                    className="btn btn-secondary mt-4 ml-2 mr-4"
                                    type="button"
                                    title="Kelas ini berbayar"
                                     onClick={() => {
                                      Swal.fire({
                                        icon: "info",
                                        title: "Akses Ditolak",
                                        text: "Anda harus mengklaim kelas ini terlebih dahulu!",
                                        confirmButtonColor: "#3085d6"
                                      });
                                    }}  
                                  >
                                    <i className="fas fa-lock"></i> Kunci
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-outline-primary mt-4 ml-2 mr-4"
                                    type="button"
                                    onClick={() => handleBacaMateri(materi)}
                                  >
                                    Baca
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <Alert
                        type="warning mt-3"
                        message="Tidak ada materi yang tersedia pada kategori ini"
                      />
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <Alert
              type="warning mt-3"
              message="Tidak ada kategori program yang tersedia"
            />
          )}
        </div>
        <>
          {isError.error && (
            <div className="flex-fill">
              <Alert type="danger" message={isError.message} />
            </div>
          )}
        </>

        {showModal && (
          <div
            className="modal"
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "10px",
                width: "600px",
                maxWidth: "100%",
              }}
            >
              <div className="modal-header" style={{ marginBottom: "10px" }}>
                <h4>Klaim Kelas Training</h4>
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: "5px 15px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    {" "}
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <p style={{ padding: "0px 20px" }}>
                Sebelum memulai kelas, kasih tahu tingkat pemahaman materi kamu.
              </p>
              <div className="modal-body">
                <div style={{ marginBottom: "20px" }}>
                  <label>Seberapa paham kamu terhadap materi ini?</label>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <span style={{ color: "red", fontWeight: "600" }}>
                      Sangat Tidak Paham
                    </span>
                    <span style={{ color: "green", fontWeight: "600" }}>
                      Sangat Paham
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    {[...Array(10)].map((_, index) => (
                      <label
                        key={index}
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        <input
                          type="radio"
                          name="level"
                          value={index + 1}
                          checked={selectedValue === index + 1}
                          onChange={(e) =>
                            setSelectedValue(Number(e.target.value))
                          }
                          style={{ marginRight: "5px" }}
                        />
                        {index + 1}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="d-flex">
                  <button
                    type="button"
                    onClick={closeModal}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "transparent",
                      color: "#0E6EFE",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      width: "100%",
                      fontWeight: "600",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleClaim}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "green",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      width: "100%",
                      fontWeight: "600",
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSkalaModal && (
          <div
            className="modal"
            style={{
              position: "fixed",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                width: "600px",
                maxWidth: "100%",
              }}
            >
              <p style={{ padding: "0px 10px" }}>
                Sebelum memulai kelas, beri tahu tingkat pemahaman materi kamu.
              </p>
              <div
                className="modal-body"
                style={{ margin: "0px", padding: "10px" }}
              ></div>
            </div>
          </div>
        )}

        <></>

        {showConfirmation && (
          <Konfirmasi
            title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
            pesan={
              isBackAction
                ? "Apakah anda ingin kembali?"
                : "Anda yakin ingin simpan data?"
            }
            onYes={handleConfirmYes}
            onNo={handleConfirmNo}
          />
        )}
      </div>
    </AnimatedSection>
  );
}
