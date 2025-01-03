import React from "react";
import ceweVR from "../../assets/ceweVR_beranda.png";
import cowoTop from "../../assets/cowoTop_beranda.png";
import pengguna from "../../assets/ppnaufal.png";
import logo from "../../assets/logo.png";
import perusahaan from "../../assets/perusahaan.png";
import iconAstra from "../../assets/iconAstra.png";
import sample from "../../assets/aang.jpg";
import Footer from "./Footer";
import Header from "./Header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "../../style/Beranda.css";
import "../../style/Slider.css";

const sliderData = [
  { name: "Adila Ilma", role: "UX Designer", company: "CrescentRating", img: sample },
  { name: "Amadea Dewasanya", role: "Product Designer", company: "CrescentRating", img: sample },
  { name: "Debby Surya Pradana", role: "UI/UX Designer", company: "Ekosis", img: sample },
  { name: "Dialus Andari", role: "UI/UX Designer", company: "Universal Eco Pasific", img: sample },
  { name: "Hutami Septiana Raswaty", role: "Digital Product Manager", company: "Telkom Indonesia", img: sample },
];

const comments = [
  {
    name: "Naufal",
    role: "UI/UX Designer di Eureka",
    text: "Seneng banget bisa belajar di Skilvul! Pembelajarannya asik, materinya pun daging semua. Ga nyesel bisa belajar dan kenal mentor-mentor keren dari Skilvul!",
    img: pengguna,
  },
  {
    name: "Naufal",
    role: "UI/UX Designer di Eureka",
    text: "Seneng banget bisa belajar di Skilvul! Pembelajarannya asik, materinya pun daging semua. Ga nyesel bisa belajar dan kenal mentor-mentor keren dari Skilvul!",
    img: pengguna,
  },
  {
    name: "Naufal",
    role: "UI/UX Designer di Eureka",
    text: "Seneng banget bisa belajar di Skilvul! Pembelajarannya asik, materinya pun daging semua. Ga nyesel bisa belajar dan kenal mentor-mentor keren dari Skilvul!",
    img: pengguna,
  },
];

