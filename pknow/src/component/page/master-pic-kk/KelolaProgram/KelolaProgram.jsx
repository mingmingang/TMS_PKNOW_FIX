import { useEffect, useRef, useState } from "react";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button copy";
import Loading from "../../../part/Loading";
import Icon from "../../../part/Icon";
import CardProgram from "../../../part/CardProgram";
import ScrollIntoView from "react-scroll-into-view";
import CardKategoriProgram from "../../../part/CardKategoriProgram";
import Alert from "../../../part/Alert";
import SweetAlert from "../../../util/SweetAlert";
import Label from "../../../part/Label";
import Search from "../../../part/Search";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";

export default function ProgramIndex({ onChangePage }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  
  const cardRefs = useRef([]);
  const [activeCard, setActiveCard] = useState(null);
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(null);
  const [listProgram, setListProgram] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);
  const [listKategoriProgram, setListKategoriProgram] = useState([
    { Message: "" },
  ]);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "",
    KKid: "",
  });

  const handleCardClick = (id, index) => {
    getListKategoriProgram(id);
    setActiveCard(activeCard === id ? null : id);
    if (cardRefs.current[index]) {
      cardRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  const getUserKryID = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Utilities/GetUserLogin", {
          param: activeUser,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setUserData(data[0]);
          setCurrentFilter((prevFilter) => ({
            ...prevFilter,
            kry_id: data[0].kry_id,
          }));
          break;
        }
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  };

  useEffect(() => {
    getUserKryID();
  }, []);

  const getKK = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Program/GetDataKKByPIC");
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setCurrentData(data[0]);
          setCurrentFilter((prevFilter) => ({
            ...prevFilter,
            KKid: data[0].Key,
          }));
          console.log(JSON.stringify(data));
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError({ error: true, message: e.message });
    }
  };

  const getListProgram = async (filter) => {
    console.log("data filter",filter);
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Program/GetProgram", filter);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data program.");
        } else if (data === "data kosong") {
          setListProgram([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListProgram(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError({ error: true, message: e.message });
    }
  };

  const getListAnggota = async (filter) => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] asc",
          status: "Aktif",
          kkeID: filter,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data === "data kosong") {
          setListAnggota([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const getListKategoriProgram = async (filter) => {
    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "KategoriProgram/GetKategoriByProgram",
          {
            page: 1,
            query: "",
            sort: "[Nama Kategori] asc",
            status: "",
            kkeID: filter,
          }
        );

        console.log("data kategori:",data)

        if (data === "ERROR") {
          throw new Error(
            "Terjadi kesalahan: Gagal mengambil daftar kategori program."
          );
        } else if (data === "data kosong") {
          setListKategoriProgram([]);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
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
      await getKK();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentFilter.KKid) {
      getListProgram(currentFilter);
      getListAnggota(currentFilter.KKid);
      console.log(JSON.stringify("CURR: "+JSON.stringify(currentData)));

    }
  }, [currentFilter]);

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  // DELETE PERMANEN DATA PROGRAM
  function handleDelete(id) {
    setIsError(false);

    SweetAlert(
      "Konfirmasi Hapus",
      "Anda yakin ingin <b>menghapus permanen</b> data ini?",
      "warning",
      "Hapus"
    ).then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "Program/DeleteProgram", {
          idProgram: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else if (data[0].hasil === "GAGAL") {
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menghapus program karena sudah terdapat Draft Kategori.",
              });
            } else {
              SweetAlert("Sukses", "Data berhasil dihapus.", "success")
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  // MENGUBAH STATUS PROGRAM
  function handleSetStatus(data, status) {
    setIsError(false);

    let message;

    if (data.Status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.Status === "Aktif")
      message = "Apakah anda yakin ingin menonaktifkan data ini?";
    else if (data.Status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "Program/SetStatusProgram", {
          idProgram: data.Key,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else if (data[0].hasil === "ERROR KATEGORI AKTIF") {
              console.log(data);
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal menonaktifkan Program karena terdapat kategori berstatus Aktif.",
              });
            } else {
              let message;
              if (status === "Tidak Aktif") {
                message = "Data berhasil dinonaktifkan.";
              } else if (status === "Aktif") {
                message = "Sukses! Data berhasil dipublikasi.";
              }
              SweetAlert("Sukses", message, "success");
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  // DELETE PERMANEN DATA MATA KULIAH
  function handleDeleteKategori(id) {
    setIsError(false);
    SweetAlert(
      "Konfirmasi Hapus",
      "Anda yakin ingin menghapus permanen data ini?",
      "warning",
      "Hapus"
    ).then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "KategoriProgram/DeleteKategoriProgram", {
          idKat: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert("Sukses", "Data berhasil dihapus.", "success");
              window.location.reload();
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  // MENGUBAH STATUS MATA KULIAH
  function handleSetStatusKategori(data, status) {
    setIsError(false);
    let message;
    if (data.Status === "Draft")
      message = "Apakah anda yakin ingin mempublikasikan data ini?";
    else if (data.Status === "Aktif")
      message = "Apakah anda yakin ingin menonaktifkan data ini?";
    else if (data.Status === "Tidak Aktif")
      message = "Apakah anda yakin ingin mengaktifkan data ini?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "KategoriProgram/SetStatusKategoriProgram", {
          idKat: data.Key,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else if (data[0].hasil === "ERROR PROGRAM DRAFT") {
              console.log(data);
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal publikasi Kategori karena Program masih berstatus Draft.",
              });
            } else if (data[0].hasil === "ERROR PROGRAM TIDAK AKTIF") {
              console.log(data);
              setIsError({
                error: true,
                message:
                  "Terjadi kesalahan: Gagal mengaktifkan Kategori karena Program berstatus Tidak aktif.",
              });
            } else {
              let message;
              if (status === "Tidak Aktif") {
                message = "Data berhasil dinonaktifkan.";
              } else if (status === "Aktif") {
                message = "Sukses! Data berhasil dipublikasi.";
              }
              SweetAlert("Sukses", message, "success");
              setActiveCard(null);
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  return (
    <div className="app-container">
          <Search
                    title="Kelola Program"
                    description="ASTRAtech memiliki banyak program studi, di dalam program studi terdapat kelompok keahlian yang biasa disebut dengan Kelompok Keahlian."
                    showInput={false}
                />
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      {isLoading ? (
        <Loading />
      ) : (
        
        <div className="d-flex flex-column">
           <h5
                        className="px-3 py-2 fw-bold"
                        style={{color:"#0A5EA8", margin:"5px 50px", fontSize:"30px"}}
                      >
                        {currentData["Nama Kelompok Keahlian"]}
                      </h5>
          <div className="flex-fill">
            <div className="container">
              <div className="row gx-4">
                <div className="col-md-12">
                  <div
                    className="card p-0 mb-3"
                    style={{
                      border: "",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="card-body p-0">
                      <div className="card-body px-3">
                        <div className="d-flex justify-content-between align-items-center" >
                          <h6 className="card-programtitle mb-0">
                            <Icon
                              name="align-left"
                              type="Bold"
                              cssClass="btn px-2 py-0"
                              title="Program"
                              style={{color:"#0A5EA8"}}
                            />
                            <span>
                              <a
                                href=""
                                className="text-decoration-none text-dark"
                              >
                                {listProgram[0]?.Message
                                  ? "0"
                                  : listProgram.length}{" "}
                                Program
                              </a>
                            </span>
                            <Icon
                              name="users"
                              type="Bold"
                              cssClass="btn px-2 py-0 ms-3"
                              title="Anggota Kelompok Keahlian"
                              style={{color:"#0A5EA8"}}
                            />
                            <span>
                              <a
                                href="#modalAnggota"
                                data-bs-toggle="modal"
                                data-bs-target="#modalAnggota"
                                className="text-decoration-none text-dark"
                              >
                                {listAnggota[0]?.Message
                                  ? "0"
                                  : listAnggota.length}{" "}
                                Anggota
                              </a>
                            </span>
                          </h6>
                          <div className="action d-flex">
                            <Button
                              iconName="add"
                              classType="primary  me-2 rounded-3 py-2"
                              style={{marginRight:"10px"}}
                              label="Tambah Program"
                              onClick={() => onChangePage("add", currentData)}
                            />
                            <Button
                              iconName="list"
                              classType="btn-sm px-3 me-2"
                              title="Detail Kelompok Keahlian"
                              onClick={() => onChangePage("detailPublish",currentData)}
                              style={{background:"white", color:"#0A5EA8",  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", fontSize:"18px", padding:"5px 10px" }}
                            />
                          </div>
                        </div>
                        
                        <p className="lh-sm mt-4">{currentData.Deskripsi}</p>
                        <h5 className="py-2"  style={{color:"#0A5EA8"}}>
                          Daftar Program dalam Kelompok Keahlian{" "}
                          <strong>
                            {currentData["Nama Kelompok Keahlian"]}
                          </strong>
                        </h5>
                        {listProgram[0]?.Message ? (
                          <Alert
                            type="warning"
                            message="Tidak ada data! Silahkan klik tombol tambah program diatas.."
                          />
                        ) : (
                          listProgram.map((value, index) => (
                            <ScrollIntoView
                              key={value.Key}
                              selector={`#card-${value.Key}`}
                              smooth={true}
                              alignToTop={false}
                            >
                              <CardProgram
                                id={`card-${value.Key}`}
                                data={value}
                                isActive={activeCard === value.Key}
                                onClick={() =>
                                  handleCardClick(value.Key, index)
                                }
                                onChangePage={onChangePage}
                                onDelete={handleDelete}
                                onChangeStatus={handleSetStatus}
                                index={index + 1}
                                
                              >
                                {listKategoriProgram[0]?.Message ? (
                                  <div className="" style={{marginTop:"20px"}}>
                                  <Alert
                                    type="warning"
                                    message="Tidak ada data! Silahkan klik tombol tambah diatas.."
                                  />
                                  </div>
                                ) : (
                                  <div>
                                   
                                    <div className="row row-cols-3">
                                      {listKategoriProgram.map(
                                        (kat, indexKat) => (
                                          <CardKategoriProgram
                                            key={kat.id}
                                            data={kat}
                                            onChangePage={onChangePage}
                                            onDelete={handleDeleteKategori}
                                            onChangeStatus={
                                              handleSetStatusKategori
                                            }
                                            index={`${index + 1}-${
                                              indexKat + 1
                                            }`}
                                          />
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </CardProgram>
                            </ScrollIntoView>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal fade"
            id="modalAnggota"
            tabindex="-1"
            aria-labelledby="Anggota Kelompok Keahlian"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="modalAnggotaKK">
                    Anggota Kelompok Keahlian
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {listAnggota[0]?.Message ? (
                    <Label title="Tidak ada anggota aktif!" />
                  ) : (
                    listAnggota.map((pr, index) => (
                      <>
                      <div className="card-profile mb-3 d-flex shadow-sm">
                        <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary">
                          {index + 1}
                        </p>
                        <div
                          className="bg-primary"
                          style={{ width: "1.5%" }}
                        ></div>
                        <div className="p-1 ps-2 d-flex">
                          <img
                            src="https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"
                            alt={pr["Nama Anggota"]}
                            className="img-fluid rounded-circle"
                            width="45"
                          />
                          <div className="ps-3">
                            <p className="mb-0 fw-semibold">
                              {pr["Nama Anggota"]}
                            </p>
                            <p className="mb-0" style={{ fontSize: "13px" }}>
                              {pr.Prodi}
                            </p>
                          </div>
                        </div>
                      </div>
                      </>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    </div>
  );
}
