import { useEffect, useRef, useState } from "react";
import SweetAlert from "../../../util/SweetAlert";
import Button from "../../../part/Button copy";
import Input from "../../../part/Input";
import Paging from "../../../part/Paging";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import CardMateri from "../../../part/CardMateri2";
import UseFetch from "../../../util/UseFetch";
import { API_LINK } from "../../../util/Constants";
import '@fortawesome/fontawesome-free/css/all.css';
import "../../../../style/Materi.css";
import "../../../../index.css";
import AppContext_test from "./MasterContext";
import AppContext_test2 from "../master-test/TestContext";
import Search from "../../../part/Search";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import "../../../../style/KelompokKeahlian.css";

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Kategori: null,
    Judul: null,
    File_pdf: null,
    File_vidio: null,
    Pengenalan: null,
    Keterangan: null,
    "Kata Kunci": null,
    Gambar: null,
    Sharing_pdf: null,
    Sharing_vidio: null,
    Status: "Aktif",
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Judul] ASC", Text: "Nama Materi [↑]" },
  { Value: "[Judul] DESC", Text: "Nama Materi [↓]" },
];

const dataFilterStatus = [
  { Value: "Aktif", Text: "Aktif" },
  { Value: "Tidak Aktif", Text: "Tidak Aktif" },
];