function Slider() {
  return (
    <div className="slider-container" style={{ background: "white", marginBottom: "200px", height: "500px" }}>
      <Swiper
        spaceBetween={20}
        slidesPerView={4}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10 },
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 30 },
          1440: { slidesPerView: 4, spaceBetween: 40 },
        }}
      >
        {sliderData.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="card">
              <img src={item.img} alt={item.name} className="card-img" />
              <div className="card-info">
                <h4>{item.name}</h4>
                <p>{item.role}</p>
                <p className="company">{item.company}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function CommentCard({ name, role, text, img }) {
  return (
    <div className="comment">
      <div className="d-flex">
        <div className="mr-3">
          <img src={img} alt={name} />
        </div>
        <div>
          <h4>{name}</h4>
          <p>{role}</p>
        </div>
      </div>
      <div className="isi">{text}</div>
    </div>
  );
}

export default function BerandaUtama() {
  return (
    <>
      <Header showUserInfo={false} />

      <section className="sec1">
        <div className="ucapann">
          <div className="d-flex">
            <div className="ucapan1" style={{ marginTop: "120px", marginLeft: "60px" }}>
              <h2 style={{ color: "#0A5EA8", fontWeight: "600" }}>
                "Integritas, Handal, Tangguh: Berkolaborasi dan Berinovasi Tanpa Batas!"
              </h2>
              <p style={{ color: "#808080", width: "100%" }}>
                Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan
                menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.
              </p>
              <button>Belajar Sekarang</button>
            </div>
            <div className="imgDatang">
              <img className="ceweVR" src={ceweVR} alt="Ilustrasi Cewek VR" />
              <img className="cowoTop" src={cowoTop} alt="Ilustrasi Cowok" />
            </div>
          </div>
        </div>
      </section>

      <section className="sec2">
        <h4 style={{ textAlign: "center", color: "white", paddingTop: "30px", fontWeight: "bold" }}>
          Nikmati Semua Layanan P-Know System
        </h4>
        <p style={{ textAlign: "center", color: "white", fontSize: "14px" }} className="mt-4">
          Layanan pembelajaran yang lengkap tersedia di P-KNOW System untuk memudahkan proses pembelajaran anda di
          setiap saat kapan saja dan dimana saja.
        </p>
      </section>

      <section className="sec3">
        <div className="d-flex" style={{ justifyContent: "space-between" }}>
          <div>
            <h4 style={{ color: "#0A5EA8", fontWeight: "600" }}>Kelas Pelatihan</h4>
            <p style={{ color: "#667085" }}>
              Mari bergabung di kelas ternama kami, ilmu yang diberikan pasti bermanfaat untuk anda.
            </p>
          </div>
          <div>Lihat Semua</div>
        </div>
      </section>

      <section className="sec4">
        <h4 style={{ textAlign: "center", color: "white", paddingTop: "60px", fontWeight: "bold" }}>
          Penasaran dengan kampus ASTRAtech?
        </h4>
        <p style={{ textAlign: "center", color: "white", fontSize: "14px" }} className="mt-4">
          ASTRAtech adalah value chain industri untuk penyediaan SDM unggul sekaligus kontribusi sosial mencerdaskan
          Bangsa. ASTRAtech memiliki banyak program studi yang memenuhi kebutuhan industri untuk melatih peserta didik
          dalam lingkungan kerja.
        </p>
        <div style={{ textAlign: "center" }}>
          <button
            style={{
              border: "none",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: "white",
              color: "#0A5EA8",
              fontWeight: "600",
            }}
          >
            Tentang ASTRAtech
          </button>
        </div>
        <div className="mb-0" style={{ textAlign: "center", marginTop: "110px" }}>
          <img src={iconAstra} alt="Icon ASTRA" />
        </div>
      </section>

      <section className="sec5">
        <div className="d-flex">
          <div className="perusahaan" style={{ marginTop: "60px", marginLeft: "40px" }}>
            <h3 style={{ color: "#0A5EA8", width: "80%", fontWeight: "700" }}>
              P-KNOW telah bekerja sama dengan Perusahaan ASTRA yang tersebar di seluruh Indonesia
            </h3>
            <p style={{ textAlign: "justify", width: "70%", marginTop: "20px", color: "#717375" }}>
              P-KNOW adalah platform pendidikan teknologi yang diciptakan oleh kampus ASTRAtech untuk menyediakan konten
              pembelajaran keterampilan digital dengan metode “blended-learning”.
            </p>
            <h4 style={{ marginTop: "20px", fontSize: "18px" }}>Partner Perusahaan yang Bekerja Sama dengan ASTRAtech</h4>
            <img src={perusahaan} alt="Perusahaan ASTRA" />
            <div className="mt-3">
              <button
                style={{
                  border: "none",
                  padding: "15px",
                  borderRadius: "10px",
                  backgroundColor: "#0A5EA8",
                  color: "white",
                }}
              >
                Lihat Selengkapnya
              </button>
            </div>
          </div>
          <div className="logoAstratech" style={{ marginTop: "90px", marginRight: "100px" }}>
            <img src={logo} alt="Logo ASTRAtech" width="300px" />
          </div>
        </div>
      </section>

      <section className="sec6">
        <h4 style={{ textAlign: "center", color: "white", paddingTop: "60px", fontWeight: "bold" }}>
          Apa Tanggapan P-Knowers Tentang P-KNOW System?
        </h4>
        <p style={{ textAlign: "center", color: "white", fontSize: "14px" }} className="mt-4">
          Manfaat dan kegunaan yang dirasakan oleh para P-Knowers ketika menggunakan P-KNOW System. Ayo menjadi salah
          satunya!
        </p>
        <div className="d-flex ml-4 mt-4">
          {comments.map((comment, index) => (
            <CommentCard key={index} {...comment} />
          ))}
        </div>
      </section>

      <section style={{ backgroundColor: "white" }}>
        <div>
          <h4 style={{ textAlign: "center", color: "#0A5EA8", paddingTop: "60px", fontWeight: "bold" }}>
            Mentor dan Tenaga Pendidik P-KNOW
          </h4>
        </div>
        <Slider />
      </section>

      <Footer />
    </>
  );
}
