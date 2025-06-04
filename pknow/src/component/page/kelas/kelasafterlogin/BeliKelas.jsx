import { useEffect, useRef, useState } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Alert from "../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import { decode } from "he";
import Konfirmasi from "../../../part/Konfirmasi";
import Select2Dropdown from "../../../part/Select2Dropdown";
import Input from "../../../part/Input";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import pemula from "../../../../assets/Pemula.png";
import menengah from "../../../../assets/Menengah.png";
import mahir from "../../../../assets/Mahir.png";
import barcode from "../../../../assets/barcode.png";
import FileUpload from "../../../part/FileUpload";
import UploadFile from "../../../util/UploadFile";
import AnimatedSection from "../../../part/AnimatedSection";

export default function PublikasiKelas({ withID, onChangePage }) {
  console.log("data", withID);
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  const [activeCategory, setActiveCategory] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [listKategoriProgram, setListKategoriProgram] = useState([]);
  const [listMetode, setListMetode] = useState([]);
  const [listKategoriMetode, setListKategoriMetode] = useState([]);
  const [listMateri, setlistMateri] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);
  const [errors, setErrors] = useState({});

  const [isBerbayar, setIsBerbayar] = useState(false); // Default Gratis

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
    KKid: "",
  });

  const formDataRef = useRef({
    kke_id: withID.id,
    level_kelas: "",
    tipe_kelas: "",
    metode_pembayaran: "",
    virtual_account: "",
    periode: "",
    harga_kelas: "",
  });

  const [filePreview, setFilePreview] = useState(false);
  const fileGambarRef = useRef(null);
  const fileDocumentRef = useRef(null);

  const userSchema = object({
    kke_id: string().required("Pilih Terlebih Dahulu"),
    level_kelas: string().required("Pilih File Pustaka Terlebih Dahulu"),
    tipe_kelas: string()
      .max(30, "Maksimal 30 Karakter")
      .required("Isi Judul Terlebih Dahulu"),
    metode_pembayaran: string(),
    virtual_account: string().max(200, "Maksimal 200 Karakter"),
    periode: string(),
    harga_kelas: string()
      .max(12, "Maksimal 12 Angka")
      .test(
        "is-numeric",
        "Harus berupa angka",
        (value) => !value || /^\d+$/.test(value.replace(/\./g, ""))
      ),
  });

  const resetForm = () => {
    formDataRef.current = {
      level_kelas: "",
      tipe_kelas: "",
      metode_pembayaran: "",
      virtual_account: "",
      periode: "",
    };
    setFilePreview(false);
    setErrors({});
    if (fileGambarRef.current) {
      fileGambarRef.current.value = null;
    }
    if (fileDocumentRef.current) {
      fileDocumentRef.current.value = null;
    }
  };

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("detail", withID);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const getListKategoriProgram = async (filter) => {
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

  const getMetodePembayaran = async () => {
    try {
      let data = await UseFetch(API_LINK + "Program/GetMetodePembayaran", {});

      if (!data || data.length === 0) {
        throw new Error("Data kosong atau tidak tersedia.");
      } else {
        setListMetode(data); // Simpan data ke state jika diperlukan
      }
    } catch (e) {
      console.log(e.message);
      setIsError({
        error: true,
        message: e.message,
      });
    }
  };

  const getKategoriMetode = async () => {
    try {
      let data = await UseFetch(API_LINK + "Program/GetKategoriMetode", {
        id: formDataRef.current.metode_pembayaran,
      });

      if (!data || data.length === 0) {
        throw new Error("Data kosong atau tidak tersedia.");
      } else {
        setListKategoriMetode(data); // Simpan data ke state jika diperlukan
      }
    } catch (e) {
      console.log(e.message);
      setIsError({
        error: true,
        message: e.message,
      });
    }
  };

  useEffect(() => {
    getMetodePembayaran();
  }, []);

  useEffect(() => {
    getKategoriMetode();
  }, [formDataRef.current.metode_pembayaran]);

  useEffect(() => {
    const fetchData = async () => {
      await getListKategoriProgram();
    };

    fetchData();
  }, []);

  const getDataMateriKategori = async (index) => {
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

  const handleFileChange = (ref, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file ? file.name : "";
    const fileSize = file ? file.size : 0;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) ref.current.value = "";
    else {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result); // Set the preview
        };
        reader.readAsDataURL(file);
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});

      try {
        const isGratis = formDataRef.current.tipe_kelas === "gratis";

        // Konversi harga_kelas ke number (pastikan sudah tanpa titik)
        const hargaKelas = formDataRef.current.harga_kelas
          ? parseInt(formDataRef.current.harga_kelas.replace(/\./g, ""))
          : null;

        const data = await UseFetch(API_LINK + "Program/PublikasiProgram", {
          prg_id: withID.id,
          prg_level: formDataRef.current.level_kelas,
          prg_tipe: formDataRef.current.tipe_kelas,
          prg_pembayaran: isGratis
            ? null
            : formDataRef.current.metode_pembayaran,
          prg_harga: isGratis ? null : hargaKelas,
          prg_periode: formDataRef.current.periode,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal menyimpan data.");
        } else {
          SweetAlert("Sukses", "Program berhasil dipublikasikan", "success");
          onChangePage("index");
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
    } else window.scrollTo(0, 0);
  };

  const deskripsiRef = useRef(null);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "tipe_kelas") {
      setIsBerbayar(value === "berbayar");
    }

    // Khusus untuk field harga_kelas
    if (name === "harga_kelas") {
      // Hapus semua karakter non-digit
      const numericValue = value.replace(/[^0-9]/g, "");

      // Format ke format ribuan
      const formattedValue =
        numericValue === "" ? "" : Number(numericValue).toLocaleString("id-ID");

      // Simpan nilai asli (tanpa format) di formDataRef
      formDataRef.current[name] = numericValue;

      // Update nilai yang ditampilkan di input dengan format ribuan
      e.target.value = formattedValue;
    } else {
      formDataRef.current[name] = value;
    }

    const validationError = await validateInput(
      name,
      name === "harga_kelas" ? formDataRef.current[name] : value,
      userSchema
    );

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validationError.error,
    }));
  };

  const handleDocumentChange = async (ref, extAllowed, maxFileSize) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024 / 1024 > maxFileSize) {
      error = `Berkas terlalu besar, maksimal ${maxFileSize}MB`;
      SweetAlert("Error", error, "error");
    } else if (!extAllowed.split(",").includes(fileExt)) {
      error = "Format berkas tidak valid";
      SweetAlert("Error", error, "error");
    }
    if (error) ref.current.value = "";

    formDataRef.current[name] = fileName;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  const metodePembayaranOptions = [
    { Value: "va", Text: "Virtual Account (BCA, Mandiri, dll.)" },
    { Value: "ewallet", Text: "E-Wallet (OVO, GoPay, dll.)" },
    { Value: "bank_transfer", Text: "Transfer Bank (Manual)" },
  ];

  const levelKelasOptions = [
    { Value: "pemula", Text: "Pemula" },
    { Value: "menengah", Text: "Menengah" },
    { Value: "mahir", Text: "Mahir" },
  ];

  const tipeKelasOptions = [
    { Value: "gratis", Text: "Gratis" },
    { Value: "berbayar", Text: "Berbayar" },
  ];

  const periodeOptions = [
    { Value: "1", Text: "1 Bulan" },
    { Value: "3", Text: "3 Bulan" },
    { Value: "6", Text: "6 Bulan" },
    { Value: "12", Text: "12 Bulan" },
    { Value: "9999", Text: "Lifetime" },
  ];

  return (
    <AnimatedSection>
      <div className="d-flex">
        <div className="" style={{ width: "50%" }}>
          <div className="" style={{ marginTop: "100px" }}></div>
          <div className="d-flex " style={{ marginLeft: "80px" }}>
            <button
              style={{ backgroundColor: "transparent", border: "none" }}
              onClick={handleGoBack}
            >
              <i
                className="fas fa-arrow-left mr-3"
                style={{ color: "#0A5EA8", fontSize: "28px" }}
              ></i>
            </button>
            <p
              className="mt-3"
              style={{ fontSize: "28px", fontWeight: "600", color: "#0A5EA8" }}
            >
              Formulir Klaim Kelas
            </p>
          </div>

          <form onSubmit={handleAdd}>
            <div
              className="card"
              style={{
                margin: "10px 70px",
                borderRadius: "20px",
                textAlign: "left",
              }}
            >
              <div className="card-body p-4">
                <div className="row mb-3">
                  <div className="d-flex">
                    <img
                      src={`${API_LINK}Upload/GetFile/${withID.gambar}`}
                      alt="Preview"
                      style={{
                        width: "200px",
                        borderRadius: "25px",
                      }}
                    />
                    <div className="ml-2">
                      <h4
                        style={{
                          color: "#0A5EA8",
                          textAlign: "left",
                          paddingBottom: "0px",
                          fontWeight: "bold",
                        }}
                      >
                        {withID.title}
                      </h4>
                      <h6
                        style={{
                          color: "#0A5EA8",
                          textAlign: "left",
                          paddingBottom: "0px",
                          fontWeight: "bold",
                        }}
                      >
                        Harga:{" "}
                        <span style={{ color: "red" }}>
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          })
                            .format(withID.harga)
                            .replace("Rp", "Rp.")}
                        </span>
                      </h6>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <label
                        className="form-label"
                        style={{ fontWeight: "bold", textAlign: "left" }}
                      >
                        Level Kelas
                      </label>
                      <p>
                        {withID.level.charAt(0).toUpperCase() +
                          withID.level.slice(1)}
                      </p>
                      {/* <div className="d-flex align-items-center gap-3 mb-3 ml-4 justify-content-between">
                      {levelKelasOptions.map((option, index) => (
                        <div key={index} className="d-flex align-items-center">
                          <input
                            type="radio"
                            id={`level_kelas_${option.Value}`}
                            name="level_kelas"
                            value={option.Value}
                            className="form-check-input"
                            checked={
                              formDataRef.current.level_kelas === option.Value
                            }
                            onChange={(e) => handleInputChange(e)}
                            style={{ marginRight: "5px" }}
                          />
                          {option.Value === "pemula" && (
                            <img
                              src={pemula} // Replace with the correct path or variable for the image
                              alt="Pemula"
                              style={{
                                width: "30px",
                                height: "30px",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          {option.Value === "menengah" && (
                            <img
                              src={menengah} // Replace with the correct path or variable for the image
                              alt="Menengah"
                              style={{
                                width: "30px",
                                height: "30px",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          {option.Value === "mahir" && (
                            <img
                              src={mahir} // Replace with the correct path or variable for the image
                              alt="Mahir"
                              style={{
                                width: "30px",
                                height: "30px",
                                marginRight: "10px",
                              }}
                            />
                          )}
                          <label
                            htmlFor={`level_kelas_${option.Value}`}
                            className="form-check-label"
                            style={{ marginRight: "20px" }}
                          >
                            {option.Text}
                          </label>
                        </div>
                      ))}
                    </div> */}
                      {errors.level_kelas && (
                        <div className="text-danger">{errors.level_kelas}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <label
                        className="form-label"
                        style={{ fontWeight: "bold", textAlign: "left" }}
                      >
                        Periode Kelas
                      </label>
                      <p>{withID.periode} Bulan</p>
                      {errors.level_kelas && (
                        <div className="text-danger">{errors.level_kelas}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <label
                        className="form-label"
                        style={{ fontWeight: "bold", textAlign: "left" }}
                      >
                        Metode Pembayaran
                      </label>
                      <p>{withID.metode}</p>
                      {errors.level_kelas && (
                        <div className="text-danger">{errors.level_kelas}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <label
                        className="form-label"
                        style={{ fontWeight: "bold", textAlign: "left" }}
                      >
                        Virtual Account
                      </label>
                      {errors.level_kelas && (
                        <div className="text-danger">{errors.level_kelas}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <label
                        className="form-label"
                        style={{
                          fontWeight: "300",
                          textAlign: "justify",
                          fontSize: "14px",
                        }}
                      >
                        Mohon pindai barcode yang ditampilkan dibawah untuk
                        melanjutkan pembayaran!
                      </label>
                      {errors.level_kelas && (
                        <div className="text-danger">{errors.level_kelas}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="">
                    <div className="" style={{ textAlign: "center" }}>
                      <img
                        src={barcode}
                        alt="Preview"
                        style={{
                          width: "200px",
                          borderRadius: "25px",
                        }}
                      />
                      {errors.level_kelas && (
                        <div className="text-danger">{errors.level_kelas}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="">
                    <div className="d-flex justify-content-between mt-2">
                      <FileUpload
                        forInput="gambarAlatMesin"
                        label="Bukti Pembayaran"
                        formatFile=".png"
                        ref={fileGambarRef}
                        onChange={() => handleFileChange(fileGambarRef, "png")}
                        errorMessage={errors.gambar}
                        isRequired={true}
                      />

                      {errors.level_kelas && (
                        <div className="text-danger">{errors.level_kelas}</div>
                      )}
                    </div>
                  </div>
                </div>

                {isBerbayar && (
                  <>
                    <div className="row">
                      <div className="">
                        <div className="">
                          <Select2Dropdown
                            forInput="metode_pembayaran"
                            label="Metode Pembayaran"
                            arrData={listMetode}
                            isRequired
                            value={formDataRef.current.metode_pembayaran}
                            onChange={handleInputChange}
                            errorMessage={errors.metode_pembayaran}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Virtual Account */}
                    <div className="row">
                      <div className="">
                        <div className="">
                          <Select2Dropdown
                            forInput="virtual_account"
                            label="Kategori Metode"
                            arrData={listKategoriMetode}
                            isRequired
                            value={formDataRef.current.virtual_account}
                            onChange={handleInputChange}
                            errorMessage={errors.virtual_account}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="">
                        <div className="">
                          <Input
                            type="text"
                            name="harga_kelas" // Pastikan name sesuai dengan formDataRef
                            forInput="harga_kelas"
                            label="Harga Kelas (Rp.)"
                            isRequired={isBerbayar}
                            value={
                              formDataRef.current.harga_kelas
                                ? Number(
                                    formDataRef.current.harga_kelas
                                  ).toLocaleString("id-ID")
                                : ""
                            }
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                              // Hanya izinkan tombol angka, backspace, delete, tab, arrow keys
                              if (
                                !/[0-9]|Backspace|Delete|Tab|ArrowLeft|ArrowRight/.test(
                                  e.key
                                )
                              ) {
                                e.preventDefault();
                              }
                            }}
                            errorMessage={errors.harga_kelas}
                            placeholder="Masukan Nominal Harga"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div
                className="d-flex justify-content-end"
                style={{
                  marginRight: "20px",
                  marginTop: "-10px",
                  marginBottom: "20px",
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  type="button"
                  onClick={resetForm}
                  style={{
                    marginRight: "10px",
                    padding: "5px 15px",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Batalkan
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  type="submit"
                  style={{
                    marginRight: "10px",
                    padding: "5px 20px",
                    fontWeight: "bold",
                    borderRadius: "10px",
                  }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="" style={{ width: "50%" }}>
          <div>
            <div className="">
              <h3
                style={{
                  marginTop: "100px",
                  marginBottom: "20px",
                  fontWeight: "600",
                  color: "#0A5EA8",
                }}
              >
                {" "}
                <i className="fas fa-list-ul"></i> Rincian Kelas
              </h3>
            </div>
            <img
              className="cover-daftar-kk"
              style={{
                objectFit: "cover",
                borderRadius: "40px",
              }}
              height="400"
              src={`${API_LINK}Upload/GetFile/${withID.gambar}`}
              width="700"
            />
            <h4
              style={{
                color: "#0A5EA8",
                padding: "30px",
                paddingBottom: "0px",
                fontWeight: "bold",
              }}
            >
              {withID.title}
            </h4>
            <p style={{ paddingLeft: "30px", color: "black" }}>
              Program Studi : {withID.ProgramStudi}
            </p>
          </div>
          <div className="" style={{ margin: "30px" }}>
            <h3 style={{ fontWeight: "500", color: "#0A5EA8" }}>
              Tentang Kelas
            </h3>
            <p
              style={{
                textAlign: "justify",
                marginTop: "20px",
                lineHeight: "30px",
              }}
            >
              {withID.desc}
            </p>
          </div>

          <div className="" style={{ margin: "30px" }}>
            <h3
              className="mb-4"
              style={{ fontWeight: "500", color: "#0A5EA8" }}
            >
              Materi Kelas
            </h3>

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
                    {kategori["Nama Kategori Program"] ||
                      "Tidak ada deskripsi."}{" "}
                    <br />
                  </p>
                  {/* Render list materi jika kategori ini aktif */}
                  {activeCategory === kategori.Key && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px",
                        borderTop: "1px solid #ccc",
                      }}
                    >
                      {listMateri.length > 0 ? (
                        listMateri
                          .filter((materi) => materi.Status === "Aktif") // Filter materi yang Statusnya 'Aktif'
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
                              <div className="ml-3">
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
                                    width: "100%",
                                    textAlign: "justify",
                                  }}
                                >
                                  {materi.Keterangan ||
                                    "Deskripsi tidak tersedia"}
                                </p>
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
      </div>
    </AnimatedSection>
  );
}
