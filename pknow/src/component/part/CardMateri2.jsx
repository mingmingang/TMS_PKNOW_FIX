import { useState } from "react";
import Icon from "./Icon.jsx";
import Button from "./Button.jsx";
import AppContext_master from "../page/Materi/master-proses/MasterContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faBook } from "@fortawesome/free-solid-svg-icons";
import AppContext_test from "../page/Materi/master-test/TestContext.jsx";
import { API_LINK } from "../util/Constants.js";
import "../../style/KelompokKeahlian.css";
import review from "../../assets/reviewJawaban.png";

function CardMateri({
  materis,
  onStatus,
  onDelete,
  onEdit,
  onReviewJawaban,
  onBacaMateri,
  onDetail,
  MAX_DESCRIPTION_LENGTH = 100,
  isNonEdit,
}) {
  const [expandDeskripsi, setExpandDeskripsi] = useState({});

  const handleExpandDescription = (bookId) => {
    setExpandDeskripsi((prevState) => ({
      ...prevState,
      [bookId]: !prevState[bookId],
    }));
  };

  const handleStatusChange = (book) => {
    console.log(`Status buku ${book.Key} diubah`);
    onStatus(book.Key);
  };

  const handleDeleteMateri = (book) => {
    console.log(`Materi ${book.Key} dihapus`);
    onDelete(book.Key);
  };

  const handleBacaMateri = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    AppContext_test.refreshPage += 1;
    onBacaMateri("pengenalan", true, AppContext_master.materiId, true);
  };

  const handleReviewJawaban = (book) => {
    AppContext_test.materiId = book.Key;
    AppContext_master.materiId = book.Key;
    onReviewJawaban("reviewjawaban", true, book.Key, true);
  };

  // onClick={() => onDetail("materiDetail", AppContext_test.DetailMateri = book, AppContext_master.DetailMateri = book)}

  return (
    <div className="container">
      <div className="row mt-0 gx-4 ml-0 ">
        {materis.map((book, index) => {
          if (book.Key == null) {
            return null;
          }
          return (
            <div className="col-md-4 mb-4" key={book.Key}>
              <div
                className="bg-white-kk"
                style={{
                  borderColor: book.Status === "Aktif" ? "blue" : "grey",
                }}
              >
                <div className="">
                  <img
                    className="cover-daftar-kk"
                    src={book.Gambar}
                    alt="gambar"
                  />
                  <div>
                    <h3
                      className="text-xl font-bold text-blue-600 mt-3"
                      style={{ fontSize: "20px", textAlign: "justify" }}
                    >
                      {book.Judul}
                    </h3>
                    <div className="mb-1 mt-3" style={{ fontSize: "16px" }}>
                      <FontAwesomeIcon
                        icon={faBook}
                        style={{
                          marginRight: "10px",
                          marginLeft: "20px",
                          fontWeight: "600",
                          color: "black",
                        }}
                      />
                      <span
                        style={{
                          color: "black",
                          fontSize: "16px",
                          fontWeight: "600",
                        }}
                      >
                        {book.Kategori}
                      </span>
                    </div>
                    <div
                      className="mb-1 mt-3"
                      style={{
                        color: "black",
                        fontSize: "16px",
                        fontWeight: "600",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        style={{
                          marginRight: "10px",
                          marginLeft: "20px",
                          fontWeight: "600",
                          color: "black",
                        }}
                      />
                      {book.Uploader} •{" "}
                      {book.Creadate
                        ? new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(new Date(book.Creadate))
                        : "Tanggal Tidak Tersedia"}
                    </div>
                    <p
                      className="card-text p-0 mt-3 mb-1"
                      style={{
                        fontSize: "15px",

                        overflow: "hidden",
                        textAlign: "justify",
                        marginLeft: "16px",
                        color: "grey",
                      }}
                    >
                    {
  book.Keterangan.length > MAX_DESCRIPTION_LENGTH ? (
    !expandDeskripsi[book.Key] ? (
      <>
        {/* Tampilkan hanya 100 karakter pertama */}
        {book.Keterangan.slice(0, MAX_DESCRIPTION_LENGTH) + " ..."}
        <a
          className="btn btn-link text-decoration-none p-0"
          onClick={() => handleExpandDescription(book.Key)}
          style={{ fontSize: "12px" }}
        >
          Baca Selengkapnya <Icon name={"caret-down"} />
        </a>
      </>
    ) : (
      <>
        {/* Tampilkan seluruh teks */}
        {book.Keterangan}
        <a
          className="btn btn-link text-decoration-none p-0"
          onClick={() => handleExpandDescription(book.Key)}
          style={{ fontSize: "12px" }}
        >
          Tutup <Icon name={"caret-up"} />
        </a>
      </>
    )
  ) : (

    <>{book.Keterangan}</>
  )
}
                    </p>
                  </div>
                </div>

                <div
                  className="card-footer d-flex justify-content-end bg-white mr-4 mb-4"
                  style={{
                    borderRadius: "14px",
                    fontSize: "18px",
                    marginBottom: "15px",
                    height: "70px",
                  }}
                >
                  {isNonEdit === false ? (
                    <>
                      {book.Status === "Aktif" && (
                        <button
                          className="btn btn-sm text-primary"
                          title="Edit Materi"
                          onClick={() =>
                            onEdit(
                              "pengenalanEdit",
                              (AppContext_test.DetailMateriEdit = book),
                              (AppContext_test.DetailMateri = book),
                              (AppContext_master.DetailMateri = book)
                            )
                          }
                        >
                          <i
                            className="fas fa-edit"
                            style={{ fontSize: "20px" }}
                          ></i>
                        </button>
                      )}
                      <button
                        className="btn btn-circle"
                        onClick={() => handleStatusChange(book)}
                      >
                        {book.Status === "Aktif" ? (
                          <i
                            className="fas fa-toggle-on text-primary"
                            style={{ fontSize: "20px" }}
                          ></i>
                        ) : (
                          <i
                            className="fas fa-toggle-off text-red"
                            style={{ fontSize: "20px" }}
                          ></i>
                        )}
                      </button>
                      <button
                        className="btn btn-sm text-primary"
                        title="Review Jawaban"
                        onClick={() => handleReviewJawaban(book)}
                      >
                        <img src={review} alt="" width="25px" />
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ color: "red" }}
                        title="Review Jawaban"
                        onClick={() => handleDeleteMateri(book)}
                      >
                        <i
                          className="fas fa-trash"
                          style={{ fontSize: "20px" }}
                        ></i>
                      </button>
                    </>
                  ) : (
                    <div className="">
                      <button
                        className="btn btn-outline-primary mt-4 ml-2"
                        type="button"
                        onClick={() => handleBacaMateri(book)}
                      >
                        Baca Materi
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardMateri;
