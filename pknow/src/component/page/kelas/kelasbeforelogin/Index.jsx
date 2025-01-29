import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK } from "../../../util/Constants";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import "../../../../style/Beranda.css";
import Button2 from "../../../part/Button copy";
import CardKK from "../../../part/CardClassTraining";
import Alert from "../../../part/Alert";
import Paging from "../../../part/Paging";
import Input from "../../../part/Input";
import Header from "../../../backbone/Header";
import Footer from "../../../backbone/Footer";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import "../../../../style/Search.css";
import "../../../../../src/index.css";

const programStudi = [
  { id: 1, name: "Teknik Informatika" },
  { id: 2, name: "Manajemen Bisnis" },
  { id: 3, name: "Desain Produk" },
  { id: 4, name: "Teknik Mesin" },
  { id: 5, name: "Teknik Elektro" },
];

const level = [
  { id: 1, name: "Pemula" },
  { id: 2, name: "Menengah" },
  { id: 3, name: "Ahli" },
];

const kategori = [
  { id: 1, name: "Gratis" },
  { id: 2, name: "Berbayar" },
];

export default function KelolaKK({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDataAktif, setCurrentDataAktif] = useState([]);
  const [currentFilterAktif, setCurrentFilterAktif] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
  });

  const searchQuery = useRef();
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilterAktif((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
    }));
  }

  const getListKKAktif = async () => {
    setIsError(false);
    setIsLoading(true);
    try {
      const data = await UseFetch(API_LINK + "Program/GetProgramAll", currentFilterAktif);
      if (!data || data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
      }
      console.log("dataa",data)
      setCurrentDataAktif(data);
      setIsLoading(false);
    } catch (e) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListKKAktif();
  }, [currentFilterAktif]);

  const handleSelection = (event) => {
    setSelectedProgram(event.target.value);
    console.log("Program yang dipilih:", event.target.value);
  };

  return (
    <>
      <Header showUserInfo={false} />
      <div className="app-container">
        <main>
        <div className="backSearch">
          <h1>Mau belajar apa hari ini?</h1>
          <p>
          Mari bergabung di kelas ternama kami, ilmu yang diberikan pasti bermanfaat untuk anda.
          </p>
          <div className="input-wrapper">
            <div
              className=""
              style={{
                width: "700px",
                display: "flex",
                backgroundColor: "white",
                borderRadius: "20px",
                height: "40px",
              }}
            >
              <Input
                ref={searchQuery}
                forInput="pencarianKK"
                placeholder="Cari Kelas"
                style={{
                  border: "none",
                  width: "680px",
                  height: "40px",
                  borderRadius: "20px",
                }}
              />
              <Button2
                iconName="search"
                classType="px-4"
                title="Cari"
                onClick={handleSearch}
                style={{ backgroundColor: "transparent", color: "#08549F" }}
              />
            </div>
          </div>
        </div>

        <div className="navigasi-layout-page">
          <p className="title-kk">Kelas Training</p>
        </div>


        <div className="d-flex justify-content-between mb-4" style={{margin:"0px 80px"}}>
        <div className="" style={{ textAlign: "center" }}>
      <select
        id="programStudi"
        value={selectedProgram}
        onChange={handleSelection}
        style={{
          padding: "10px",
          borderRadius: "15px",
          border: "1px solid #ccc",
          fontSize: "16px",
          width: "400px",
        }}
      >
        <option value="" disabled>
          Pilih Program Studi
        </option>
        {programStudi.map((program) => (
          <option key={program.id} value={program.name}>
            {program.name}
          </option>
        ))}
      </select>
      {selectedProgram && (
        // <p style={{ marginTop: "20px", color: "#333", fontWeight: "bold" }}>
        //   Anda memilih: {selectedProgram}
        // </p>
        <div className=""></div>
      )}
    </div>

    <div className="" style={{ textAlign: "center" }}>
      <select
        id="programStudi"
        value={selectedProgram}
        onChange={handleSelection}
        style={{
          padding: "10px",
          borderRadius: "15px",
          border: "1px solid #ccc",
          fontSize: "16px",
          width: "400px",
        }}
      >
        <option value="" disabled>
          Pilih Kategori Level
        </option>
        {level.map((program) => (
          <option key={program.id} value={program.name}>
            {program.name}
          </option>
        ))}
      </select>
      {selectedProgram && (
        // <p style={{ marginTop: "20px", color: "#333", fontWeight: "bold" }}>
        //   Anda memilih: {selectedProgram}
        // </p>
        <div className=""></div>
      )}
    </div>

    <div className="" style={{ textAlign: "center" }}>
      <select
        id="programStudi"
        value={selectedProgram}
        onChange={handleSelection}
        style={{
          padding: "10px",
          borderRadius: "15px",
          border: "1px solid #ccc",
          fontSize: "16px",
          width: "400px",
        }}
      >
        <option value="" disabled>
          Pilih Kategori Kelas
        </option>
        {kategori.map((program) => (
          <option key={program.id} value={program.name}>
            {program.name}
          </option>
        ))}
      </select>
      {selectedProgram && (
        // <p style={{ marginTop: "20px", color: "#333", fontWeight: "bold" }}>
        //   Anda memilih: {selectedProgram}
        // </p>
        <div className=""></div>
      )}
    </div>
    </div>

          <div className="container">
            {isLoading ? (
              <Alert type="info mt-3" message="Memuat data..." />
            ) : isError ? (
              <Alert type="danger mt-3" message="Gagal memuat data." />
            ) : currentDataAktif.length === 0 ? (
              <Alert type="warning mt-3" message="Tidak ada data!" />
            ) : (
              <>
                <div className="row mt-0 gx-4">
                  {currentDataAktif
                  .filter(value => value.Publikasi === "Terpublikasi")
                  .map((value, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                      <CardKK
                        data={{
                          id: value.Key,
                          title: value["Nama Program"],
                          desc: value.Deskripsi,
                          status: value.Status,
                          gambar: value.Gambar,
                          ProgramStudi: value.ProgramStudi,
                          publikasi: value.Publikasi,
                          harga: value.Harga
                        }}
                        noLogin="yes"
                        onChangePage={onChangePage}
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-4 d-flex justify-content-center">
                  <Paging
                    pageSize={PAGE_SIZE}
                    pageCurrent={currentFilterAktif.page}
                    totalData={currentDataAktif[0]?.Count || 0}
                    navigation={(page) => setCurrentFilterAktif({ ...currentFilterAktif, page })}
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
