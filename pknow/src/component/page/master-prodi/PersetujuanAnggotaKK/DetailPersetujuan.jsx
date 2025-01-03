import Search from "../../../part/Search";
import { useState, useEffect } from "react";
import PersetujuanKK from "../../../part/PersetujuanKK";
import UseFetch from "../../../util/UseFetch";
import { API_LINK } from "../../../util/Constants";
import Button from "../../../part/Button copy";
import DropDown from "../../../part/Dropdown";
import Input from "../../../part/Input";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import Filter from "../../../part/Filter";
import Icon from "../../../part/Icon";
import Label from "../../../part/Label";
import SweetAlert from "../../../util/SweetAlert";
import maskotPknow from "../../../../assets/pknowmaskot.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    "ID Lampiran": null,
    Lampiran: null,
    Karyawan: null,
    Status: null,
    Count: 0,
  },
];

export default function DetailPersetujuan({ onChangePage, withID }) {

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [karyawan, setKaryawan] = useState([]);
  const [listAnggota, setListAnggota] = useState([]);
  const [listNamaFile, setListNamaFile] = useState([]);
  const [detail, setDetail] = useState(inisialisasiData);

  useEffect(() => {
    if (withID) {
      setFormData(withID);
    }
  }, [withID]);

  const getListAnggota = async (idKK) => {
    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] ASC",
          status: "",
          kke_id: idKK,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
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

  useEffect(() => {
    if (formData.Key) {
      getListAnggota(formData.Key);
    }
  }, [formData]);

  const decodeHtmlEntities = (str) => {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, "text/html").body.textContent;
    return decodedString || str; // Jika decoding gagal, gunakan string asli
  };

  const getListLampiran = async (idAKK) => {
    setIsError((prevError) => ({ ...prevError, error: false }));

    try {
      let data = await UseFetch(API_LINK + "PengajuanKK/GetDetailLampiran", {
        p1: 1,
        p2: "[ID Lampiran] ASC",
        p3: idAKK,
      });
      console.log(idAKK);

      // if (data === "ERROR") {
      //   throw new Error("Terjadi kesalahan: Gagal mengambil Detail Lampiran.");
      // } else {
      //   setListNamaFile(data);
      //   const formattedData = data.map((item) => ({
      //     ...item,
      //   }));
      //   // console.log("for: " + JSON.stringify(formattedData));
      //   const promises = formattedData.map((value) => {
      //     const filePromises = [];

      //     if (value["Lampiran"]) {
      //       const filePromise = fetch(
      //         API_LINK +
      //         `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
      //           value["Lampiran"]
      //         )}`
      //       )
      //         .then((response) => response.blob())
      //         .then((blob) => {
      //           const url = URL.createObjectURL(blob);
      //           value.Lampiran = url;
      //           return value;
      //         })
      //         .catch((error) => {
      //           console.error("Error fetching file:", error);
      //           return value;
      //         });
      //       filePromises.push(filePromise);
      //     }

      //     return Promise.all(filePromises).then((results) => {
      //       const updatedValue = results.reduce(
      //         (acc, curr) => ({ ...acc, ...curr }),
      //         value
      //       );
      //       return updatedValue;
      //     });
      //   });

      //   Promise.all(promises)
      //     .then((updatedData) => {
      //       console.log("Updated data with blobs:", updatedData);
      //       setDetail(updatedData);
      //     })
      //     .catch((error) => {
      //       console.error("Error updating currentData:", error);
      //     });
      // }

      if (data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil Detail Lampiran.");
      } else if (data.length === 0) {
        setListNamaFile([]);
      } else {
        const updatedData = data.map((item) => {
          if (item.Lampiran) {
            try {
              const cleanedLampiran = decodeHtmlEntities(item.Lampiran);

              const parsedLampiran = JSON.parse(cleanedLampiran);

              const fileUrls = parsedLampiran.map((file) => {
                return `${API_LINK}Upload/GetFile/${file.pus_file}`;
              });
              return { ...item, Lampiran: fileUrls };
            } catch (err) {
              console.error("Gagal mem-parse JSON Lampiran:", err);
              return { ...item, Lampiran: [] };
            }
          }
          return item;
        });
        setDetail(updatedData);
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setDetail(null);
    }
  };

  function handleDetailLampiran(data) {
    getListLampiran(data.Key);
    setKaryawan(data);
  }

  function handleBatalkan() {
    setKaryawan({});
    setDetail([]);
  }

  function handleSetStatus(data, status) {
    setIsError(false);

    let message;

    if (status === "Aktif") message = "Apakah anda yakin ingin menyetujui?";
    else if (status === "Ditolak") message = "Apakah anda yakin ingin menolak?";

    SweetAlert("Konfirmasi", message, "info", "Ya").then((confirm) => {
      if (confirm) {
        setIsLoading(true);
        UseFetch(API_LINK + "AnggotaKK/SetStatusAnggotaKK", {
          idKK: data.Key,
          status: status,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              let message;
              if (status === "Aktif") {
                message =
                  "Sukses! Karyawan berhasil menjadi anggota keahlian..";
              } else if (status === "Ditolak") {
                message = "Berhasil. Karyawan telah ditolak..";
              }
              SweetAlert("Sukses", message, "success");
              onChangePage("index");
            }
          })
          .then(() => setIsLoading(false));
      }
    });
  }

  if (isLoading) return <Loading />;

  return (
    <>
      <div className="appcontainer">
        <main>
          <Search
            title="Persetujuan Anggota Keahlian"
            description="Program Studi dapat menyetujui persetujuan pengajuan anggota keahlian yang diajukan oleh Tenaga Pendidik untuk menjadi anggota dalam Kelompok Keahlian. Program Studi dapat melihat lampiran pengajuan dari Tenaga Pendidik untuk menjadi bahan pertimbangan"
            placeholder="Cari Kelompok Keahlian"
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
              <div style={{ marginLeft: "100px", marginRight: "100px", marginBottom: "100px", marginTop: "30px" }}>
                <div className="card mb-3 mt-2">
                  <div className="row pt-3">
                    <div className="col-lg-6 px-4 ml-3">
                      <h3 className="mb-3 fw-semibold" style={{ fontSize: "50px", color: "#0A5EA8" }}>{formData["Nama Kelompok Keahlian"]}</h3>
                      <h5 className="fw-semibold">
                        <FontAwesomeIcon icon={faGraduationCap} className="icon-style" style={{ marginRight: "10px" }} />
                        {formData.Prodi}
                      </h5>
                      <h4 className="fw-semibold" style={{ marginTop: "30px" }}>Tentang Kelompok Keahlian</h4>
                      <p className="py-2" style={{ textAlign: "justify", width: "500px" }}>
                        {formData.Deskripsi}
                      </p>
                      <div className="">
                        <i className="fas fa-user"></i>
                        <span style={{ marginLeft: "10px", fontWeight: "bold" }}>PIC : {formData.PIC}</span>
                      </div>
                    </div>
                    <div className="col-lg-1 ">
                      <img
                        className="cover-daftar-kk mt-4"
                        height="200"
                        src={`${API_LINK}Upload/GetFile/${formData.Gambar}`}
                        width="300"
                        style={{
                          width: 500,
                          height: 300,
                          borderRadius: "20px",
                          objectFit: "",
                          border: "1px solid #ccc", // Border dengan warna abu-abu muda
                          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Drop shadow
                        }}
                      />
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="row pt-2">
                      <div className="col-lg-5">
                        {/* <p>3 orang baru saja bergabung!</p> */}
                        {listAnggota
                          ?.filter((value) => {
                            return value.Status === "Aktif";
                          })
                          .map((pr, index) => (
                            <>
                            <div className="card-profile mb-2 d-flex shadow-sm rounded-4">
                              <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold ml-3" style={{color:"#0A5EA8"}}>
                                {index + 1}
                              </p>
                              <div className="p-1 ps-2 d-flex">
                                <img
                                  src={maskotPknow}
                                  alt={pr["Nama Anggota"]}
                                  className="img-fluid rounded-circle"
                                  width="45"
                                />
                                <div className="ps-3" style={{color:"#0A5EA8"}}>
                                  <p className="mb-0 fw-bold">{pr["Nama Anggota"]}</p>
                                  <p className="mb-0" style={{ fontSize: "13px" }}>
                                    {pr.Prodi}
                                  </p>
                                </div>
                              </div>
                            </div>
                            </>
                          ))}
                        {/* <div className="text-end">
                            <Button
                              classType="light btn-sm text-primary text-decoration-underline px-3 mt-2"
                              type="submit"
                              label="Lihat Semua"
                              data-bs-toggle="modal"
                              data-bs-target="#modalAnggota"
                            />
                          </div> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="fw-bold ml-3 mt-4 d-flex" style={{ justifyContent: "space-between", marginRight: "20px" }} >
                    <span style={{ fontSize: "25px", color: "#0A5EA8" }}>
                      Menunggu Persetujuan
                    </span>
                    <h6 className="mb-3 mt-3 d-flex fw-bold" style={{ color: "#0A5EA8" }}>
                      {
                        listAnggota?.filter((value) => {
                          return value.Status === "Menunggu Acc";
                        }).length
                      }{" "}
                      Tenaga Pendidik Menunggu Persetujuan
                    </h6>
                  </div>


                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-6">

                        {listAnggota
                          ?.filter((value) => {
                            return value.Status === "Menunggu Acc";
                          })
                          .map((value, index) => (
                            <div key={value.Key}>
                              <h6 className="fw-semibold mb-3">{value.Text}</h6>
                              <div className="card-profile mb-3 d-flex justify-content-between shadow-sm rounded-4">
                                <div className="d-flex w-100">
                                  <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary ml-3">
                                    {index + 1}
                                  </p>
                                  <div className="p-1 ps-2 d-flex">
                                    <img
                                      src={maskotPknow}
                                      alt={value["Nama Anggota"]}
                                      className="img-fluid rounded-circle"
                                      width="45"
                                    />
                                    <div className="ps-3">
                                      <p className="mb-0 fw-semibold">
                                        {value["Nama Anggota"]}
                                      </p>
                                      <p
                                        className="mb-0"
                                        style={{ fontSize: "13px" }}
                                      >
                                        {value.Prodi}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center" style={{ gap: "10px" }}>
                                  <Button
                                    classType="light btn-sm text-primary px-3 mx-1"
                                    iconName="list"
                                    title="Lihat Detail Pengajuan"
                                    onClick={() => handleDetailLampiran(value)}
                                  />
                                  <Button
                                    classType="light btn-sm px-3 mx-1"
                                    iconName="check"
                                    title="Konfirmasi"
                                    style={{ color: "#00BF29" }}
                                    onClick={() => handleSetStatus(value, "Aktif")}
                                  />
                                  <Button
                                    classType="light btn-sm text-danger px-3 mx-1"
                                    iconName="x"
                                    title="Tolak"
                                    
                                    onClick={() => handleSetStatus(value, "Ditolak")}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mb-3 ">
                  <div className="col-lg-20">
                    <h3 className="col-6 mb-3 mt-3 fw-bold" style={{ color: "#0A5EA8", fontSize:"25px" }}>
                      Detail pengajuan dan lampiran pendukung
                    </h3>
                    <div className="">
                        <div className="col-6">
                          <Label
                            title="Nama"
                            data={karyawan?.["Nama Anggota"] || "-"}
                          />
                        </div>
                        <div className="col-6">
                          <Label 
                            title="Program Studi"
                            data={karyawan?.["Prodi"] || "-"}
                          />
                        </div>
                      <div className="mt-2 col-6">
                        {karyawan.Key ? (
                          detail?.map((item, index) => (
                            <div key={index}>
                              {item.Lampiran ? (
                                Array.isArray(item.Lampiran) ? (
                                  // Jika Lampiran adalah array
                                  item.Lampiran.map((link, linkIndex) => (
                                    <div key={linkIndex} style={{ marginTop: "15px" }}>
                                      <p className="mb-3 fw-bold">{`Lampiran ${linkIndex + 1}`}</p>
                                      <a href={link.trim()} target="_blank" rel="noopener noreferrer" style={{ padding:"5px", marginTop:"20px", textDecoration:"none", borderRadius:"10px", color:"white", backgroundColor:"#0A5EA8"}}>
                                        {`Lampiran ${linkIndex + 1} ${withID["Nama Kelompok Keahlian"]}`}
                                      </a>
                                    </div>
                                  ))
                                ) : typeof item.Lampiran === "string" ? (
                                  // Jika Lampiran adalah string
                                  item.Lampiran.split(",").map((link, linkIndex) => (
                                    <div key={linkIndex} style={{ marginTop: "15px", border:"1px grey solid" }}>
                                      <p className="mb-3" style={{color:"blue"}}>{`Lampiran ${index + 1}`}</p>
                                      <a href={link.trim()} target="_blank" rel="noopener noreferrer">
                                        {`Lampiran ${linkIndex + 1} ${withID["Nama Kelompok Keahlian"]}`}
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  // Jika Lampiran bukan string atau array
                                  <p>Invalid Lampiran format</p>
                                )
                              ) : (
                                // Jika tidak ada Lampiran
                                <p>Tidak ada lampiran</p>
                              )}
                            </div>
                          ))
                        ) : (
                          // Jika karyawan.Key tidak ada
                          
                          <Label title="Lampiran Pendukung" data="-" />
                        )}
                      </div>
                      {karyawan?.Key && (
                        <div className="d-flex justify-content-between ml-3 mr-3 mt-5 mb-3">
                          <Button
                            classType="secondary btn-sm px-3 py-2 rounded-3"
                            label="Batalkan"
                            style={{ height: "50px", backgroundColor: "#5A5A5A" }}
                            onClick={handleBatalkan}
                          />
                          <div className="d-flex text-end">
                            <div className="mr-2">
                            <Button
                              classType="primary btn-sm px-3 mx-1 py-2"
                              iconName="check"
                              label="Konfirmasi"
                              onClick={() => handleSetStatus(karyawan, "Aktif")}
                            />
                            </div>
                            <div className="">
                            <Button
                              classType="danger btn-sm px-3 mx-1 py-2"
                              iconName="x"
                              label="Tolak"
                              style={{ backgroundColor: "red" }}
                              onClick={() => handleSetStatus(karyawan, "Ditolak")}
                            />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="float-end" >
                  <Button
                    style={{ marginBottom: "80px", marginTop: "20px", backgroundColor: "#5A5A5A" }}
                    classType="secondary me-2 px-4 py-2"
                    label="Kembali"
                    onClick={() => onChangePage("index")}
                  />
                </div>

              </div>
            )}

            {/* <div
        class="modal fade"
        id="modalAnggota"
        tabindex="-1"
        aria-labelledby="Anggota Kelompok Keahlian"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="modalAnggotaKK">
                Anggota Kelompok Keahlian
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="input-group mb-4">
                <Input
                  //   ref={searchQuery}
                  forInput="pencarianProduk"
                  placeholder="Cari"
                />
                <Button
                  iconName="search"
                  classType="primary px-4"
                  title="Cari"
                  //   onClick={handleSearch}
                />
                <Filter>
                  <DropDown
                    // ref={searchFilterSort}
                    forInput="ddUrut"
                    label="Urut Berdasarkan"
                    type="none"
                    // arrData={dataFilterSort}
                    defaultValue="[Kode Produk] asc"
                  />
                  <DropDown
                    // ref={searchFilterJenis}
                    forInput="ddJenis"
                    label="Jenis Produk"
                    type="semua"
                    // arrData={dataFilterJenis}
                    defaultValue=""
                  />
                  <DropDown
                    // ref={searchFilterStatus}
                    forInput="ddStatus"
                    label="Status"
                    type="none"
                    // arrData={dataFilterStatus}
                    defaultValue="Aktif"
                  />
                </Filter>
              </div>
              {formData.members?.map((pr, index) => (
                <div className="card-profile mb-3 d-flex shadow-sm">
                  <p className="mb-0 px-1 py-2 mt-2 me-2 fw-bold text-primary">
                    {index + 1}
                  </p>
                  <div className="bg-primary" style={{ width: "1.5%" }}></div>
                  <div className="p-1 ps-2 d-flex">
                    <img
                      src={pr.imgSource}
                      alt={pr.name}
                      className="img-fluid rounded-circle"
                      width="45"
                    />
                    <div className="ps-3">
                      <p className="mb-0">{pr.name}</p>
                      <p className="mb-0" style={{ fontSize: "13px" }}>
                        UPT Manajemen Informatika
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <Button
                classType="secondary btn-sm px-3 mt-2"
                type="submit"
                label="Kelola"
              />
            </div>
          </div>
        </div>
      </div> */}
          </>

        </main>
      </div>
    </>
  );
}