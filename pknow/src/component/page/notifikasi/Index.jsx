import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE, API_LINK, APPLICATION_ID } from "../../util/Constants";
import { formatDate } from "../../util/Formatting";
import SweetAlert from "../../util/SweetAlert";
import UseFetch from "../../util/UseFetch";
import Button from "../../part/Button";
import Table from "../../part/Table";
import Paging from "../../part/Paging";
import Filter from "../../part/Filter";
import DropDown from "../../part/Dropdown";
import Alert from "../../part/Alert";
import Loading from "../../part/Loading";
import Search from "../../part/Search";
import Cookies from "js-cookie";
import { decryptId } from "../../util/Encryptor";
import axios from 'axios';


let activeUser = "";
const cookie = Cookies.get("activeUser");
if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

const inisialisasiData = [
  {
    Key: null,
    No: null,
    Dari: null,
    Pesan: null,
    Waktu: null,
    Count: 0,
  },
];

const dataFilterSort = [
  { Value: "[Waktu] asc", Text: "Waktu [↑]" },
  { Value: "[Waktu] desc", Text: "Waktu [↓]" },
];

const dataFilterStatus = [
  { Value: "Belum Dibaca", Text: "Belum Dibaca" },
  { Value: "Sudah Dibaca", Text: "Sudah Dibaca" },
];

export default function NotifikasiIndex() {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentData, setCurrentData] = useState(inisialisasiData);
  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Waktu] asc",
    app: APPLICATION_ID,
    status: "Belum Dibaca",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterStatus = useRef();

  async function handleApproveNotificationAction() {
    const result = await SweetAlert(
      "Tandai Sudah Dibaca",
      "Apakah Anda yakin ingin menandai semua status notifikasi menjadi sudah dibaca?",
      "info",
      "Ya, saya yakin!"
    );

    if (result) {
      try {
        const response = await axios.post(
          API_LINK + "Utilities/AllSetReadNotifikasi",
          {
            application: APPLICATION_ID,
            user: activeUser,
          }
        );
    
        console.log("set read", response.data);
    
        // Validasi response data
        if (response.data && response.data.length !== 0) {
          window.location.reload();
          return response.data;
        }
        return []; // Return array kosong jika data kosong atau undefined
      } catch (error) {
        console.error("Error while setting notification read:", error); // Tangkap error
        setIsError(true); // Set error state
      } finally {
        setIsLoading(false); // Set loading state selesai
      }
    }
  }

  function handleSetCurrentPage(newCurrentPage) {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => {
      return {
        ...prevFilter,
        page: newCurrentPage,
      };
    });
  }

  function handleSearch() {
    setIsLoading(true);
    const query = searchQuery.current?.value || "";
    const sort = searchFilterSort.current?.value || "";
    const status = searchFilterStatus.current?.value || "";

    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query,
      sort,
      app: "APP59",
      status,
    }));
  }

  async function handleSetRead(notificationKey) {
    const result = await SweetAlert(
      "Tandai Sudah Dibaca",
      "Apakah Anda yakin ingin menandai status notifikasi menjadi sudah dibaca?",
      "info",
      "Ya, saya yakin!"
    );

    if (result) {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await UseFetch(API_LINK + "Utilities/SetReadNotifikasi", {
          application: APPLICATION_ID,
          notId: notificationKey,
        });
        console.log("key", notificationKey); // Debug log
        console.log("data", currentData);
        if (data === "ERROR" || data.length === 0) {
          setIsError(true);
        } else {
          SweetAlert(
            "Sukses",
            "Semua notifikasi ditandai sudah dibaca",
            "success"
          );
          handleSetCurrentPage(currentFilter.page); // Refresh data
        }
      } catch (e) {
        console.error("Error setting notifications as read:", e);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);

      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetDataNotifikasi",
          currentFilter
        );

        console.log("ayamm", data)
        if (data === "ERROR") {
          setIsError(true);
        } else if (data.length === 0) {
          setCurrentData(inisialisasiData);
        } else {
          const formattedData = data.map((value) => ({
            ...value,
            Key: value["Key"],
            Dari: value["Dari"].toUpperCase(),
            Pesan: (
              <div
                className="link-decoration-none"
                dangerouslySetInnerHTML={{
                  __html: value["Pesan"],
                }}
              ></div>
            ),
            Waktu: formatDate(value["Waktu"]),
            Status: value["Status"],
            Aksi: value["Status"] === "Belum Dibaca" ? ["Approve"] : [],
            Alignment: ["center", "left", "left", "center", "center", "center"],
          }));
          setCurrentData(formattedData);
        }
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentFilter]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data notifikasi."
            />
          </div>
        )}
        <div className="flex-fill">
          <div className="input-group">
            <Search
              title="Notifikasi P-KNOW Sistem"
              description="Lihat seluruh notifikasi aktivitas pesan - pesan data yang dikirimkan ke akun P-KNOW anda."
              placeholder="Cari Notifikasi"
            />
            <Button
              iconName="search"
              classType="primary px-4"
              title="Cari"
              onClick={handleSearch}
            />
           
          </div>
        </div>
        <div className="d-flex  mt-4 mb-4" style={{justifyContent:"flex-end", alignItems:"center", marginRight:"120px"}}>
            <Filter handleSearch={handleSearch}>
              <DropDown
                ref={searchFilterSort}
                forInput="ddUrut"
                label="Urut Berdasarkan"
                type="none"
                arrData={dataFilterSort}
                defaultValue="[Waktu] desc"
              />
              <DropDown
                ref={searchFilterStatus}
                forInput="ddStatus"
                label="Status"
                type="none"
                arrData={dataFilterStatus}
                defaultValue="Belum Dibaca"
              />
            </Filter>
            <div className="" style={{background:"green", padding:"10px 10px", color:"white", borderRadius:"10px", marginLeft:"20px"}}>
            <button
             style={{border:"none", background:"transparent", color:"white"}}
              title="Set Sudah Dibaca"
              label="Set Sudah Dibaca"
              onClick={handleApproveNotificationAction}
            ><i className="fa fa-check" ></i> Set Sudah Dibaca</button>
            </div>
            </div>
        <div className="mt-3" style={{ margin: "10px 100px" }}>
          {isLoading ? (
            <Loading />
          ) : (
            <div className="d-flex flex-column">
                {currentData.length === 0 && (
                <div className="" style={{ margin: "5px 20px" }}>
                  <Alert type="warning" message="Tidak ada data!" />
                </div>
              )}
              <Table
                data={currentData}
                onApprove={(notificationKey) => handleSetRead(notificationKey)}
              />
              <div className="mb-4 d-flex justify-content-center">
                <Paging
                  pageSize={PAGE_SIZE}
                  pageCurrent={currentFilter.page}
                  totalData={currentData[0]?.Count || 0}
                  navigation={handleSetCurrentPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}