export default function MasterProsesIndex({ onChangePage }) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [listKategori, setListKategori] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);  
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    status: "Semua",
    query: "",
    sort: "Judul",
    order: "asc",
    kategori:AppContext_test.KategoriIdByKK,
  });

  const handleGoBack = () => {
    setIsBackAction(true);  
    setShowConfirmation(true);  
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false); 
    onChangePage("kk");
  };


  const handleConfirmNo = () => {
    setShowConfirmation(false);  
  };

  // AppContext'_test.kategoriId = withID;
  // const kategori = withID;
  const searchQuery = useRef(null);
  const searchFilterSort = useRef(null);
  const searchFilterStatus = useRef(null);

  function handleSetStatus(id) {
    setIsError(false);

    SweetAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin mengubah status data Materi?",
      "warning",
      "Ya",
    ).then((confirmed) => {
      if (confirmed) {
        UseFetch(API_LINK + "Materi/setStatusMateri", {
          mat_id: id,
        })
          .then((data) => {
            if (data === "ERROR" || data.length === 0) setIsError(true);
            else {
              SweetAlert(
                "Sukses",
                "Status data Materi berhasil diubah menjadi " + data[0].Status,
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      } 
    });
  }


  function handleDelete(id) {
    console.log("id delete", id);
    setIsError(false);

    SweetAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menghapus Materi dari Kategori ini?",
      "warning",
      "Ya",
    ).then((confirmed) => {
      if (confirmed) {
        UseFetch(API_LINK + "Materi/DeleteMateri", {
          mat_id: id,
        })
          .then((data) => {
            console.log(data);
            if (data === null) SweetAlert(
              "Gagal",
              "Materi ini berelasi dengan data yang lain",
              "error"
            );
            else {
              SweetAlert(
                "Sukses",
                "Status data Materi berhasil dihapus",
                "success"
              );
              handleSetCurrentPage(currentFilter.page);
            }
          })
          .then(() => setIsLoading(false));
      } 
    });
  }

  const kategori = AppContext_test.KategoriIdByKK;

  const fetchDataKategori = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await UseFetch(API_LINK + "Program/GetKategoriKKById", { kategori });
        const mappedData = data.map(item => ({
          value: item.Key,
          label: item["Nama Kategori"],
          deskripsi: item.Deskripsi,
          idKK: item.idKK,
          namaKK: item.namaKK
        }));
        return mappedData;
      } catch (error) {
        console.error("Error fetching kategori data:", error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsError({ error: false, message: '' });
      setIsLoading(true);
      try {
        const data = await fetchDataKategori();
        if (isMounted) {
          setListKategori(data);
        }
      } catch (error) {
        if (isMounted) {
          setIsError({ error: true, message: error.message });
          setListKategori([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [kategori]);

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: newCurrentPage,
    }));
  }

  function handleSearch() {
    
    const searchTerm = searchQuery.current.value.toLowerCase();
    
    const statusFilterValue = searchFilterStatus.current.value;
    const isStatusFilterSelected = statusFilterValue !== "" && statusFilterValue !== "Semua";
    console.log("dsajdhaj")
    const newStatus = isStatusFilterSelected ? statusFilterValue : "Semua";
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      query: searchTerm,
      status: newStatus,
    }));
  }

  function handleStatusChange(event) {
    const { value } = event.target;
    const newStatus = value === "" ? "Semua" : value;
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      // status: newStatus,
    }));
  }

  function handleSortChange(event) {
    const { value } = event.target;
    const [sort, order] = value.split(" ");
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      sort,
      order,
    }));
  }

  useEffect(() => {
    const fetchData = async () => {
        setIsError(false);
        setIsLoading(true);

        try {
            const data = await UseFetch(
                API_LINK + "Materi/GetDataMateriByKategori",
                currentFilter
            );
            if (data === "ERROR") {
                setIsError(true);
            // } else if (data.length === 0) {
            //     setCurrentData(inisialisasiData);
            // }
            }
             else {
                AppContext_test.MateriForm = "";
                AppContext_test.ForumForm = "";
                AppContext_test.formSavedMateri = false; 
                AppContext_test.formSavedForum = false; 
                const formattedData = data.map((value) => ({
                    ...value,
                }));
                const promises = formattedData.map((value) => {
                    const filePromises = [];

                    if (value.Gambar) {
                      const gambarPromise = fetch(
                          API_LINK + `Upload/GetFile/${value.Gambar}`
                      )
                          .then((response) => {
                              if (!response.ok) {
                                  throw new Error(`HTTP error! status: ${response.status}`);
                              }
                              value.gbr = value.Gambar; 
                              value.Gambar = API_LINK + `Upload/GetFile/${value.Gambar}`; 
                              return value;
                          })
                          .catch((error) => {
                              console.error("Error fetching gambar:", error);
                              return value;
                          });
                      filePromises.push(gambarPromise);
                  }

                  
                    if (value.File_video) {
                        const videoPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.File_video
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.vid = value.File_video;
                                value.File_video_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching video:", error);
                                return value;
                            });
                        filePromises.push(videoPromise);
                    }

                    // Fetch PDF
                    if (value.File_pdf) {
                        const pdfPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.File_pdf
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.pdf = value.File_pdf;
                                value.File_pdf_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching PDF:", error);
                                return value;
                            });
                        filePromises.push(pdfPromise);
                    }

                    // Fetch Sharing PDF
                    if (value.Sharing_pdf) {
                        const sharingPdfPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.Sharing_pdf
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.Sharing_pdf_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching sharing PDF:", error);
                                return value;
                            });
                        filePromises.push(sharingPdfPromise);
                    }

                    if (value.Sharing_video) {
                        const sharingVideoPromise = fetch(
                            API_LINK +
                            `Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
                                value.Sharing_video
                            )}`
                        )
                            .then((response) => response.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                value.Sharing_video_url = url;
                                return value;
                            })
                            .catch((error) => {
                                console.error("Error fetching sharing video:", error);
                                return value;
                            });
                        filePromises.push(sharingVideoPromise);
                    }

                    return Promise.all(filePromises).then((results) => {
                        const updatedValue = results.reduce(
                            (acc, curr) => ({ ...acc, ...curr }),
                            value
                        );
                        return updatedValue;
                    });
                });

                Promise.all(promises)
                    .then((updatedData) => {
                        setCurrentData(updatedData);
                    })
                    .catch((error) => {
                        console.error("Error updating currentData:", error);
                    });
            }
        } catch (error) {
            setIsError(true);
            console.error("Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
}, [currentFilter]);

  const handleButtonClick = () => {
    AppContext_test2.sharingExpertPDF = '';
    AppContext_test2.sharingExpertVideo = '';
    AppContext_test2.materiVideo = '';
    AppContext_test2.materiPdf = '';
    AppContext_test2.materiGambar = ''; 
    onChangePage("pengenalanAdd"); 
  };

  if (isLoading) return <Loading />;
  
  return (
    isLoading ? (
      <Loading />
    ) : (
      <>
        <div className="">
          <div className="">
            {isError && (
              <div className="flex-fill">
                <Alert
                  type="warning"
                  message="Terjadi kesalahan: Gagal mengambil data materi."
                />
              </div>
            )}
             <div className="backSearch">
          <h1>{listKategori.find((item) => item.value === AppContext_test.KategoriIdByKK)?.label || ""}</h1>
          <p>
          {listKategori.find((item) => item.value === AppContext_test.KategoriIdByKK)?.deskripsi || ""}
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
                placeholder="Cari Materi"
                style={{
                  border: "none",
                  width: "680px",
                  height: "40px",
                  borderRadius: "20px",
                }}
              />
              <Button
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
          <p className="title-kk" style={{fontSize:"20px"}}> <button style={{backgroundColor:"transparent", border:"none", marginRight:"10px"}} onClick={handleGoBack}><img src={BackPage} width="50px" alt="" /></button>Kelola Materi / Program / Kategori <span style={{fontWeight:"bold"}}>{listKategori.find((item) => item.value === AppContext_test.KategoriIdByKK)?.label || ""}</span></p>
          <div className="left-feature">
            <div className="tes" style={{ display: "flex" }}>
              <div className="mr-2">
              <Filter handleSearch={handleSearch}>
                  <DropDown
                    ref={searchFilterSort}
                    forInput="ddUrut"
                    label="Urut Berdasarkan"
                    type="none"
                    arrData={dataFilterSort}
                    defaultValue="[Judul] ASC"
                    // onChange={handleSortChange}
                  />
                  <DropDown
                    ref={searchFilterStatus}
                    forInput="ddStatus"
                    label="Status"
                    type="semua"
                    arrData={dataFilterStatus}
                    defaultValue="Semua"
                    // onChange={handleStatusChange}
                  />
                </Filter>
              </div>
              <div className="">
              <Button
                  iconName="add"
                  classType="primary py-2 rounded-4" 
                  title="Tambah Materi"
                  label="Tambah Materi"
                  onClick={handleButtonClick}
                />
              </div>
            </div>
          </div>
        </div>
            <div className="mt-1">
              {console.log("jumlah",currentData.length)}
              
              {currentData.length === 0 && (
                <div className="" style={{margin:"0px 80px"}}>
                <Alert type="warning" message="Tidak ada data!" />
                </div>
              )}
              
                {currentFilter.status === "Semua" ? (
                  currentData.length > 0 ? (
                    <CardMateri
                      materis={currentData}
                      onDetail={onChangePage}
                      onEdit={onChangePage}
                      onStatus={handleSetStatus}
                      onDelete={handleDelete}
                      isNonEdit={false}
                      onReviewJawaban={onChangePage}
                    />
                  ) : (
                    <div className="" style={{ margin: "0px 85px", width: "90%" }}>
                      {/* <Alert
                        type="warning"
                        message="Tidak ada materi pada kategori ini. Klik Tambah Materi."
                      /> */}
                    </div>
                  )
                ) : null}
              </div>
            </div>

          </div>

        {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={isBackAction ? "Apakah anda ingin kembali?" : "Anda yakin ingin simpan data?"}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
        )}
        </>
    )
  );
}