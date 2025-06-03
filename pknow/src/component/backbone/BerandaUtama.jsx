import React from "react";
import ceweVR from "../../assets/ceweVR_beranda.png";
import cowoTop from "../../assets/cowoTop_beranda.png";
import pengguna from "../../assets/ppnaufal.png";
import logo from "../../assets/logo.png";
import perusahaan from "../../assets/perusahaan.png";
import iconAstra from "../../assets/iconAstra.png";
import sample from "../../assets/sampel55.png";
import Footer from "./Footer";
import Header from "./Header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "../../style/Beranda.css";
import "../../style/Slider.css";
import sliderLayananImg from "../../assets/slider.png";
import sliderLayananImg2 from "../../assets/slider2.jpg";
import sliderLayananImg3 from "../../assets/slider3.jpg";
import sampel2 from "../../assets/person.png";
import sampel3 from "../../assets/girll.png";
import sampel4 from "../../assets/girl3.png";
import sampel5 from "../../assets/girl4.png";
import berita1 from "../../assets/berita1.png";
import UseFetch from "../util/UseFetch"; // Pastikan lokasi `UseFetch` sesuai dengan folder Anda
import { API_LINK, ROOT_LINK } from "../util/Constants"; 
import { useEffect, useRef, useState } from "react";
import {decode} from 'he';
import AnimatedSection from "../part/AnimatedSection";


const sliderData = [
  { name: "Adila Ilma", role: "UX Designer", company: "CrescentRating", img: sample },
  { name: "Amadea Dewasanya", role: "Product Designer", company: "CrescentRating", img: sampel2 },
  { name: "Debby Surya Pradana", role: "UI/UX Designer", company: "Ekosis", img: sampel3 },
  { name: "Dialus Andari", role: "UI/UX Designer", company: "Universal Eco Pasific", img: sampel4 },
  { name: "Hutami Septiana Raswaty", role: "Digital Product Manager", company: "Telkom Indonesia", img: sampel5 },
];



const sliderBerita = [
  { name: "Program Talenta Digital 2022 Jangkau 200 Ribu", role: "Program Talenta Digital 2022 Jangkau 200 Ribu Milenial", company: "Detik.Com", img: berita1 },
  { name: "Infografis Terima Kasih Coach Shin Tae-yong", role: "Infografis Terima Kasih Coach Shin Tae-yong", company: "News.com", img: sampel2 },
  { name: "Pendorong Terjadinya Globalisasi   ", role: "Pendorong Terjadinya Globalisasi", company: "IDN.News", img: sampel3 },
  { name: "Dialus Andari", role: "UI/UX Designer", company: "Liputan6.com", img: sampel4 },
  { name: "Hutami Septiana Raswaty", role: "Digital Product Manager", company: "Daily Social", img: sampel5 },
];


