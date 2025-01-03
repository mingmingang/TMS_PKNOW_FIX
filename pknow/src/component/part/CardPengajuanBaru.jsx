import React from "react";
import { useState } from "react";
import Icon from "./Icon";
import Button from "./Button copy";
import "../../style/KelompokKeahlian.css";
import { API_LINK } from "../util/Constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

function CardPengajuanBaru({ data, onChangePage, isShow }) {
  const [showAllText, setShowAllText] = useState(isShow);
  //   const sortDataByStatus = (data) => {
  //     const statusOrder = {
  //       Aktif: 1,
  //       "Menunggu Acc": 2,
  //       None: 3,
  //       Ditolak: 4,
  //       Dibatalkan: 5,
  //       Kosong: 6,
  //     };

  //     return data.sort((a, b) => {
  //       return statusOrder[a.Status] - statusOrder[b.Status];
  //     });
  //   };

  //   const sortedData = sortDataByStatus(data);

  const handleToggleText = () => {
    setShowAllText(!showAllText);
  };

  let status;
  let aksi;
  if (data.Status === "Ditolak") {
    status = (
      <p>
        Status: <span className="text-danger fw-bold">{data.Status}</span>
      </p>
    );
    aksi = (
      <Button
        iconName="eye"
        classType="primary btn-sm"
        label="Riwayat"
        onClick={() => onChangePage("detailRiwayat", data)}
        title="Klik untuk melihat riwayat pengajuan"
      />
    );
  } else if (data.Status === "Dibatalkan") {
    status = (
      <p>
        Status: <span className="text-secondary fw-bold">{data.Status}</span>
      </p>
    );
    aksi = (
      <Button
        iconName="eye"
        classType="primary btn-sm"
        label="Riwayat"
        onClick={() => onChangePage("detailRiwayat", data)}
        title="Klik untuk melihat riwayat pengajuan"
      />
    );
  } else if (data.Status === "Menunggu Acc") {
    status = (
      <p>
        Status:{" "}
        <span className="text-warning fw-bold">Menunggu Persetujuan</span>
      </p>
    );
    aksi = (
      <Button
        iconName="list"
        classType="primary btn-sm py-2"
        label="Detail"
        onClick={() => onChangePage("detailPengajuan", data)}
        title="Klik untuk melihat detail pengajuan"
      />
    );
  } else if (data.Status === "None") {
    status = "";
    aksi = (
      <Button
        iconName="list"
        classType="primary btn-sm py-2"
        label="Detail"
        onClick={() => onChangePage("detailKK", data)}
        title="Klik untuk melihat detail Kelompok Keahlian"
      />
    );
  } else {
    status = (
      <p>
        Status: <span className="text-secondary fw-bold">-</span>
      </p>
    );
    aksi = (
      <Button
        iconName="plus"
        classType="primary btn-sm py-2"
        label="Gabung"
        onClick={() => onChangePage("add", data)}
        title="Klik untuk bergabung"
      />
    );
  }

  return (
    <>
      <div className="bg-white-kk" style={{marginRight:"25px"}}>
      <img
          alt="gambar"
          className="cover-daftar-kk"
          height="200"
          src={`${API_LINK}Upload/GetFile/${data.Gambar}`}
          width="300"
          style={{marginLeft:"-12px"}}
        />
        <div
          className=""
        >
          <div className="">
            <h5
              className="fw-bold mt-3"
              style={{color:"#0A5EA8"}}
              // style={{
              //   backgroundColor:
              //     data.Status === "Ditolak"
              //       ? "#DC3545"
              //       : data.Status === "Menunggu Acc"
              //       ? "#FFC107"
              //       : "#6C757D",
              // }}
            >
              {data["Nama Kelompok Keahlian"]}
            </h5>
            <div className="">
              <div className="" style={{marginLeft:"-20px"}}>{status}</div>
              <h6 className="card-subtitle mt-1 mb-3">
              <FontAwesomeIcon icon={faGraduationCap} className="icon-style mr-2" />
                {data.Prodi}
              </h6>
              <p
                className=""
                style={{
                  display: showAllText ? "block" : "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textAlign: "justify",
                  margin:"0px"
                }}
              >
                {data.Deskripsi}
              </p>
              <div className="d-flex justify-content-between align-items-center" style={{marginTop:"30px", marginBottom:"20px"}}>
                <a
                  href="#"
                  className="text-decoration-none"
                  onClick={handleToggleText}
                >
                  <span className="fw-semibold">
                    {showAllText ? "Ringkas" : "Selengkapnya"}
                  </span>{" "}
                  <Icon
                    name={showAllText ? "arrow-up" : "arrow-right"}
                    type="Bold"
                    cssClass="btn px-0 pb-1 text-primary"
                    title="Baca Selengkapnya"
                  />
                </a>
                {aksi}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CardPengajuanBaru;
