import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK, ROOT_LINK } from "../../../util/Constants";
import axios from 'axios';
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import AppContext_test from "./TestContext";
import UseFetch from "../../../util/UseFetch";
import PDF_Viewer from "../../../part/PDF_Viewer";
import KMS_Rightbar from "../../../part/RightBar";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import WordViewer from "../../../part/DocumentViewer";
import ExcelViewer from "../../../part/ExcelViewer";

export default function MasterTestSharingPDF({ onChangePage, CheckDataReady, materiId }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentData, setCurrentData] = useState();
    const [sectionData, setSectionData] = useState([]);
    const [marginRight, setMarginRight] = useState("5vh");
    const [fileExtension, setFileExtension] = useState("");

    AppContext_test.refreshPage = "sharingPDF";

    const [fileData, setFileData] = useState({
        file: "",
    });

    useEffect(() => {
        document.documentElement.style.setProperty('--responsiveContainer-margin-left', '0vw');
        const sidebarMenuElement = document.querySelector('.sidebarMenu');
        if (sidebarMenuElement) {
            sidebarMenuElement.classList.add('sidebarMenu-hidden');
        }
    }, []);

    async function updateProgres() {
      let success = false;
      let retryCount = 0;
      let maxRetries = 10;
    
      while (!success && retryCount < maxRetries) {
        try {
          const response = await axios.post(
            API_LINK + "Materi/UpdatePoinProgresMateri",
            {
              materiId: AppContext_test.materiId,
              kry_user : activeUser,
              tipe: 'Sharing Expert'
            }
          );
          if (response.status === 200) {
            success = true;
          }
        } catch (error) {
          console.error("Failed to save progress:", error);
          retryCount += 1;
          if (retryCount >= maxRetries) {
            console.error(
              "Max retries reached. Stopping attempts to save progress."
            );
          }
        }
      }
    }
    
      useEffect(() => {
        updateProgres();
      }, []);

    const getListSection = async (retries = 10, delay = 2000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.post(API_LINK + "Section/GetDataSectionByMateri", {
                    mat_id: AppContext_test.materiId,
                    sec_type: "Sharing Expert",
                    sec_status: "Aktif"
                });
                if (response.data.length !== 0) {
                    console.log("data sec", response.data);
                    return response.data;
                }
            } catch (error) {
                console.error("Error fetching materi data: ", error);
                if (i < retries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay))
                } else {
                    throw error;
                }
            }
        }
    };

    // useEffect(() => {
    //     const fetchSectionData = async () => {
    //         try {
    //             const sections = await getListSection();
    //             if (sections && sections.length > 0) {
    //                 const fileFromResponse = sections[0]?.ExpertFile || "";
    //                 setCurrentData(sections[0]);
    //                 setFileData({ file: fileFromResponse });
    //                 setFileExtension(fileFromResponse.split('.').pop().toLowerCase());
    //             } else {
    //                 console.error("No sections found.");
    //             }
    //         } catch (error) {
    //             console.error("Error fetching section data:", error);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    
    //     fetchSectionData();
    // }, [AppContext_test.materiId]);


    useEffect(() => {
      const fetchSectionData = async () => {
        try {
          const sections = await getListSection();
          if (sections.length > 0) {
            const fileFromResponse = sections[0]?.ExpertFile || "";
            const materialTitle = sections[0]?.MaterialTitle || "Sharing Expert";
  
            setCurrentData(sections[0]);
            setFileData({ file: fileFromResponse });
            setFileExtension(fileFromResponse.split(".").pop().toLowerCase());
  
            // Log untuk memastikan MaterialTitle ada
            console.log("Material Title:", materialTitle);
          } else {
            console.warn("No sections found for the specified criteria.");
            setCurrentData(null); // Set state to null if no data found
          }
        } catch (error) {
          console.error("Error fetching section data:", error.message);
          setIsError(true);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchSectionData();
    }, [AppContext_test.materiId]);
    
    // Logging perubahan state
    useEffect(() => {
        console.log("CurrentData telah diatur:", currentData);
    }, [currentData]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('id-ID', options);
      };

    return (
        <>
        <div className="d-flex">
        <KMS_Rightbar
     isActivePengenalan={false}
     isActiveForum={false}
     isActiveSharing={true}
     isActiveSharingPDF={true}
     isActiveSharingVideo={false}
     isActiveMateri={false}
     isActiveMateriPDF={false}
     isActiveMateriVideo={false}
     isActivePreTest={false}
     isActivePostTest={false}
      isOpen={true}
      onChangePage={onChangePage}
      materiId={AppContext_test.materiId}
      // refreshKey={refreshKey}
      // setRefreshKey={setRefreshKey}
    />
            
                <div className="file-preview" style={{ marginTop: "100px",color:"#002B6C" }}>
                    <h1 className="ml-4" style={{fontWeight:"600", color: "#002B6C" }}>Sharing Expert</h1>
                    {currentData ? (
                        <p className="ml-4">
                            Dibuat oleh {currentData.Nama} - {formatDate(currentData.CreatedDate)}
                        </p>
                    ) : (
                      <div className=""></div>
                    )}
                    {fileData.file ? (
                        <div>
                      {fileExtension === "pdf" && (
           <div className="">
            <PDF_Viewer pdfFileName={fileData.file} width="1000px" height="800px" />
           </div>
          )}
        
          {/* Anda bisa menambahkan lebih banyak kondisi untuk file lain seperti .docx atau .xlsx */}
          {fileExtension === "docx" && (
            <div className="ml-4">
            <WordViewer fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`} fileData={fileData} width="1000px"/>
            </div>
          )}
          {fileExtension === "xlsx" && (
           <div className="ml-4">
           <ExcelViewer fileUrl={`${API_LINK}Upload/GetFile/${fileData.file}`} fileData={fileData} width="1000px" />
           </div>
          )}
          {fileExtension === "pptx" && (
            <div className="">
            <p style={{marginLeft:"25px", marginTop:"20px"}}>
              Dokumen Power Point tidak dapat ditampilkan di sini. Silahkan klik tombol dibawah ini untuk melihatnya.
              {/* <a href={`${API_LINK}Upload/GetFile/${fileData.file}`} download>
                unduh
              </a>{" "} */}
            </p>
            <button  style={{border:"none",backgroundColor:"#0E6EFE", borderRadius:"10px", padding:"10px", marginLeft:"25px"}}> <a style={{color:"white"}} href={`${API_LINK}Upload/GetFile/${fileData.file}`} className="text-decoration-none" download>Unduh Materi</a></button>
            </div>
          )}
                </div>  ) : (
                    <div className="alert alert-warning mt-4 mb-4 ml-4" >
                    Tidak ada Sharing Expert File yang tersedia.
                  </div>
                )}
              </div>
              </div>
        </>
    );
}