function SliderPelatihan() {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sliderData, setSliderData] = useState([]);
  const [currentFilterAktif, setCurrentFilterAktif] = useState({
    page: 1,
    query: "",
    sort: "[Nama Program] desc",
    status: "Aktif",
  });

  const getListKKAktif = async () => {
    setIsError(false);
    setIsLoading(true);
    try {
      const data = await UseFetch(API_LINK + "Program/GetProgramAll", currentFilterAktif);
      if (!data || data === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mengambil data Program.");
      }
      setSliderData(data);
      setIsLoading(false);
    } catch (e) {
      console.error(e.message);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getListKKAktif();
  }, [currentFilterAktif]);

    const handleLogin = () => {
      window.location.href = ROOT_LINK + "/" + "login"; // Redirect to login page
    };

  return (
    <div className="slider-container" style={{ background: "transparent", height: "250px" }}>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>Gagal memuat data.</p>
      ) : (
        <Swiper
          spaceBetween={20}
          slidesPerView={2}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            el: ".custom-pagination",
            clickable: true,
          }}
          modules={[Autoplay, Pagination]}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
        >
          {sliderData
          .filter(item => item.Publikasi === "Terpublikasi")
          .map((item, index) => (
            <SwiperSlide key={item.Key || index}>
              <div style={{ border: "none", height: "80%", padding: "20px 10px" }}>
                <div style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", padding: "20px", borderRadius: "20px" }}>
                  <img
                    src={`${API_LINK}Upload/GetFile/${item.Gambar}`}
                    alt={item["Nama Program"]}
                    className="card-img"
                    style={{
                      borderRadius: "10px",
                      objectFit: "cover",
                      height: "180px",
                      width: "100%",
                    }}
                  />
                  <div className="card-info">
                    <h4 style={{ fontWeight: "bold", fontSize: "18px", color:"#08549F" }}>{decode(item["Nama Program"])}</h4>
                    <p style={{ color: "#667085", textAlign:"justify" }}> {decode(item.Deskripsi).substring(0, 100)}
                    {item.Deskripsi.length > 100 && "..."}</p>
                    <div style={{ display: "flex", alignItems: "center", margin: "10px 0", justifyContent:"space-between" }}>
                      <div className="">
                      {/* <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>4.3</span>
                      <span style={{ color: "#f5a623", marginRight: "5px" }}>⭐⭐⭐⭐</span> */}
                      {/* <span style={{ fontSize: "12px", color: "#667085", marginLeft: "5px" }}>
                      (16,325)
                      </span>
                  */}
                    <h5 style={{ color: "#08549F", marginTop:"5px" }}>{item.Harga && item.Harga > 0 ? (
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
                            .format(item.Harga)
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
                      )}</h5>
                    </div>
                    <div className="">
                   <button
  style={{
    backgroundColor: item.Harga && item.Harga > 0 ? "#0E6EFE" : "green",
    color: "white",
    padding: "8px 15px",
    borderRadius: "10px",
    border: "none",
    marginTop: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }}
  onClick={handleLogin}
>
  {item.Harga && item.Harga > 0 ? (
    <>
      <i className="fas fa-shopping-cart"></i> Beli
    </>
  ) : (
    "+ Gabung"
  )}
</button>

                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <div
        className="custom-pagination"
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
        }}
      ></div>
    </div>
  );
}

