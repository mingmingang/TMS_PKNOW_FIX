import logo from "../../assets/pknow.png";
import "../../style/Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="footer-section">
        <img src={logo} alt="ASTRAtech" width="150" />
      </div>
      <div className="footer-detail">
        <div className="footer-section">
          <h3>Alamat</h3>
          <p>
            Kampus Cikarang: Jl. Gaharu Blok F3 Delta Silicon II Cibatu,
            Cikarang Selatan Kota Bekasi Jawa Barat 17530
          </p>
          <br />
          <p>
            Kampus Sunter: PT Astra International Tbk Komplek B Lantai 5 Jl.
            Gaya Motor Raya No.8, Sunter II North Jakarta 14330
          </p>
        </div>
        <div className="footer-section">
          <h3>Program</h3>
          <ul>
            <li>
              <a href="#">Career</a>
            </li>
            <li>
              <a href="https://www.polytechnic.astra.ac.id/tentang/">About Us</a>
            </li>
            <li>
              <a href="https://lppm.polytechnic.astra.ac.id/">Penelitian & Publikasi</a>
            </li>
            <li>
              <a href="https://www.polytechnic.astra.ac.id/berita/">Blog</a>
            </li>
          </ul>
        </div>
        <div className="footer-section hide-on-mobile">
          <h3>About</h3>
          <ul>
            <li>
              <a href="#">Career</a>
            </li>
            <li>
              <a href="https://www.polytechnic.astra.ac.id/tentang/">About Us</a>
            </li>
            <li>
              <a href="https://lppm.polytechnic.astra.ac.id/">Penelitian & Publikasi</a>
            </li>
            <li>
              <a href="https://www.polytechnic.astra.ac.id/berita/">Blog</a>
            </li>
          </ul>
        </div>
        <div className="footer-section hide-on-mobile">
          <h3>Bantuan</h3>
          <div className="footer-section-prodi">
            <div className="footer-program-studi">
              <ul>
                <li>
                  <a href="https://www.polytechnic.astra.ac.id/program-studi/">FAQ</a>
                </li>
                <li>
                  <a href="https://www.polytechnic.astra.ac.id/program-studi/">Syarat & Ketentuan</a>
                </li>
                <li>
                  <a href="https://www.polytechnic.astra.ac.id/program-studi/">Kebijakan Privasi</a>
                </li>
                <li>
                  <a href="https://www.polytechnic.astra.ac.id/program-studi/">Kebijakan Garansi</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Copyright © 2024 - MIS ASTRAtech</p>
      </div>
    </footer>
  );
}
