import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/pknow.png";
import "../../style/Header.css";
import Konfirmasi from "../part/Konfirmasi"; // Import your confirmation component
const activeURL = location.protocol + "//" + location.host + location.pathname;
import { API_LINK, APPLICATION_ID, ROOT_LINK } from "../util/Constants";
import UseFetch from "../util/UseFetch";
import Daftar from "../page/daftar/Index";
import he from 'he';

function setActiveMenu(menu) {
  active_menu = menu;
}

export default function Header({
  showMenu = false,
  userProfile = {},
  listMenu,
  konfirmasi = "Konfirmasi",
  pesanKonfirmasi = "Apakah Anda yakin ingin keluar?",
  showUserInfo = true, // Prop to conditionally show/hide user info
  showButtonLoginDaftar = true,
}) {
  const [activeMenu, setActiveMenu] = useState(() => {
    // Ambil state activeMenu dari localStorage
    return localStorage.getItem("activeMenu") || "";
  });

  const [isProfileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countNotifikasi, setCountNotifikasi] = useState("");

  const handleMenuClick = (menu, url) => {
    setActiveMenu(menu);
    localStorage.setItem("activeMenu", menu); // Simpan activeMenu ke localStorage
    window.location.replace(url); // Navigasi menggunakan window.location.replace
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2); // Ambil maksimal 2 karakter
  };

  // Icon mapping for sub-menu items
  const iconMapping = {
    "Kelola Kelompok Keahlian": "fas fa-cogs",
    "Kelola Anggota": "fas fa-users",
    "Daftar Pustaka": "fas fa-book",
    Materi: "fas fa-graduation-cap",
    "PIC Kelompok Keahlian": "fas fa-users",
    "Persetujuan Anggota Keahlian": "fas fa-check",
    "Pengajuan Kelompok Keahlian": "fas fa-paper-plane",
    "Riwayat Pengajuan": "fas fa-history",
    "Kelola Program": "fas fa-tasks",
    "Kelola Materi": "fas fa-book-open",
  };

  const handleConfirmYes = () => {
    window.location.replace("/logout"); // Redirect to login page
    setShowConfirmation(false); // Hide the confirmation dialog
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false); // Just close the confirmation modal
  };

  const handleLogoutClick = () => {
    setShowConfirmation(true); // Show confirmation modal on logout click
  };

  const handleNotification = () => {
    //localStorage.removeItem("activeMenu");
    window.location.replace("/notifications"); // Redirect to login page
  };

  const handleDashboard = () => {
    //localStorage.removeItem("activeMenu");
    window.location.replace("/dashboard/profil"); // Redirect to login page
  };

  const handleKelas = () => {
    //localStorage.removeItem("activeMenu");
    window.location.replace("/dashboard/kelas_saya"); // Redirect to login page
  };

  const handleSertifikat = () => {
    //localStorage.removeItem("activeMenu");
    window.location.replace("/dashboard/sertifikat"); // Redirect to login page
  };

  const handlePembelian = () => {
    //localStorage.removeItem("activeMenu");
    window.location.replace("/dashboard/pembelian"); // Redirect to login page
  };

  const handleProfile = () => {
    window.location.replace("/profile"); // Redirect to login page
  };

  const handleDaftar = () => {
    //localStorage.removeItem("activeMenu");
    window.location.href = ROOT_LINK + "/" + "daftar"; // Redirect to login page
  };

  const handleLogin = () => {
    //localStorage.removeItem("activeMenu");
    window.location.href = ROOT_LINK + "/" + "login"; // Redirect to login page
  };

  const handleBeranda = () => {
    window.location.href = ROOT_LINK + "/" + "beranda"; // Redirect to login page
  };

  const handleTentangKami = () => {
    window.location.href = ROOT_LINK + "/" + "tentang_pknow"; // Redirect to login page
  };

  useEffect(() => {
    if (showMenu) {
      const activeMenuItem = listMenu.find((menu) => activeURL === menu.link);
      if (activeMenuItem) {
        setActiveMenu(activeMenuItem.head);
      }
    }
  }, [activeURL, listMenu, showMenu]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetDataCountingNotifikasi",
          { application: APPLICATION_ID }
        );

        if (data === "ERROR") {
          throw new Error();
        } else {
          setCountNotifikasi(data[0].counting);
        }
      } catch {
        setCountNotifikasi("");
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <nav>
        <div className="">
          <img
            src={logo}
            alt="Logo ASTRAtech"
            title="Logo ASTRAtech"
            width="190px"
          />
        </div>
        {showButtonLoginDaftar && (
          <div className="menu-profile-container">
            <div className="menu">
              <ul className="menu-center">
                <li>
                  <a
                    // className={`menu-item ${
                    //   activeMenu === "beranda" ? "active" : ""
                    // }`}
                    onClick={() => handleMenuClick("beranda", "beranda")}
                    style={{
                      color: "#095DA8",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    Beranda
                  </a>
                </li>
                <li>
                  <a
                    // className={`menu-item ${
                    //   activeMenu === "landing_training" ? "active" : ""
                    // }`}
                    onClick={() => handleMenuClick("landing_training", "landing_training")}
                    style={{
                      color: "#095DA8",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    Class Training
                  </a>
                </li>
                <li>
                  <a
                    // className={`menu-item ${
                    //   activeMenu === "tentang_pknow" ? "active" : ""
                    // }`}
                    onClick={() =>
                      handleMenuClick("tentang_pknow", "tentang_pknow")
                    }
                    style={{
                      color: "#095DA8",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    Tentang Kami
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}

        {showMenu && (
          <div className="menu-profile-container">
            <div className="menu">
              <ul className="menu-center">
                {listMenu.map((menu) => {
                  if (menu.isHidden) return null;
                  const isActive =
                    localStorage.getItem("activeMenu") === menu.head;
                  return (
                    <li
                      key={menu.headkey}
                      // className={isActive ? "active" : ""} // Tambahkan kelas "active"
                    >
                      <a
                        href={menu.link}
                        onClick={(e) => {
                          e.preventDefault(); // Hindari reload
                          localStorage.setItem("activeMenu", menu.head); // Simpan menu aktif
                          setActiveMenu(menu.head); // Update state
                          window.location.replace(menu.link);
                          // Redirect ke link
                        }}
                        // className={`menu-item ${isActive ? "active" : ""}`}
                      >
                        <div className="menu-item-content">
                          {/* Render ikon jika ada */}
                          {menu.icon && <i className={menu.icon}></i>}
                          <span>{menu.head}</span>
                        </div>
                      </a>

                      {/* Render sub-menu jika ada */}
                      {menu.sub && menu.sub.length > 0 && (
                        <ul className="dropdown-content">
                          {menu.sub.map((sub) => {
                            const subIconClass = iconMapping[sub.title] || "";

                            return (
                              <li key={sub.link}>
                                <a
                                  href={sub.link}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    localStorage.setItem(
                                      "activeMenu",
                                      `${menu.head} - ${sub.title}`
                                    );
                                    window.location.replace(sub.link);
                                  }}
                                >
                                  {/* Render ikon sub-menu jika ada */}
                                  {subIconClass && (
                                    <i className={subIconClass}></i>
                                  )}
                                  <span>{sub.title}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div
          className="profile"
          style={{ marginRight: "-100px", cursor: "pointer" }}
        >
          {/* Conditionally render user info if showUserInfo is true */}
          {showUserInfo && (
            <div className="pengguna">
              <h3>{he.decode(userProfile.name)}</h3>
              <h4>{userProfile.role}</h4>
              <p>Terakhir Masuk: {userProfile.lastLogin}</p>
            </div>
          )}
           {showUserInfo && (
          <div
            className="fotoprofil"
            onMouseEnter={() => setProfileDropdownVisible(true)} // Show dropdown on hover
            onMouseLeave={() => setProfileDropdownVisible(false)} // Hide dropdown when hover ends
          >
            {userProfile.photo ? (
              <img src={userProfile.photo} alt="Profile" />
            ) : (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#e0e7ff",
                  color: "#1a73e8",
                  fontWeight: "bold",
                  fontSize: "24px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto 10px",
                }}
              >
                {getInitials(userProfile.name)}
              </div>
            )}

            {isProfileDropdownVisible && (
              <ul
                className="profile-dropdown"
                style={{ marginLeft: "-180px", width: "250px" }}
              >
                <li>
                  <span
                    onClick={handleDashboard}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="">
                      <i
                        className="fas fa-home mr-1"
                        style={{ color: "#0A5EA8" }}
                      ></i>{" "}
                      <span style={{ color: "#0A5EA8" }}>Dashboard Saya </span>
                    </div>
                   
                  </span>
                </li>
                <li>
                  <span
                    onClick={handleKelas}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="">
                      <i
                        className="fas fa-book mr-2"
                        style={{ color: "#0A5EA8" }}
                      ></i>{" "}
                      <span style={{ color: "#0A5EA8", textAlign: "left" }}>
                        Kelas{" "}
                      </span>
                    </div>
                    
                  </span>
                </li>
                <li>
                  <span
                    onClick={handleSertifikat}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="">
                      <i
                        className="fas fa-award mr-1"
                        style={{ color: "#0A5EA8" }}
                      ></i>{" "}
                      <span style={{ color: "#0A5EA8" }}>Sertifikat </span>
                    </div>
                   
                  </span>
                </li>
                <li>
                  <span
                    onClick={handlePembelian}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="">
                      <i
                        className="fas fa-money-bill mr-1"
                        style={{ color: "#0A5EA8" }}
                      ></i>{" "}
                      <span style={{ color: "#0A5EA8" }}>Pembelian </span>
                    </div>
                  
                  </span>
                </li>
                <li>
                  <span
                    onClick={handleNotification}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div className="">
                      <i
                        className="fas fa-bell mr-2"
                        style={{ color: "#0A5EA8" }}
                      ></i>{" "}
                      <span style={{ color: "#0A5EA8" }}>Notifikasi </span>
                    </div>
                    <span
                      style={{
                        background: "red",
                        borderRadius: "50%",
                        paddingLeft: "5px",
                        paddingRight: "5px",
                        color: "white",
                      }}
                    >
                      {countNotifikasi || 0}
                    </span>
                  </span>
                </li>
                <li>
                  <span
                    onClick={handleLogoutClick}
                    className="keluar"
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className="fas fa-sign-out-alt"
                      style={{ color: "red" }}
                    ></i>{" "}
                    <span style={{ color: "red" }}>Logout</span>
                  </span>
                </li>
              </ul>
            )}
          </div>
          )}
        </div>

        <div className="btnlogindaftar">
          {/* Conditionally render user info if showUserInfo is true */}
          {showButtonLoginDaftar && (
            <>
              <div className="d-flex">
                <div
                  className="daftar mt-2 mr-4"
                  style={{
                    color: "#0A5EA8",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={handleDaftar} // Using a function to render the Daftar component
                >
                  Daftar
                </div>

                <div
                  className="login py-2 px-4"
                  style={{
                    background: "#0A5EA8",
                    color: "white",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={handleLogin}
                >
                  Masuk
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Show confirmation dialog if the state is true */}
      {showConfirmation && (
        <Konfirmasi
          title={konfirmasi} // Pass the title
          pesan={pesanKonfirmasi} // Pass the message
          onYes={handleConfirmYes} // Handle Yes click
          onNo={handleConfirmNo} // Handle No click
        />
      )}
    </div>
  );
}
