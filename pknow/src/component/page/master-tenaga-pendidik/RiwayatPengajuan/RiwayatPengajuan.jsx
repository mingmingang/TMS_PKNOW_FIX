import Search from "../../../part/Search";
import TableRiwayat from "../../../part/TableRiwayat";
import React from "react";
import { useEffect, useRef, useState } from "react";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import Button from "../../../part/Button copy";
import Input from "../../../part/Input";
import Table from "../../../part/Table";
import Paging from "../../../part/Paging";
import Filter from "../../../part/Filter";
import DropDown from "../../../part/Dropdown";
import Alert from "../../../part/Alert";
import Loading from "../../../part/Loading";
import Icon from "../../../part/Icon";
import CardKK from "../../../part/CardKelompokKeahlian";
import { ListKelompokKeahlian } from "../../../util/Dummy";
import { API_LINK } from "../../../util/Constants";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import Label from "../../../part/Label";
import CardPengajuanBaru from "../../../part/CardPengajuanBaru";
import { faL } from "@fortawesome/free-solid-svg-icons";
import Button2 from "../../../part/Button copy";
import "../../../../../src/index.css";

const inisialisasiKK = [
  {
    Key: null,
    No: null,
    Nama: null,
    PIC: null,
    Deskripsi: null,
    Status: "Aktif",
    Count: 0,
  },
];


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

  const dataFilterSort = [
    { Value: "[Nama Kelompok Keahlian] asc", Text: "Nama Kelompok Keahlian [↑]" },
    {
      Value: "[Nama Kelompok Keahlian] desc",
      Text: "Nama Kelompok Keahlian  [↓]",
    },
  ];
  

export default function RiwayatPengajuan({onChangePage}) {
    let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [show, setShow] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataAktif, setDataAktif] = useState(false);
  const [listKK, setListKK] = useState([]);
  const [detail, setDetail] = useState(inisialisasiData);

  const [userData, setUserData] = useState({
    Role: "",
    Nama: "",
    kry_id: "",
  });

  const [currentFilter, setCurrentFilter] = useState({
    page: 1,
    query: "",
    sort: "[Tanggal] DESC",
    kry_id: "",
  });

  const searchQuery = useRef();
  const searchFilterSort = useRef();
  const searchFilterKry = useRef(); 

  function handleSearch() {
    setIsLoading(true);
    setCurrentFilter((prevFilter) => ({
      ...prevFilter,
      page: 1,
      query: searchQuery.current.value,
      sort: searchFilterSort.current.value,
      kry_id: searchFilterKry.current.value,
    }));
  }

  const getUserKryID = async () => {
    setIsLoading(true);
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
          setIsLoading(false);
          break;
        }
      }
    } catch (error) {
      setIsLoading(true);
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

  const getRiwayat = async () => {
    setIsError((prevError) => ({ ...prevError, error: false }));
    setIsLoading(true);

    if (currentFilter.kry_id === "") return;
    console.log("yuhuu",currentFilter);

    try {
      while (true) {
        let data = await UseFetch(
          API_LINK + "PengajuanKK/GetRiwayat",
          currentFilter
        );
        console.log("current filter", currentFilter)
        console.log("data riwayat", data)

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar prodi.");
        } else if (data === "data kosong") {
          setListKK([]);
          setIsLoading(false);
          break;
        } else {
         
          setListKK(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (error) {
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
      setListKK([]);
    }
  };

  useEffect(() => {
    getRiwayat();
  }, [currentFilter]);

    return (
        <div className="app-container">
            {/* Render Header */}
            <main>
            <div className="backSearch">
          <h1>Riwayat Pengajuan</h1>
          <p>
          Riwayat Pengajuan akan menampilkan pengajuan anggota keahlia yang anda ajukan, hanya terdapat satu kelompok keahlian yang pengajuannya akan diterima oleh Program Studi.
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
                placeholder="Cari"
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
                 <>
      <div className="d-flex flex-column">
      <div className="navigasi-layout-page">
          <p className="title-kk">Kelompok Keahlian</p>
          <div className="left-feature">
            <div className="status">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <i
                        className="fas fa-circle"
                        style={{ color: "grey" }}
                      ></i>
                    </td>
                    <td>
                      <p>Dibatalkan</p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <i className="fas fa-circle" style={{ color: "#DC3545" }}></i>
                    </td>
                    <td>
                      <p>Ditolak</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="tes" style={{ display: "flex" }}>
              <div className="">
                <Filter handleSearch={handleSearch}>
                  <DropDown
                    ref={searchFilterSort}
                    forInput="ddUrut"
                    label="Urut Berdasarkan"
                    type="none"
                    arrData={dataFilterSort}
                    defaultValue="[Nama Kelompok Keahlian] asc"
                  />
                </Filter>
              </div>
              </div>
              </div>
              </div>
          
          <div className="container">
            <div className="row mb-4 gx-4">
            {Array.isArray(listKK) && listKK.length > 0 && listKK[0]?.Message ? (
              <div className="" style={{marginRight:"120px", marginLeft:"10px"}} >
  <Alert type="warning" message="Tidak ada riwayat.." />
  </div>
) : (
  listKK?.map((value) => (
    <CardPengajuanBaru
      key={value.Key}
      data={value}
      onChangePage={onChangePage}
    />
  ))
)}
            </div>
          </div>
        </div>
    </>

            </main>
        </div>
    );
}