const sliderLayanan = [
  { img: sliderLayananImg },
  { img: sliderLayananImg2 },
  { img: sliderLayananImg3 },
  
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
    <div className="slider-container" style={{ background: "transparent", marginBottom: "200px", height: "300px" }}>
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
            <div className="" style={{ border: "none", height: "80%",padding:"20px 0px"  }}>
              <div className="" style={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", padding:"20px", borderRadius:"20px"}}>
              <img src={item.img} alt={item.name} className="card-img" style={{borderRadius:"20px", objectFit:"cover", maxHeight:"230px"}} />
              <div className="card-info">
                <h4>{item.name}</h4>
                <p style={{color:"#08549F"}} >{item.role}</p>
                <p style={{color:"#08549F"}} className="company">{item.company}</p>
              </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const handleKelas = () => {
  window.location.replace("/kelas"); // Redirect to login page
};



function SliderLayanan() {
  return (
    <div className="slider-container" style={{ background: "transparent" }}>
      <Swiper
        spaceBetween={20}
        slidesPerView={1} // Set selalu 1 slide per view
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
      >
        {sliderLayanan.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="card" style={{ border: "none", height: "100%" }}>
              <img
                src={item.img}
                alt={item.name}
                className=""
                style={{
                  width: "100%", // Pastikan gambar memenuhi lebar container
                  height: "100%", // Pastikan gambar memenuhi tinggi container
                  objectFit: "cover", // Potong gambar agar sesuai dengan proporsi
                  borderRadius: "10px", // Opsional, tambahkan sudut melengkung
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}


function SliderBerita() {
  return (
    <div className="slider-container" style={{ background: "transparent", marginBottom: "200px", height: "500px" }}>
      <Swiper
        spaceBetween={20}
        slidesPerView={3} // Set selalu 1 slide per view
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
      >
        {sliderBerita.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="" style={{ border: "none", height: "80%",padding:"20px 0px",   }}>
              <div className="" style={{boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", padding:"20px", borderRadius:"20px", background:"white"}}>
              <img src={item.img} alt={item.name} className="card-img" style={{borderRadius:"20px", objectFit:"cover", maxHeight:"230px"}} />
              <div className="card-info">
                <h4>{item.name}</h4>
                <p style={{color:"#08549F"}} >{item.role}</p>
                <p style={{color:"#08549F"}} className="company">{item.company}</p>
              </div>
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
      <AnimatedSection>
      <section className="sec1">
        <div className="ucapann">
          <div className="d-flex">
            <div className="ucapan1" style={{ marginTop: "120px", marginLeft: "60px" }}>
              <h2 style={{ color: "#0A5EA8", fontWeight: "600" }}>
                "Integritas, Handal, Tangguh: Berkolaborasi dan Berinovasi Tanpa Batas!"
              </h2>
              <p style={{ color: "#808080", width: "100%", marginTop:"20px" }}>
              Mulai langkah barumu untuk mempelajari segala hal dengan mudah dan cepat dengan P-Know System dari ASTRAtech
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
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
      <section className="sec2">
        <h4 style={{ textAlign: "center", color: "white", paddingTop: "30px", fontWeight: "bold" }}>
          Nikmati Semua Layanan P-Know System
        </h4>
        <p style={{ textAlign: "center", color: "white", fontSize: "14px" }}>
          Layanan pembelajaran yang lengkap tersedia di P-KNOW System untuk memudahkan proses pembelajaran anda di
          setiap saat kapan saja dan dimana saja.
        </p>
        <div className="slider-wrapper">
          <SliderLayanan />
        </div>
      </section>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
      <section className="sec3">
        <div className="d-flex" style={{ justifyContent: "space-between" }}>
          <div>
            <h4 style={{ color: "#0A5EA8", fontWeight: "600" }}>Kelas Pelatihan</h4>
            <p style={{ color: "#667085" }}>
              Mari bergabung di kelas ternama kami, ilmu yang diberikan pasti bermanfaat untuk anda.
            </p>
          </div>
          <div style={{color:"#0A5EA8", fontWeight:600, cursor:"pointer"}} onClick={handleKelas}>Lihat Semua</div>
        </div>
        <SliderPelatihan /> 
      </section>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
      <section className="sec4">
  <div>
    <h4
      style={{
        textAlign: "center",
        color: "white",
        paddingTop: "60px",
        fontWeight: "bold",
      }}
    >
      Penasaran dengan kampus ASTRAtech?
    </h4>
    <p
      style={{
        textAlign: "center",
        color: "white",
        fontSize: "14px",
        margin: "10px 50px",
      }}
      className="mt-4"
    >
      ASTRAtech adalah value chain industri untuk penyediaan SDM unggul sekaligus
      kontribusi sosial mencerdaskan Bangsa. ASTRAtech memiliki banyak program
      studi yang memenuhi kebutuhan industri untuk melatih peserta didik dalam
      lingkungan kerja.
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
  </div>
  <div className="mb-0" style={{ textAlign: "center" }}>
    <img src={iconAstra} alt="Icon ASTRA" />
  </div>
</section>
</AnimatedSection>

<AnimatedSection delay={0.4}>
      <section className="sec5" style={{height:"350px"}}>
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
      </AnimatedSection>

  <AnimatedSection delay={0.4}>
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
      </AnimatedSection>

    <AnimatedSection>
      <section style={{ backgroundColor: "white" }}>
        <div>
          <h4 style={{ textAlign: "center", color: "#0A5EA8", paddingTop: "60px", fontWeight: "bold" }}>
            Mentor dan Tenaga Pendidik P-KNOW
          </h4>
        </div>
        <Slider />
      </section>
      </AnimatedSection>

      <AnimatedSection>
      <section className="sec2" style={{height:"600px"}}>
        <h4 style={{ textAlign: "center", color: "white", paddingTop: "30px", fontWeight: "bold" }}>
          Hot News Activity P-KNOW
        </h4>
        <p style={{ textAlign: "center", color: "white", fontSize: "14px" }}>
          P-KNOW telah menerbitkan banyak sekali artikel yang dapat menjadi informasi dan pengetahuan terkini untuk anda.
        </p>
        <div className="slider-wrapper" style={{marginTop:"-40px"}}>
          <SliderBerita />
        </div>
      </section>
      </AnimatedSection>

      <Footer />
    </>
  );
}
