import React from "react";
import Button from "./Button copy";
import Icon from "./Icon";
import "../../style/KelompokKeahlian.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import developerImage from "../../assets/developer.png";
import { API_LINK, ROOT_LINK } from "../util/Constants";
import { useState } from "react";
import Input from "./Input";
import { decode } from "he";
import AppContext_test from "../page/kelas/kelasafterlogin/TestContext";

function CardClassTraining({
  config = { footer: "", icon: "", className: "", label: "", page: "" },
  data = {
    id: "",
    title: "",
    desc: "",
    status: "",
    gambar: "",
    ProgramStudi: "",
  },
  noLogin = "no",
  onChangePage,
  title,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogin = () => {
    window.location.href = ROOT_LINK + "/" + "login"; // Redirect to login page
  };

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  // Limit the description to 100 characters if not expanded
  const truncatedDesc =
    data.desc.length > 100 && !isExpanded
      ? `${data.desc.substring(0, 100)}...`
      : data.desc;

  let cardContent;
  if(data.kelasSaya == "yes"){
     cardContent = (
        <div className="d-flex justify-content-between mt-2">
          <div className="d-flex mt-2">
            {/* <p style={{color:"#0A5EA8", fontWeight:"600", marginRight:"10px"}}>4.3</p> <span className="" style={{ color: "#f5a623"}}>⭐⭐⭐⭐</span><p style={{color:"#969696", marginLeft:"5px"}}>(16,325)</p> */}
          </div>

          <div className="d-flex" style={{ width: "10%", marginTop: "15px" }}>
            <>
              <button
                className="bg-blue-100 text-white px-3 py-2 rounded-full d-flex align-items-center"
                aria-label={`Action for ${title}`}
                onClick={() => onChangePage("detail", data, AppContext_test.klaim = "yes")}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "0px 10px",
                  marginLeft: "-100px",
                  marginTop: "-20px",
                  background: "#0E6EFE",
                }}
              >
                <i className="fas fa-play mr-2"></i>Belajar
              </button>
            </>
          </div>
        </div>
      );
  } else {
  if (noLogin == "yes") {
    if (data.harga > 0) {
      cardContent = (
        <div className="d-flex justify-content-between mt-2">
          <div className="d-flex mt-2">
            {/* <p style={{color:"#0A5EA8", fontWeight:"600", marginRight:"10px"}}>4.3</p> <span className="" style={{ color: "#f5a623"}}>⭐⭐⭐⭐</span><p style={{color:"#969696", marginLeft:"5px"}}>(16,325)</p> */}
          </div>

          <div className="d-flex" style={{ width: "10%", marginTop: "15px" }}>
            <>
              <button
                className="bg-blue-100 text-white px-3 py-2 rounded-full d-flex align-items-center"
                aria-label={`Action for ${title}`}
                onClick={handleLogin}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "0px 10px",
                  marginLeft: "-60px",
                  marginTop: "-20px",
                  background: "#0E6EFE",
                }}
              >
                <i className="fas fa-shopping-cart mr-2"></i>Beli
              </button>
            </>
          </div>
        </div>
      );
    } else {
      cardContent = (
        <div className="d-flex justify-content-between mt-2">
          <div className="d-flex mt-2">
            {/* <p style={{color:"#0A5EA8", fontWeight:"600", marginRight:"10px"}}>4.3</p> <span className="" style={{ color: "#f5a623"}}>⭐⭐⭐⭐</span><p style={{color:"#969696", marginLeft:"5px"}}>(16,325)</p> */}
          </div>

          <div className="d-flex" style={{ width: "10%", marginTop: "15px" }}>
            <>
              <button
                className="bg-blue-100 text-white px-3 py-2 rounded-full d-flex align-items-center"
                aria-label={`Action for ${title}`}
                onClick={handleLogin}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "0px 10px",
                  marginLeft: "-100px",
                  marginTop: "-20px",
                  background: "green",
                }}
              >
                <i className="fas fa-add mr-2"></i>Gabung
              </button>
            </>
          </div>
        </div>
      );
    }
  } else {
    if (data.harga > 0) {
      cardContent = (
        <div className="d-flex justify-content-between mt-2">
          <div className="d-flex mt-2">
            {/* <p style={{color:"#0A5EA8", fontWeight:"600", marginRight:"10px"}}>4.3</p> <span className="" style={{ color: "#f5a623"}}>⭐⭐⭐⭐</span><p style={{color:"#969696", marginLeft:"5px"}}>(16,325)</p> */}
          </div>

          <div className="d-flex" style={{ width: "10%", marginTop: "15px" }}>
            <>
              <button
                className="bg-blue-100 text-white px-3 py-2 rounded-full d-flex align-items-center"
                aria-label={`Action for ${title}`}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "0px 10px",
                  marginLeft: "-60px",
                  marginTop: "-20px",
                  background: "#0E6EFE",
                }}
                onClick={() => onChangePage("detail", data)}
              >
                <i className="fas fa-shopping-cart mr-2"></i>Beli
              </button>
            </>
          </div>
        </div>
      );
    } else {
      cardContent = (
        <div className="d-flex justify-content-between mt-2">
          <div className="d-flex mt-2">
            {/* <p style={{color:"#0A5EA8", fontWeight:"600", marginRight:"10px"}}>4.3</p> <span className="" style={{ color: "#f5a623"}}>⭐⭐⭐⭐</span><p style={{color:"#969696", marginLeft:"5px"}}>(16,325)</p> */}
          </div>

          <div className="d-flex" style={{ width: "10%", marginTop: "15px" }}>
            <>
              <button
                className="bg-blue-100 text-white px-3 py-2 rounded-full d-flex align-items-center"
                aria-label={`Action for ${title}`}
                onClick={() => onChangePage("detail", data)}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "0px 10px",
                  marginLeft: "-100px",
                  marginTop: "-20px",
                  background: "green",
                }}
              >
                <i className="fas fa-add mr-2"></i>Gabung
              </button>
            </>
          </div>
        </div>
      );
    }
  }
  }

  return (
    <div className="kelompokKeahlian">
      <div className="bg-white-kk">
        <img
          alt={`${title} image`}
          className="cover-daftar-kk"
          height="200"
          src={`${API_LINK}Upload/GetFile/${data.gambar}`}
          width="300"
        />
        <div className="row">
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h3
              className="text-xl font-bold text-blue-600"
              style={{ fontSize: "17px", textAlign: "justify" }}
            >
              {decode(data.title)}
            </h3>
          </div>
        </div>

        <div className="pemilik ">
          <div className="userProdi">
            <i
              className="fas fa-award"
              style={{ fontSize: "18px", paddingLeft: "0px", color: "#4D4D4D" }}
            ></i>{" "}
            <p
              className=""
              style={{
                marginLeft: "18px",
                width: "100%",
                fontSize: "15px",
                color: "#4D4D4D",
              }}
            >
              Sertifikat
            </p>
          </div>
          <div className="userProdi">
            <i
              className="fas fa-tag"
              style={{ fontSize: "18px", paddingLeft: "0px", color: "#4D4D4D" }}
            ></i>{" "}
            <p
              className=""
              style={{
                marginLeft: "18px",
                width: "100%",
                fontSize: "15px",
                color: "#4D4D4D",
              }}
            >
              {data.harga && data.harga > 0 ? (
                <div
                  className=""
                  style={{
                    color: "red",
                    fontWeight: "bold",
                  }}
                >
                  Rp.{" "}
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  })
                    .format(data.harga)
                    .replace("Rp", "")
                    .trim()}
                </div>
              ) : (
                <div
                  className=""
                  style={{
                    color: "green",
                    fontWeight: "bold",
                  }}
                >
                  Gratis
                </div>
              )}
            </p>
          </div>
        </div>

        <div
          className="deskripsi-container "
          style={{ alignItems: "center", width: "100%" }}
        >
          <p
            className="deskripsi"
            style={{ marginBottom: "10px", fontSize: "15px" }}
          >
            {decode(data.desc).substring(0, 100)}
            {/* Menampilkan 200 huruf pertama */}
            {data.desc.length > 100 && "..."}
          </p>
        </div>

        <div className="card-footer mt-4">
          <div className="card-content" style={{ alignItems: "center" }}>
            {cardContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardClassTraining;
