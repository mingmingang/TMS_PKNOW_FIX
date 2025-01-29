import React from "react";
import groupImage2 from "../../../../assets/astrawithcharacter.png";
import frameImage from "../../../../assets/kampusastra.png";
import mahasiswaImage from "../../../../assets/mahasiswa.png";
import developerImage from "../../../../assets/Developer.png";
// import partikel from "../../../assets/partikel.png";
import logoPartner from "../../../../assets/perusahaan.png";
import "../../../../style/TentangKami.css";
import Header from "../../../backbone/Header";
import Footer from "../../../backbone/Footer";

export default function Index() {
  return (
    <>
      <Header showUserInfo={false} />
      <div className="tentang-kami-container">
        {/* Hero Section */}
        <section className="hero-section " style={{ marginBottom: "100px" }}>
          <div className="hero-content-wrapper">
            <div className="hero-content">
              <h1 className="hero-title">Tentang P-KNOW</h1>
              <p className="hero-description">
                P-KNOW berkomitmen untuk memberikan pengalaman belajar yang
                inklusif, efektif, dan berorientasi pada hasil, dengan
                menyediakan materi pelatihan yang mudah diakses kapan saja dan
                di mana saja. Baik untuk siswa, profesional, maupun pengajar,
                P-KNOW adalah mitra terbaik dalam perjalanan menuju penguasaan
                keterampilan digital yang unggul.
              </p>
            </div>
            <div className="hero-image-wrapper">
              <img
                className="hero-image"
                src={mahasiswaImage}
                alt="Tentang Kami"
              />
            </div>
          </div>
        </section>

        <section
          className="footer-cta-section mt-4"
          style={{
            background: "white",
            color: "#005baa",
            marginBottom: "-80px",
          }}
        >
          <div className="footer-cta-content">
            <h2 className="cta-title">
              {" "}
              <i className="fas fa-lightbulb"></i> VISI
            </h2>
            <p className="cta-description" style={{ fontSize: "18px" }}>
              Menjadi platform pendidikan teknologi terkemuka yang memberdayakan
              generasi masa kini dan masa depan untuk menguasai keterampilan
              digital, menghadapi tantangan global, dan menciptakan dampak
              positif di era transformasi digital.
            </p>
          </div>
        </section>

        <section
          className="footer-cta-section"
          style={{
            background: "white",
            color: "#005baa",
            marginBottom: "100px",
          }}
        >
          <div className="footer-cta-content">
            <h2 className="cta-title">
              {" "}
              <i className="fas fa-tasks"></i> MISI
            </h2>
            <div className="mt-4">
              <div className="data">
                <div className="point">
                  1. Menyediakan Pembelajaran Berkualitas Tinggi
                </div>
                <div className="subpoint">
                  Mengembangkan dan menyediakan konten pendidikan digital yang
                  relevan, interaktif, dan berkualitas tinggi.
                </div>
              </div>
              <div className="data">
                <div className="point">
                  2. Mendorong Penguasaan Keterampilan Digital
                </div>
                <div className="subpoint">
                  Membantu individu, pelajar, dan profesional dalam
                  mengembangkan keterampilan digital di dunia kerja dan industri
                  4.0.
                </div>
              </div>
              <div className="data">
                <div className="point">
                  3. Menyediakan Pembelajaran Berkualitas Tinggi
                </div>
                <div className="subpoint">
                  Memastikan bahwa setiap orang, terlepas dari latar
                  belakangnya, memiliki akses yang mudah dan inklusif.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="hero-section "
          style={{ marginBottom: "100px", height: "60vh" }}
        >
          <div className="hero-content-wrapper">
            <div className="hero-content">
              <h1 className="hero-title">Kenali Pendiri P-KNOW</h1>
              <p className="hero-description">
                Kami adalah tim pendiri P-KNOW, sebuah sistem pendidikan
                inovatif yang lahir dari Departemen Sumber Daya ASTRAtech.
                Dengan semangat kolaborasi dan visi untuk menciptakan dampak
                positif, kami mengembangkan platform ini untuk menjawab
                kebutuhan akan pembelajaran digital yang relevan di era
                transformasi teknologi.
              </p>
            </div>
            <div className="hero-image-wrapper">
              <img
                className="hero-image"
                src={developerImage}
                alt="Tentang Kami"
              />
            </div>
          </div>
        </section>

        {/* Nilai Kami Section */}
        <section class="nilai-kami-section">
          <div class="nilai-content">
            <div class="nilai-image-wrapper">
              <img src={groupImage2} alt="Nilai Kami" class="nilai-image" />
            </div>
            <div class="nilai-text-wrapper">
              <h2 class="section-title">Nilai Kami</h2>
              <p class="section-description">
                Integritas, Handal, Inovasi dan Kolaborasi adalah fondasi utama
                yang kami pegang dalam setiap langkah perjalanan kami.
              </p>
            </div>
          </div>
        </section>

        {/* Partner Kami Section */}
        <section className="partner-kami-section">
          <h2 className="section-title">Partner Kami</h2>
          <p className="section-description">
            ASTRAtech adalah value chain industri untuk penyediaan SDM unggul
            sekaligus kontribusi sosial mencerdaskan Bangsa.
          </p>
          <div className="partner-logos">
            <img
              src={logoPartner}
              alt="Partner Logos"
              className="partner-logo"
            />
          </div>
        </section>

        {/* Footer CTA Section */}
        <section className="footer-cta-section" style={{ paddingTop: "70px" }}>
          <div className="footer-cta-content">
            <h2 className="cta-title">Bergabunglah Bersama Kami</h2>
            <p className="cta-description">
              Kami mengundang Anda untuk menjadi bagian dari perjalanan kami
              dalam membangun masa depan yang lebih baik.
            </p>
            <button className="cta-button">Hubungi Kami</button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
