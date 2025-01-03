import React, { useRef, useState, useEffect } from "react";
import Button from "../../../../part/Button copy";
import { object, string } from "yup";
import Input from "../../../../part/Input";
import Loading from "../../../../part/Loading";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  validateAllInputs,
  validateInput,
} from "../../../../util/ValidateForm";
import { API_LINK } from "../../../../util/Constants";
import FileUpload from "../../../../part/FileUpload";
import uploadFile from "../../../../util/UploadImageQuiz";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import AppContext_master from "../../master-test/TestContext";
import AppContext_test from "../../master-test/TestContext";
import Alert from "../../../../part/Alert";
import Cookies from "js-cookie";
import { decryptId } from "../../../../util/Encryptor";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";

const steps = [
    "Pengenalan",
    "Materi",
    "Forum",
    "Sharing Expert",
    "Pre Test",
    "Post Test",
  ];

function getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return 'pengenalanEdit';
      case 1:
        return 'materiEdit';
      case 2:
        return 'forumEdit';
        case 3:
        return 'sharingEdit';
      case 4:
        return 'pretestEdit';
        case 5:
        return 'posttestEdit';
      default:
        return 'Unknown stepIndex';
    }
  }

  function CustomStepper({ activeStep, steps, onChangePage, getStepContent }) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step
              key={label}
              onClick={() => onChangePage(getStepContent(index))}
              sx={{
                cursor: "pointer",
                "& .MuiStepIcon-root": {
                  fontSize: "1.5rem",
                  color: index <= activeStep ? "primary.main" : "grey.300",
                  "&.Mui-active": {
                    color: "primary.main",
                  },
                  "& .MuiStepIcon-text": {
                    fill: "#fff",
                    fontSize: "1rem",
                  },
                },
              }}
            >
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    typography: "body1",
                    color: index <= activeStep ? "primary.main" : "grey.500",
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  }
  


export default function MasterPostTestEdit({ onChangePage, withID }) {
  const [formContent, setFormContent] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [timer, setTimer] = useState("");
  const [minimumScore, setMinimumScore] = useState();
  const gambarInputRef = useRef(null);
  const [tempChoices, setTempChoices] = useState([]);
  const [deletedChoices, setDeletedChoices] = useState([]);

  //INI SAHAR
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  //INI SAHAR
  const [formData, setFormData] = useState({
    quizId: "",
    materiId: "",
    quizJudul: "",
    quizDeskripsi: "",
    quizTipe: "Posttest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: "",
    status: "Aktif",
    modifby: activeUser,
  });

  //INI SAHAR
  const filteredData = {
    quizId: formData.quizId,
    materiId: formData.materiId,
    quizJudul: formData.quizJudul,
    quizDeskripsi: formData.quizDeskripsi,
    quizTipe: formData.quizTipe,
    tanggalAwal: formData.tanggalAwal,
    tanggalAkhir: formData.tanggalAkhir,
    timer: formData.timer,
    status: formData.status,
    modifby: formData.modifby,
  };

  //INI SAHAR
  const [formQuestion, setFormQuestion] = useState({
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: "",
    questionDeskripsi: "",
    status: "Aktif",
    quemodifby: activeUser,
  });

  // formData.timer = timer;

  //INI SAHAR
  const [formChoice, setFormChoice] = useState({
    urutanChoice: "",
    isiChoice: "",
    questionId: "",
    nilaiChoice: "",
    quemodifby: activeUser,
  });

  //INI SAHAR
  const userSchema = object({
    quizId: string(),
    materiId: string(),
    quizJudul: string(),
    quizDeskripsi: string().required("Quiz deskripsi harus diisi"),
    quizTipe: string(),
    tanggalAwal: string().required("Tanggal awal harus diisi"),
    tanggalAkhir: string().required("Tanggal akhir harus diisi"),
    timer: string().required("Durasi harus diisi"),
    status: string(),
    modifby: string(),
  });

  // const handleJenisTypeChange = (e, questionIndex) => {
  //   const { value } = e.target;

  //   setFormContent((prevFormContent) => {
  //     const updatedFormContent = [...prevFormContent];
  //     updatedFormContent[questionIndex].jenis = value;

  //     // Tambahkan nilai cho_tipe berdasarkan jenis pilihan
  //     updatedFormContent[questionIndex].cho_tipe = value; // Tunggal atau Jamak

  //     // Reset opsi jika tipe berubah
  //     updatedFormContent[questionIndex].options = [];

  //     setSelectedOptions((prevSelected) => {
  //       const updatedSelected = [...prevSelected];
  //       updatedSelected[questionIndex] = value === "Tunggal" ? "" : [];
  //       return updatedSelected;
  //     });

  //     return updatedFormContent;
  //   });
  // };

  const handleJenisTypeChange = (e, questionIndex) => {
    const { value } = e.target;

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      const question = updatedFormContent[questionIndex];

      const choicesToDelete = question.options
        .filter((option) => option.id) // Ambil hanya opsi yang sudah ada di DB
        .map((option) => option.id);

      setDeletedChoices((prev) => [...prev, ...choicesToDelete]);

      // Reset opsi kosong untuk memulai pembuatan ulang

      question.jenis = value; // Perbarui jenis pilihan (Tunggal/Jamak)
      question.options = [];

      console.log("NIH", updatedFormContent);
      return updatedFormContent;
    });
  };


  /* ----- Handle Function Start ---- */

  const Materi = AppContext_master.DetailMateriEdit;
  const hasTest = Materi.Posttest !== null && Materi.Posttest !== "";

  //INI SAHAR
  // async function fetchSectionAndQuizData() {
  //   setIsLoading(true);
  //   try {
  //     const sectionResponse = await axios.post(
  //       API_LINK + "Section/GetDataSectionByMateri",
  //       {
  //         p1: Materi.Key,
  //         p2: "Post-Test",
  //         p3: "Aktif",
  //       }
  //     );
  //     const sectionData = sectionResponse.data;

  //     console.log("Section", sectionResponse.data);
  //     if (sectionData.length === 0) {
  //       throw new Error("Section data not found.");
  //     }

  //     const sectionId = sectionData[0].SectionId;

  //     // Fetch quiz data using sectionId
  //     const quizResponse = await axios.post(
  //       API_LINK + "Quiz/GetDataQuizByIdSection",
  //       {
  //         secId: sectionId,
  //       }
  //     );
  //     const quizData = quizResponse.data;

  //     console.log("quiz res", quizResponse.data);
  //     if (quizData.length === 0) {
  //       throw new Error("Quiz data not found.");
  //     }

  //     // Process quiz data
  //     const convertedData = {
  //       ...quizData[0],
  //       tanggalAwal: quizData[0]?.tanggalAwal
  //         ? new Date(quizData[0].tanggalAwal).toISOString().split("T")[0]
  //         : "",
  //       tanggalAkhir: quizData[0]?.tanggalAkhir
  //         ? new Date(quizData[0].tanggalAkhir).toISOString().split("T")[0]
  //         : "",
  //     };

  //     setTimer(
  //       quizData[0]?.timer ? convertSecondsToTimeFormat(quizData[0].timer) : ""
  //     );
  //     setFormData(convertedData);
  //     console.log("Quiz Data:", convertedData);
  //   } catch (error) {
  //     console.error("Error:", error.message);
  //     setIsError((prevError) => ({
  //       ...prevError,
  //       error: true,
  //       message: error.message,
  //     }));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  async function fetchSectionAndQuizData() {
    setIsLoading(true);
    try {
      const sectionResponse = await axios.post(
        API_LINK + "Section/GetDataSectionByMateri",
        {
          p1: Materi.Key,
          p2: "Post-Test",
          p3: "Aktif",
        }
      );
      const sectionData = sectionResponse.data;

      console.log("Section", sectionResponse.data);
      if (sectionData.length === 0) {
        throw new Error("Section data not found.");
      }

      const sectionId = sectionData[0].SectionId;

      // Fetch quiz data using sectionId
      const quizResponse = await axios.post(
        API_LINK + "Quiz/GetDataQuizByIdSection",
        {
          secId: sectionId,
        }
      );
      const quizData = quizResponse.data;

      console.log("quiz res", quizResponse.data);
      if (quizData.length === 0) {
        throw new Error("Quiz data not found.");
      }

      // Process quiz data
      const convertedData = {
        ...quizData[0],
        tanggalAwal: quizData[0]?.tanggalAwal
          ? new Date(quizData[0].tanggalAwal).toISOString().split("T")[0]
          : "",
        tanggalAkhir: quizData[0]?.tanggalAkhir
          ? new Date(quizData[0].tanggalAkhir).toISOString().split("T")[0]
          : "",
      };

      setTimer(
        quizData[0]?.timer ? convertSecondsToTimeFormat(quizData[0].timer) : ""
      );
      setFormData(convertedData);
      console.log("Quiz Data:", convertedData);
    } catch (error) {
      console.error("Error:", error.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    } finally {
      setIsLoading(false);
    }
  }


  //INI SAHAR
  // Call the combined function when the component mounts
  useEffect(() => {
    fetchSectionAndQuizData();
  }, []);

  //INI SAHAR
  // const getDataQuestion = async () => {
  //   setIsLoading(true);

  //   try {
  //     while (true) {
  //       const { data } = await axios.post(API_LINK + "Quiz/GetDataQuestion", {
  //         quiId: formData.quizId,
  //       });
  //       console.log("id qui", formData.quizId)
  //       console.log("dataa", data)
  //       if (data === "ERROR") {
  //         throw new Error("Terjadi kesalahan: Gagal mengambil data quiz.");
  //       } else if (data.length === 0) {
  //         await new Promise((resolve) => setTimeout(resolve, 2000));
  //       } else {
  //         const formattedQuestions = {};
  //         const filePromises = [];

  //         data.forEach((question) => {
  //           // Jika pertanyaan sudah ada di formattedQuestions, tambahkan opsi baru
  //           if (question.Key in formattedQuestions) {
  //             if (question.TipeSoal === "Pilgan") {
  //               formattedQuestions[question.Key].options.push({
  //                 id: question.JawabanId,
  //                 label: question.Jawaban,
  //                 point: question.NilaiJawabanOpsi,
  //                 key: question.Key,
  //                 tipe : question.Tipe
  //               });
  //             }
  //           } else {
  //             // Tambahkan pertanyaan baru
  //             formattedQuestions[question.Key] = {
  //               type: question.TipeSoal,
  //               text: question.Soal,
  //               options: question.TipeSoal === "Pilgan" ? [] : [],
  //               gambar: question.Gambar || "",
  //               img: question.Gambar || "",
  //               point: question.NilaiJawaban,
  //               key: question.Key,
  //               correctAnswer:
  //                 question.TipeSoal === "Essay"
  //                   ? question.JawabanBenar || ""
  //                   : null,
  //             };

  //             if (question.TipeSoal === "Pilgan" && question.JawabanId) {
  //               formattedQuestions[question.Key].options.push({
  //                 id: question.JawabanId,
  //                 label: question.Jawaban,
  //                 point: question.NilaiJawabanOpsi,
  //                 key: question.Key,
  //                 tipe : question.Tipe
  //               });
  //             }
  //           }

  //           // Jika ada gambar, fetch gambar
  //           if (question.Gambar) {
  //             const gambarPromise = fetch(
  //               `${API_LINK}Utilities/DownloadFile?namaFile=${encodeURIComponent(
  //                 question.Gambar
  //               )}`
  //             )
  //               .then((response) => {
  //                 if (!response.ok) {
  //                   throw new Error(
  //                     `Error fetching gambar: ${response.status} ${response.statusText}`
  //                   );
  //                 }
  //                 return response.blob();
  //               })
  //               .then((blob) => {
  //                 const url = URL.createObjectURL(blob);
  //                 formattedQuestions[question.Key].gambar = url;
  //               })
  //               .catch((error) => {
  //                 console.error("Error fetching gambar:", error.message);
  //               });

  //             filePromises.push(gambarPromise);
  //           }
  //         });

  //         // Tambahkan setelah forEach selesai memproses data pertanyaan
  //         Object.keys(formattedQuestions).forEach((key) => {
  //           if (formattedQuestions[key].options.length > 0) {
  //             formattedQuestions[key].options.sort(
  //               (a, b) => a.urutan - b.urutan
  //             );
  //           }
  //         });

  //         await Promise.all(filePromises);
  //         const formattedQuestionsArray = Object.values(formattedQuestions);
  //         setFormContent(formattedQuestionsArray);
  //         console.log("question", formattedQuestionsArray);
  //         setIsLoading(false);
  //         break;
  //       }
  //     }
  //   } catch (e) {
  //     setIsLoading(false);
  //     console.log(e.message);
  //     setIsError((prevError) => ({
  //       ...prevError,
  //       error: true,
  //       message: e.message,
  //     }));
  //   }
  // };

  const getDataQuestion = async () => {
    setIsLoading(true);

    try {
      while (true) {
        const { data } = await axios.post(API_LINK + "Quiz/GetDataQuestion", {
          quiId: formData.quizId,
        });
        console.log("id qui", formData.quizId);
        console.log("Data mentah dari API:", data);

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data quiz.");
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const formattedQuestions = {};
          const filePromises = [];

          data.forEach((question) => {
            // Jika pertanyaan sudah ada di formattedQuestions, tambahkan opsi baru
            if (question.Key in formattedQuestions) {
              if (question.TipeSoal === "Pilgan") {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.NilaiJawabanOpsi,
                  key: question.Key,
                  jenis: question.TipePilihan,
                  isChecked: !!question.NilaiJawabanOpsi,
                });
              }
            } else {
              // Tambahkan pertanyaan baru
              formattedQuestions[question.Key] = {
                type: question.TipeSoal,
                text: question.Soal,
                options: question.TipeSoal === "Pilgan" ? [] : [],
                jenis: question.TipePilihan, // Tambahkan properti jenis
                gambar: question.Gambar || "",
                img: question.Gambar || "",
                point: question.NilaiJawaban,
                key: question.Key,
                correctAnswer:
                  question.TipeSoal === "Essay"
                    ? question.JawabanBenar || ""
                    : null,
              };
              console.log(
                "Data yang diproses ke formContent:",
                formattedQuestions[question.Key]
              );

              if (question.TipeSoal === "Pilgan" && question.JawabanId) {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.NilaiJawabanOpsi,
                  key: question.Key,
                  jenis: question.TipePilihan,
                  isChecked: !!question.NilaiJawabanOpsi,
                });
              }
            }

            console.log("formContent initial state:", formContent);

            // Jika ada gambar, fetch gambar
            if (question.Gambar) {
              const gambarPromise = fetch(
                `${API_LINK}Utilities/DownloadFile?namaFile=${encodeURIComponent(
                  question.Gambar
                )}`
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(
                      `Error fetching gambar: ${response.status} ${response.statusText}`
                    );
                  }
                  return response.blob();
                })
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  formattedQuestions[question.Key].gambar = url;
                })
                .catch((error) => {
                  console.error("Error fetching gambar:", error.message);
                });

              filePromises.push(gambarPromise);
            }
          });

          // Tambahkan setelah forEach selesai memproses data pertanyaan
          Object.keys(formattedQuestions).forEach((key) => {
            if (formattedQuestions[key].options.length > 0) {
              formattedQuestions[key].options.sort(
                (a, b) => a.urutan - b.urutan
              );
            }
          });

          await Promise.all(filePromises);
          const formattedQuestionsArray = Object.values(formattedQuestions);
          setFormContent(formattedQuestionsArray);
          console.log("question", formattedQuestionsArray);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      console.log(e.message);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };



  // const addQuestionRef = (question) => {
  //   console.log("tesss", question);

  //   // Jika options belum berupa array, buat array baru
  //   const options = question.options
  //     ? Array.isArray(question.options) // Periksa apakah options adalah array
  //       ? question.options // Jika array, gunakan langsung
  //       : [question.options] // Jika bukan, bungkus dalam array
  //     : []; // Jika tidak ada, gunakan array kosong

  //   // Transformasi setiap opsi menjadi format yang diinginkan
  //   const processedOptions = options.map((option) => ({
  //     value: option.value,
  //     urutan: option.urutan,
  //     nomorSoal: option.urutan,
  //     nilai: option.nilai,
  //     id: option.id,
  //   }));

  //   console.log("opsi", processedOptions);

  //   // Buat struktur data soal baru
  //   const newQuestion = {
  //     type: question.queTipe,
  //     text: question.queSoal,
  //     options: processedOptions,
  //     point: question.quePoin,
  //     correctAnswer: question.queJawaban,
  //   };

  //   console.log("newww", newQuestion);

  //   // Tambahkan ke form content dan reset selected options
  //   setFormContent((prev) => [...prev, newQuestion]);
  //   setSelectedOptions((prev) => [...prev, ""]);
  // };

  //INI SAHAR
  useEffect(() => {
    if (formData.quizId) getDataQuestion();
  }, [formData.quizId]);

  //INI SAHAR
  const [forumDataExists, setForumDataExists] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  // const handleChange = (name, value) => {
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     [name]: value,
  //   }));
  // };

  //INI SAHAR
  const handlePointChange = (e, index) => {
    const { value } = e.target;

    // Update point pada formContent
    const updatedFormContent = [...formContent];
    updatedFormContent[index].point = value;
    setFormContent(updatedFormContent);

    // Update nilaiChoice pada formChoice
    setFormChoice((prevFormChoice) => ({
      ...prevFormChoice,
      nilaiChoice: value,
    }));

    console.log("ini", formContent);
  };

  //INI SAHAR
  const handleOptionPointChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;

    // Parse value to integer
    const pointValue = parseInt(value, 10) || 0;

    // Create a copy of formContent
    const updatedFormContent = formContent.map((question, qIndex) => {
      if (qIndex === questionIndex) {
        // Update the specific option's point value
        const updatedOptions = question.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            return {
              ...option,
              point: pointValue,
            };
          }
          return option;
        });

        // Calculate total points for the question
        const totalPoints = updatedOptions.reduce(
          (acc, opt) => acc + opt.point,
          0
        );

        // Return updated question with updated options and total points
        return {
          ...question,
          options: updatedOptions,
          point: totalPoints,
        };
      }
      return question;
    });

    // Update formContent state
    setFormContent(updatedFormContent);
    console.log("Updated options:", updatedFormContent[questionIndex].options);
  };

  const handleFileExcel = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Format Berkas Tidak Valid",
        text: "Silahkan unggah berkas dengan format: .xls atau .xlsx",
      });
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  //INI SAHAR
  const addQuestion = (questionType) => {
    const newQuestion = {
      type: questionType,
      text: `Pertanyaan ${formContent.length + 1}`,
      options: [],
      point: 0,
      correctAnswer: "", // Default correctAnswer
    };
    setFormContent([...formContent, newQuestion]);
    setSelectedOptions([...selectedOptions, ""]);
  };

  //INI SAHAR
  // const handleQuestionTypeChange = async (e, index) => {
  //   const newType = e.target.value; // Tipe baru
  //   const questionId = formContent[index].key; // ID soal

  //   // Perbarui tipe soal di state frontend
  //   const updatedFormContent = [...formContent];
  //   updatedFormContent[index].type = newType;
  //   setFormContent(updatedFormContent);

  //   try {
  //     // Kirim request untuk memanggil stored procedure
  //     const response = await axios.post(API_LINK + "Question/SetTypeQuestion", {
  //       p1: questionId, // ID soal
  //       p2: newType, // Tipe baru
  //     });

  //     console.log("Tipe quest", response.data);
  //   } catch (error) {
  //     console.error("Gagal memperbarui tipe soal:", error.message);
  //     Swal.fire("Error", "Gagal memperbarui tipe soal.", "error");
  //   }
  // };

  const handleQuestionTypeChange = async (e, index) => {
    const newType = e.target.value; // Tipe baru
    const questionId = formContent[index].key; // ID soal

    // Perbarui tipe soal di state frontend
    const updatedFormContent = [...formContent];
    updatedFormContent[index].type = newType;

    if (newType === "Pilgan") {
      // Set default jenis ke Tunggal jika tipe diubah ke Pilgan
      updatedFormContent[index].jenis = "Tunggal";
      updatedFormContent[index].options = []; // Reset opsi
    }

    setFormContent(updatedFormContent);

    try {
      // Kirim request untuk memanggil stored procedure
      const response = await axios.post(API_LINK + "Question/SetTypeQuestion", {
        p1: questionId, // ID soal
        p2: newType, // Tipe baru
      });

      console.log("Tipe quest", response.data);
    } catch (error) {
      console.error("Gagal memperbarui tipe soal:", error.message);
      Swal.fire("Error", "Gagal memperbarui tipe soal.", "error");
    }
  };


  //INI SAHAR
  const createChoice = async (payload) => {
    try {
      const response = await axios.post(
        API_LINK + "Choice/SaveDataChoice",
        payload
      );
      return response.data?.[0]?.hasil; // Ambil ID baru dari respons API
    } catch (error) {
      console.error("Error creating choice:", error);
      throw error;
    }
  };

  // const getNewChoiceId = async () => {
  // const handleAddOption = (index) => {
  //   const updatedFormContent = [...formContent];

  //   const newChoice = {
  //     id: null, // Belum ada ID karena belum disimpan ke database
  //     label: "Isi pilihan baru", // Default label
  //     value: "",
  //     point: 0,
  //     questionIndex: index, // Indeks pertanyaan
  //     questionId: updatedFormContent[index]?.key || null, // Gunakan questionId jika ada
  //   };

  //   updatedFormContent[index].options.push(newChoice);
  //   setFormContent(updatedFormContent);
  // };

  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[index];

    // Create a new option with default values
    const newOption = {
      id: null,
      label: "",
      value: "",
      point: 0,
      isChecked: false, // Default to unchecked
    };

    // Add the new option to the question's options
    question.options.push(newOption);

    // Update the form content state
    setFormContent(updatedFormContent);
  };



  //INI SAHAR
  const saveNewQuestions = async () => {
    try {
      for (const question of formContent) {
        if (!question.key) {
          let pointValue = 0; // Default untuk que_poin

          // Atur nilai que_poin berdasarkan tipe soal
          if (question.type === "Essay" || question.type === "Praktikum") {
            pointValue = question.point || 0; // Ambil poin dari formContent
          } else if (question.type === "Pilgan") {
            pointValue = null; // Kosongkan untuk Pilgan
          }
          const payload = {
            p1: formData.quizId,
            p2: question.text,
            p3: question.type,
            p4: question.gambar || "",
            p5: "Aktif",
            p6: activeUser,
            p7: pointValue,
          };

          console.log("Point", question.point);

          const response = await axios.post(
            API_LINK + "Question/SaveDataQuestion",
            payload
          );
          const newQuestionId = response.data?.[0]?.hasil;

          if (!newQuestionId) throw new Error("Failed to save question.");

          // Perbarui key di pertanyaan
          question.key = newQuestionId;

          // Simpan opsi untuk pertanyaan baru
          if (question.options && question.type === "Pilgan") {
            for (const option of question.options) {
              if (!option.id) {
                const optionPayload = {
                  p1: question.options.indexOf(option) + 1,
                  p2: option.label,
                  p3: newQuestionId,
                  p4: option.point || 0,
                  p5: activeUser,
                };

                const optionResponse = await axios.post(
                  API_LINK + "Choice/SaveDataChoice",
                  optionPayload
                );
                option.id = optionResponse.data?.[0]?.hasil;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      throw error;
    }
  };

  //INI SAHAR
  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options[optionIndex].label = value;
    setFormContent(updatedFormContent);
  };

  //INI SAHAR
  // const handleOptionChange = (e, index) => {
  //   const { value } = e.target;

  //   // Update correctAnswer pada formContent
  //   const updatedFormContent = [...formContent];
  //   updatedFormContent[index].correctAnswer = value;
  //   setFormContent(updatedFormContent);

  //   // Update selectedOptions untuk radio button yang dipilih
  //   const updatedSelectedOptions = [...selectedOptions];
  //   updatedSelectedOptions[index] = value;
  //   setSelectedOptions(updatedSelectedOptions);
  // };

  const handleOptionChange = (e, questionIndex, optionIndex) => {
    const { checked } = e.target;
    const updatedFormContent = [...formContent];
    const question = updatedFormContent[questionIndex];

    // Perbarui opsi berdasarkan apakah "Tunggal" atau "Jamak"
    if (question.jenis === "Tunggal") {
      // Reset semua opsi lain jika tipe Tunggal
      question.options.forEach((option, idx) => {
        option.isChecked = idx === optionIndex; // Hanya aktifkan opsi yang dipilih
        option.point = idx === optionIndex ? option.point : 0; // Reset poin selain yang dipilih
      });
    } else if (question.jenis === "Jamak") {
      // Update opsi tanpa mereset yang lain
      question.options[optionIndex].isChecked = checked;
      if (!checked) {
        question.options[optionIndex].point = 0; // Reset poin jika opsi tidak dipilih
      }
    }
    setFormContent(updatedFormContent);
  };

  //INI SAHAR
  const handleDuplicateQuestion = (index) => {
    const questionToDuplicate = { ...formContent[index] };
    const duplicatedQuestion = {
      ...questionToDuplicate,
      key: null, // Menandakan ini adalah pertanyaan baru
      options: questionToDuplicate.options.map((option) => ({
        ...option,
        id: null, // Menandakan ini adalah opsi baru
      })),
    };

    setFormContent((prevFormContent) => {
      const updatedFormContent = [...prevFormContent];
      updatedFormContent.splice(index + 1, 0, duplicatedQuestion);
      return updatedFormContent;
    });

    setSelectedOptions((prevSelectedOptions) => {
      const updatedSelectedOptions = [...prevSelectedOptions];
      updatedSelectedOptions.splice(index + 1, 0, "");
      return updatedSelectedOptions;
    });
  };

  //INI SAHAR
  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedFormContent = [...formContent];
    const deletedOption =
      updatedFormContent[questionIndex].options[optionIndex];

    if (deletedOption.id) {
      setDeletedChoices((prev) => [...prev, deletedOption.id]);
    }

    updatedFormContent[questionIndex].options.splice(optionIndex, 1);
    setFormContent(updatedFormContent);
  };

  //INI SAHAR
  const [isSaving, setIsSaving] = useState(false);
  //INI SAHAR
  const handleSaveChanges = async () => {
    if (isSaving) return; // Cegah penyimpanan jika proses sebelumnya belum selesai

    setIsSaving(true);
    try {
      const totalPoint = formContent.reduce((total, question) => {
        if (["Essay", "Praktikum"].includes(question.type)) {
          total += parseInt(question.point || 0, 10);
        } else if (question.type === "Pilgan") {
          total += question.options.reduce(
            (acc, opt) => acc + parseInt(opt.point || 0, 10),
            0
          );
        }
        return total;
      }, 0);

      // Validasi total poin sebelum menyimpan
      if (totalPoint !== 100) {
        Swal.fire({
          title: "Gagal!",
          text: `Total poin untuk seluruh pertanyaan harus berjumlah 100. Saat ini: ${totalPoint}`,
          icon: "error",
          confirmButtonText: "OK",
        });
        return; // Hentikan eksekusi jika poin tidak sesuai
      }
      // Simpan pertanyaan baru
      await saveNewQuestions();

      for (const question of formContent) {
        if (question.type === "Pilgan") {
          for (const option of question.options) {
            if (!option.id) {
              // Simpan pilihan baru ke database
              const payload = {
                p1: question.options.indexOf(option) + 1, // Urutan pilihan
                p2: option.label, // Isi pilihan
                p3: question.key, // ID pertanyaan
                p4: option.point, // Nilai
                p5: activeUser, // Dibuat oleh
              };

              const response = await createChoice(payload); // Fungsi API untuk menyimpan pilihan
              const choId = response; // ID baru dari database

              // Perbarui ID pilihan di state
              option.id = choId;
            }
          }
        }
      }

      for (const choiceId of deletedChoices) {
        await deleteChoiceAPI(choiceId);
      }

      for (const questionId of deletedQuestions) {
        await deleteQuestionAPI(questionId);
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil disimpan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      Swal.fire(
        "Gagal!",
        "Terjadi kesalahan saat menyimpan perubahan.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // const handleDeleteQuestion = (index) => {
  //   const question = formContent[index];
  //   const questionId = question.key; // Pastikan key adalah question ID

  //   Swal.fire({
  //     title: "Apakah Anda yakin?",
  //     text: "Pertanyaan ini akan dihapus permanen setelah Anda menyimpan.",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonText: "Ya, hapus",
  //     cancelButtonText: "Batal",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         if (question.type === "Pilgan") {
  //           for (const choice of question.options) {
  //             if (choice.id) {
  //               await deleteChoiceAPI(choice.id);
  //             }
  //           }
  //         }
  //         const response = await axios.post(
  //           API_LINK + "Question/DeleteQuestion",
  //           {
  //             p1: questionId,
  //           }
  //         );

  //         // Periksa apakah penghapusan berhasil
  //         if (response.data === null) {
  //           Swal.fire({
  //             title: "Gagal Dihapus!",
  //             text: "Pertanyaan tidak dapat dihapus karena telah dijawab pada pengerjaan post-test.",
  //             icon: "error",
  //             confirmButtonText: "OK",
  //           });
  //           return; // Hentikan proses jika gagal menghapus question
  //         }

  //         // Jika berhasil, lanjutkan penghapusan dari state lokal
  //         const updatedFormContent = [...formContent];
  //         updatedFormContent.splice(index, 1);
  //         setFormContent(updatedFormContent);

  //         Swal.fire(
  //           "Dihapus!",
  //           "Pertanyaan telah dihapus sementara.",
  //           "success"
  //         );
  //       } catch (error) {
  //         console.error("Gagal menghapus pertanyaan:", error.message);
  //         Swal.fire({
  //           title: "Gagal!",
  //           text: "Terjadi kesalahan saat menghapus pertanyaan.",
  //           icon: "error",
  //           confirmButtonText: "OK",
  //         });
  //       }
  //     }
  //   });
  // };

  const handleDeleteQuestion = (index) => {
    const question = formContent[index];
    const questionId = question.key; // Pastikan key adalah question ID

    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Pertanyaan ini akan dihapus permanen setelah Anda menyimpan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Jika pertanyaan adalah Pilihan Ganda, hapus semua opsi terkait terlebih dahulu
          if (question.type === "Pilgan") {
            for (const choice of question.options) {
              if (choice.id) {
                await deleteChoiceAPI(choice.id);
              }
            }
          }

          // Panggil API untuk menghapus pertanyaan
          const response = await axios.post(
            API_LINK + "Question/DeleteQuestion",
            {
              p1: questionId,
            }
          );

          // Periksa apakah penghapusan berhasil
          if (response.data === null) {
            Swal.fire({
              title: "Gagal Dihapus!",
              text: "Pertanyaan tidak dapat dihapus karena telah dijawab pada pengerjaan post-test.",
              icon: "error",
              confirmButtonText: "OK",
            });
            return; 
          }

          // Jika berhasil, lanjutkan penghapusan dari state lokal
          const updatedFormContent = [...formContent];
          updatedFormContent.splice(index, 1);
          setFormContent(updatedFormContent);

          Swal.fire(
            "Dihapus!",
            "Pertanyaan telah dihapus sementara.",
            "success"
          );
        } catch (error) {
          console.error("Gagal menghapus pertanyaan:", error.message);
          Swal.fire({
            title: "Gagal!",
            text: "Terjadi kesalahan saat menghapus pertanyaan.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };


  //INI SAHAR
  const [deletedQuestions, setDeletedQuestions] = useState([]);

  //INI SAHAR
  // Utility function to handle API calls
  const deleteQuestionAPI = async (questionId) => {
    try {
      const response = await axios.post(API_LINK + "Question/DeleteQuestion", {
        p1: questionId,
      });
      console.log("cek", questionId);
      console.log("Question Deletion Response:", response.data);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  //INI SAHAR
  const deleteChoiceAPI = async (choiceId) => {
    try {
      const response = await axios.post(API_LINK + "Choice/DeleteChoice", {
        p1: choiceId,
      });
      console.log("Choice Deletion Response:", response.data);
    } catch (error) {
      console.error("Error deleting choice:", error);
    }
  };

  //INI SAHAR
  const parseExcelData = (data) => {
    const questions = data
      .map((row, index) => {
        // Skip header row (index 0) and the row di bawahnya (index 1)
        if (index < 2) return null;

        const options = row[3] ? row[3].split(",") : []; // Pilihan Jawaban
        const bobotPilgan = row[4] ? row[4].split(",").map(Number) : []; // Bobot Pilgan
        const jenis = row[2]?.toLowerCase(); // Jenis soal
        const totalNonZero = bobotPilgan.filter((bobot) => bobot !== 0).length;

        return {
          text: row[1], // Soal
          type:
            jenis === "pilgan"
              ? "Pilgan"
              : jenis === "essay"
              ? "Essay"
              : "Praktikum",
          jenis:
            jenis === "pilgan"
              ? totalNonZero > 1
                ? "Jamak"
                : "Tunggal"
              : null, // Deteksi jamak/tunggal
          options:
            jenis === "pilgan"
              ? options.map((option, idx) => ({
                  label: option.trim(),
                  point: bobotPilgan[idx] || 0, // Bobot masing-masing pilihan
                  isChecked: bobotPilgan[idx] > 0, // Pilihan aktif jika bobotnya > 0
                }))
              : [],
          point:
            jenis === "essay" || jenis === "praktikum"
              ? parseInt(row[5] || 0, 10)
              : null, // Total skor untuk Essay/Praktikum
        };
      })
      .filter(Boolean);

    setFormContent((prevQuestions) => [...prevQuestions, ...questions]);
  };

  const validateTotalPoints = () => {
    const totalPoints = formContent.reduce((total, question) => {
      if (["Essay", "Praktikum"].includes(question.type)) {
        return total + parseInt(question.point || 0, 10);
      } else if (question.type === "Pilgan") {
        return (
          total +
          question.options.reduce(
            (optTotal, opt) => optTotal + parseInt(opt.point || 0, 10),
            0
          )
        );
      }
      return total;
    }, 0);

    return totalPoints;
  };


  //INI SAHAR
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API_LINK}Upload/UploadFile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 && response.data) {
        console.log("Response data:", response.data); // Debugging log
        return response.data; // Pastikan ini berisi `newFileName`
      } else {
        throw new Error("Upload file gagal.");
      }
    } catch (error) {
      console.error("Error in uploadFile function:", error);
      throw error;
    }
  };

  //INI SAHAR
  // const handleFileChange = async (e, index) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const allowedExtensions = ["jpg", "jpeg", "png"];
  //   const fileExtension = file.name.split(".").pop().toLowerCase();
  //   const maxSizeInMB = 10; // Maksimum ukuran file (dalam MB)

  //   // Validasi ekstensi file
  //   if (!allowedExtensions.includes(fileExtension)) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Format Berkas Tidak Valid",
  //       text: "Hanya file dengan format .jpg, .jpeg, atau .png yang diizinkan.",
  //     });
  //     return;
  //   }

  //   // Validasi ukuran file
  //   if (file.size / 1024 / 1024 > maxSizeInMB) {
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Ukuran File Terlalu Besar",
  //       text: `Ukuran file maksimal adalah ${maxSizeInMB} MB.`,
  //     });
  //     return;
  //   }

  //   try {
  //     // Upload file ke server menggunakan fungsi `uploadFile`
  //     const uploadResponse = await uploadFile(file);
  //     console.log("Upload Response:", uploadResponse);

  //     // Pastikan menggunakan nama properti yang benar dari respons server
  //     if (!uploadResponse || !uploadResponse.Hasil) {
  //       throw new Error("Respon server tidak valid.");
  //     }

  //     // Perbarui data pertanyaan dengan file gambar
  //     const updatedFormContent = [...formContent];
  //     updatedFormContent[index] = {
  //       ...updatedFormContent[index],
  //       selectedFile: file, // Menyimpan file untuk akses nanti
  //       gambar: uploadResponse.Hasil, // Nama file yang dikembalikan server
  //       previewUrl: URL.createObjectURL(file), // Untuk preview
  //     };
  //     setFormContent(updatedFormContent);
  //   } catch (error) {
  //     console.error("Error uploading file:", error);
  //   }
  // };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) {
      console.log(
        "Tidak ada file yang diunggah, tidak ada perubahan pada gambar."
      );
      return;
    }

    const allowedExtensions = ["jpg", "jpeg", "png"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const maxSizeInMB = 10; // Maksimum ukuran file (dalam MB)

    // Validasi ekstensi file
    if (!allowedExtensions.includes(fileExtension)) {
      Swal.fire({
        icon: "warning",
        title: "Format Berkas Tidak Valid",
        text: "Hanya file dengan format .jpg, .jpeg, atau .png yang diizinkan.",
      });
      return;
    }

    // Validasi ukuran file
    if (file.size / 1024 / 1024 > maxSizeInMB) {
      Swal.fire({
        icon: "warning",
        title: "Ukuran File Terlalu Besar",
        text: `Ukuran file maksimal adalah ${maxSizeInMB} MB.`,
      });
      return;
    }

    try {
      const uploadResponse = await uploadFile(file);
      const fileName = uploadResponse.Hasil;

      const updatedFormContent = [...formContent];
      updatedFormContent[index] = {
        ...updatedFormContent[index],
        selectedFile: file, // Simpan file baru
        gambar: fileName, // Nama file baru dari server
        previewUrl: URL.createObjectURL(file), // URL untuk preview
      };

      setFormContent(updatedFormContent);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };


  //INI SAHAR
  const handleUploadFile = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        parseExcelData(parsedData);
      };
      reader.readAsBinaryString(selectedFile);
      Swal.fire({
        title: "Berhasil!",
        text: "File Excel berhasil ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        title: "Gagal!",
        text: "Pilih file Excel terlebih dahulu!",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  //INI SAHAR
  // const handleAdd = async (e) => {
  //   e.preventDefault();
  //   formData.timer = convertTimeToSeconds(timer);

  //   const validationErrors = await validateAllInputs(
  //     filteredData,
  //     userSchema,
  //     setErrors
  //   );

  //   console.log("Data yang divalidasi:", filteredData);
  //   console.log("Skema validasi:", userSchema.describe());

  //   console.log(validationErrors);
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     Swal.fire({
  //       title: "Gagal!",
  //       text: "Pastikan semua data terisi dengan benar!.",
  //       icon: "error",
  //       confirmButtonText: "OK",
  //     });
  //     return;
  //   }

  //   // Hitung total poin dari semua pertanyaan
  //   const totalPoint = formContent.reduce((total, question) => {
  //     if (["Essay", "Praktikum"].includes(question.type)) {
  //       total += parseInt(question.point || 0, 10);
  //     } else if (question.type === "Pilgan") {
  //       total += question.options.reduce(
  //         (acc, opt) => acc + parseInt(opt.point || 0, 10),
  //         0
  //       );
  //     }
  //     return total;
  //   }, 0);

  //   // Validasi total poin
  //   if (totalPoint !== 100) {
  //     Swal.fire({
  //       title: "Gagal!",
  //       text: `Total poin untuk seluruh pertanyaan harus berjumlah 100. Saat ini: ${totalPoint}`,
  //       icon: "error",
  //       confirmButtonText: "OK",
  //     });
  //     return;
  //   }

  //   console.log(
  //     "Total Question Points (Essay/Praktikum):",
  //     formContent
  //       .filter((q) => q.type === "Essay" || q.type === "Praktikum")
  //       .reduce((total, q) => total + parseInt(q.point || 0, 10), 0)
  //   );

  //   console.log(
  //     "Total Option Points (Pilihan Ganda):",
  //     formContent
  //       .filter((q) => q.type === "Pilgan")
  //       .reduce(
  //         (total, q) =>
  //           total +
  //           q.options.reduce(
  //             (optionTotal, opt) => optionTotal + parseInt(opt.point || 0, 10),
  //             0
  //           ),
  //         0
  //       )
  //   );

  //   const quizPayload = {
  //     quizId: formData.quizId,
  //     materiId: formData.materiId,
  //     quizJudul: formData.quizJudul,
  //     quizDeskripsi: formData.quizDeskripsi,
  //     quizTipe: formData.quizTipe,
  //     tanggalAwal: formData.tanggalAwal,
  //     tanggalAkhir: formData.tanggalAkhir,
  //     timer: formData.timer,
  //     status: "Aktif",
  //     modifby: activeUser,
  //   };

  //   try {
  //     const quizResponse = await axios.post(
  //       API_LINK + "Quiz/UpdateDataQuiz",
  //       quizPayload
  //     );
  //     console.log("Respons dari API UpdateDataQuiz:", quizResponse.data);

  //     if (!quizResponse.data.length) {
  //       Swal.fire({
  //         title: "Error!",
  //         text: "Gagal menyimpan quiz.",
  //         icon: "error",
  //         confirmButtonText: "OK",
  //       });
  //       return;
  //     }

  //     const quizId = quizResponse.data[0].hasil;

  //     for (const question of formContent) {
  //       const formQuestion = {
  //         questionId: question.key || "", // Pastikan ID pertanyaan ada
  //         quizId: quizId,
  //         soal: question.text,
  //         tipeQuestion: question.type,
  //         gambar: question.gambar || "",
  //         status: "Aktif",
  //         quemodifby: activeUser,
  //         point: parseInt(question.point, 10) || 0,
  //       };

  //       console.log("Payload for edit question:", formQuestion);

  //       console.log(question.key);
  //       if (question.type === "Essay" || question.type === "Praktikum") {
  //         if (question.selectedFile) {
  //           try {
  //             const uploadResult = await uploadFile(question.selectedFile);
  //             formQuestion.gambar = uploadResult.Hasil;

  //             console.log("Gam", formQuestion.gambar);
  //           } catch (uploadError) {
  //             console.error("Gagal mengunggah gambar:", uploadError);
  //             Swal.fire({
  //               title: "Gagal!",
  //               text: `Gagal mengunggah gambar untuk pertanyaan: ${question.text}`,
  //               icon: "error",
  //               confirmButtonText: "OK",
  //             });
  //             return;
  //           }
  //         } else {
  //           formQuestion.gambar = "";
  //         }
  //       } else if (question.type === "Pilgan") {
  //         formQuestion.gambar = "";
  //       }

  //       // Simpan pertanyaan
  //       const questionResponse = await axios.post(
  //         API_LINK + "Question/UpdateDataQuestion",
  //         formQuestion
  //       );
  //       console.log("API Response for Question Save:", questionResponse.data);

  //       if (!questionResponse.data.length) {
  //         Swal.fire({
  //           title: "Error!",
  //           text: `Gagal menyimpan pertanyaan "${question.text}".`,
  //           icon: "error",
  //           confirmButtonText: "OK",
  //         });
  //         return;
  //       }

  //       const questionId = questionResponse.data[0].hasil;
  //       console.log("Pertanyaan ID:", questionId);

  //       // Simpan jawaban untuk Pilgan atau Essay
  //       if (question.type === "Essay" || question.type === "Praktikum") {
  //         const answerData = {
  //           cho_id: question.answerId || "", // Tambahkan ID jawaban jika ada
  //           questionId: questionId,
  //           urutanChoice: "",
  //           cho_isi: question.text, // Isi jawaban
  //           cho_nilai: question.point,
  //           quemodifby: activeUser,
  //         };

  //         console.log("ans ess", answerData);
  //         await axios.post(API_LINK + "Choice/UpdateDataChoice", answerData);
  //       } else if (question.type === "Pilgan") {
  //         for (const [optionIndex, option] of question.options.entries()) {
  //           const answerData = {
  //             cho_id: option.id || "", // Tambahkan ID opsi jika ada
  //             questionId: questionId,
  //             urutanChoice: optionIndex + 1,
  //             cho_isi: option.label,
  //             cho_nilai: option.point || 0,
  //             quemodifby: activeUser,
  //           };

  //           console.log("ans pilgan", answerData);
  //           await axios.post(API_LINK + "Choice/UpdateDataChoice", answerData);
  //         }
  //       }

  //       try {
  //         // Proses penghapusan opsi dari database
  //         for (const choiceId of deletedChoices) {
  //           await axios.post(API_LINK + "Choice/DeleteChoice", {
  //             cho_id: choiceId,
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Error delete choice:", error);
  //       }
  //     }

  //     Swal.fire({
  //       title: "Berhasil!",
  //       text: "Posttest berhasil diubah",
  //       icon: "success",
  //       confirmButtonText: "OK",
  //     }).then(() => {
  //       // window.location.href = "../Index"; // Ganti '/index' dengan URL tujuan Anda
  //     });
  //   } catch (error) {
  //     console.error("Gagal menyimpan data:", error);
  //     Swal.fire({
  //       title: "Error!",
  //       text: "Terjadi kesalahan saat menyimpan data.",
  //       icon: "error",
  //       confirmButtonText: "OK",
  //     });
  //   }
  // };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      formData.timer = convertTimeToSeconds(timer);

      // **1. Update Data Quiz**
      const quizPayload = {
        quizId: formData.quizId,
        materiId: formData.materiId,
        quizJudul: formData.quizJudul,
        quizDeskripsi: formData.quizDeskripsi,
        quizTipe: formData.quizTipe,
        tanggalAwal: formData.tanggalAwal,
        tanggalAkhir: formData.tanggalAkhir,
        timer: formData.timer, // Pastikan timer dalam format detik
        status: "Aktif",
        modifby: activeUser,
      };

      const quizResponse = await axios.post(
        API_LINK + "Quiz/UpdateDataQuiz",
        quizPayload
      );

      console.log("Respons dari API UpdateDataQuiz:", quizResponse.data);

      if (!quizResponse.data.length) {
        Swal.fire({
          title: "Error!",
          text: "Gagal menyimpan quiz.",
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsSaving(false);
        return;
      }
      // Validasi total poin
      const totalPoints = validateTotalPoints();
      if (totalPoints !== 100) {
        Swal.fire({
          title: "Error!",
          text: `Total poin untuk semua pertanyaan harus 100. Saat ini: ${totalPoints}`,
          icon: "error",
          confirmButtonText: "OK",
        });
        setIsSaving(false);
        return;
      }

      // **1. Hapus pilihan lama yang ada di deletedChoices**
      for (const choiceId of deletedChoices) {
        try {
          await deleteChoiceAPI(choiceId);
        } catch (error) {
          console.error(
            `Gagal menghapus pilihan dengan ID ${choiceId}:`,
            error
          );
        }
      }

      // **2. Simpan pertanyaan dan pilihan baru**
      for (const question of formContent) {
        let payload;

        const isBlobUrl = question.gambar.startsWith("blob:");
        const finalGambar = isBlobUrl ? question.img : question.gambar;
        if (!question.key) {
          // Parameter untuk CREATE
          payload = {
            p1: formData.quizId, // ID Quiz
            p2: question.text, // Soal
            p3: question.type, // Tipe Soal
            p4: finalGambar || "",
            p5: "Aktif", // Status
            p6: activeUser, // Created By
            p7: question.point || 0, // Poin
          };

          console.log("Payload Create Question:", payload);

          // Panggil API Create
          const response = await axios.post(
            API_LINK + "Question/SaveDataQuestion",
            payload
          );
          const newQuestionId = response.data?.[0]?.hasil;

          if (!newQuestionId) throw new Error("Failed to save question.");
          question.key = newQuestionId; // Simpan ID setelah create
        } else {
          // Parameter untuk UPDATE
          payload = {
            p1: question.key, // ID Question (que_id)
            p2: formData.quizId, // ID Quiz
            p3: question.text, // Soal
            p4: question.type, // Tipe Soal
            p5: finalGambar || "", // Gambar
            p6: "Aktif", // Status
            p7: activeUser, // Modified By
            p8: question.point || 0, // Poin
          };

          console.log("Payload Update Question:", payload);

          // Panggil API Update
          await axios.post(API_LINK + "Question/UpdateDataQuestion", payload);
        }

        // Tangani opsi untuk Pilihan Ganda
        if (question.type === "Pilgan") {
          for (const [optionIndex, option] of question.options.entries()) {
            let optionPayload;

            if (!option.id) {
              // Parameter untuk CREATE opsi
              optionPayload = {
                p1: optionIndex + 1, // Urutan
                p2: option.label, // Isi Opsi
                p3: question.key, // ID Question
                p4: option.point || 0, // Nilai
                p5: activeUser, // Created By
                p6: question.jenis === "Tunggal" ? "Tunggal" : "Jamak", // Jenis Opsi
              };

              console.log("Payload Create Option:", optionPayload);

              // Panggil API Create Opsi
              const optionResponse = await axios.post(
                API_LINK + "Choice/SaveDataChoice",
                optionPayload
              );
              option.id = optionResponse.data?.[0]?.hasil;
            } else {
              // Parameter untuk UPDATE opsi
              optionPayload = {
                cho_id: option.id, // ID Opsi
                questionId: question.key, // ID Question
                urutanChoice: optionIndex + 1, // Urutan
                cho_isi: option.label, // Isi Opsi
                cho_nilai: option.point || 0, // Nilai
                quemodifby: activeUser, // Modified By
                cho_tipe: question.jenis === "Tunggal" ? "Tunggal" : "Jamak", // Jenis Opsi
              };

              console.log("Payload Update Option:", optionPayload);

              // Panggil API Update Opsi
              await axios.post(
                API_LINK + "Choice/UpdateDataChoice",
                optionPayload
              );
            }
          }
        }
      }

      // Reset deletedChoices setelah berhasil disimpan
      setDeletedChoices([]);

      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil disimpan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // window.reload.location();
      });
    } catch (error) {
      console.error("Error in handleAdd:", error);
      Swal.fire({
        title: "Gagal!",
        text: error.message || "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSaving(false);
    }
  };

  //INI SAHAR
  useEffect(() => {
    const updatedFormContent = formContent.map((question) => {

      console.log("gambar", question.gambar)

      if (question.gambar) {
        return {
          ...question,
          previewUrl: `${API_LINK}Upload/GetFile/${question.gambar}`,
        };
      }
      return question;
    });
    setFormContent(updatedFormContent);
  }, []);

  //INI SAHAR
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx"; // Path to your template file in the public directory
    link.download = "template.xlsx";
    link.click();
  };

  // const updateFormQuestion = (name, value) => {
  //   setFormQuestion((prevFormQuestion) => ({
  //     ...prevFormQuestion,
  //     [name]: value,
  //   }));
  // };

  // const handleTimerChange = (e) => {
  //   const { value } = e.target;
  //   setTimer(value);
  //   // console.log(convertTimeToSeconds(timer))
  // };

  //INI SAHAR
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  //INI SAHAR
  const convertTimeToSeconds = () => {
    return parseInt(hours) * 3600 + parseInt(minutes) * 60;
  };
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const handleHoursChange = (e) => {
    setHours(e.target.value);
  };
  const handleMinutesChange = (e) => {
    setMinutes(e.target.value);
  };

  //INI SAHAR
  const convertSecondsToTimeFormat = (seconds) => {
    const formatHours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const formatMinutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");

    setHours(formatHours);
    setMinutes(formatMinutes);
    return `${formatHours}:${formatMinutes}`;
  };



  //INI SAHAR
  const removeHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const [activeStep, setActiveStep] = useState(5);
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const handleReset = () => {
    setActiveStep(0);
  };

  const handlePageChange = (content) => {
    onChangePage(content);
  };

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    window.location.reload();
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <style>
        {`
                .form-check input[type="radio"] {
                transform: scale(1.5);
                border-color: #000;
                }
                .file-name {
                white-space: nowrap; 
                overflow: hidden; 
                text-overflow: ellipsis; 
                max-width: 100%;
                }
                .option-input {
                background: transparent;
                border: none;
                outline: none;
                border-bottom: 1px solid #000;
                margin-left: 20px;
                }
                .form-check {
                margin-bottom: 8px;
                }
                .question-input {
                margin-bottom: 12px;
                }
                .file-upload-label {
                font-size: 14px; /* Sesuaikan ukuran teks label */
                }
                .file-ket-label {
                font-size: 10px; /* Sesuaikan ukuran teks label */
                }
            `}
      </style>

      <div
        className=""
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "100px",
          marginLeft: "70px",
          marginRight: "70px",
        }}
      >
        <div className="back-and-title" style={{ display: "flex" }}>
          <button
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={handleGoBack}
          >
            <img src={BackPage} alt="" />
          </button>
          <h4
            style={{
              color: "#0A5EA8",
              fontWeight: "bold",
              fontSize: "30px",
              marginTop: "10px",
              marginLeft: "20px",
            }}
          >
            Edit Post-Test
          </h4>
        </div>
      </div>
      <form id="myForm" onSubmit={handleAdd}>
      <div>
          <CustomStepper
            activeStep={5}
            steps={steps}
            onChangePage={handlePageChange}
            getStepContent={getStepContent}
          />
        </div>
    

        <div className="card mt-3 mb-3" style={{ margin: "0 80px" }}>
          <div className="card-body p-4">
            {hasTest ? (
              <div>
                <div className="row mb-4">
                  <div className="col-lg-7">
                    <Input
                      type="text"
                      label="Deskripsi Quiz"
                      forInput="quizDeskripsi"
                      value={formData.quizDeskripsi}
                      onChange={handleInputChange}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-lg-4">
                    <label htmlFor="waktuInput" className="form-label">
                      <span style={{ fontWeight: "bold" }}>Durasi:</span>
                      <span style={{ color: "red" }}> *</span>
                    </label>

                    <div className="d-flex align-items-center">
                      <div className="d-flex align-items-center me-3">
                        <select
                          className="form-select me-2"
                          name="hours"
                          value={hours}
                          onChange={handleHoursChange}
                        >
                          {[...Array(24)].map((_, i) => (
                            <option
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
                              {i.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <span>Jam</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <select
                          className="form-select me-2"
                          name="minutes"
                          value={minutes}
                          onChange={handleMinutesChange}
                        >
                          {[...Array(60)].map((_, i) => (
                            <option
                              key={i}
                              value={i.toString().padStart(2, "0")}
                            >
                              {i.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <span>Menit</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="row mb-4">
                */}
                  {/* <div className="col-lg-4">
                    <Input
                      label="Tanggal Dimulai:"
                      type="date"
                      value={formData.tanggalAwal}
                      onChange={(e) =>
                        handleChange("tanggalAwal", e.target.value)
                      }
                      isRequired={true}
                    />
                  </div>
                  <div className="col-lg-4">
                    <Input
                      label="Tanggal Berakhir:"
                      type="date"
                      value={formData.tanggalAkhir}
                      onChange={(e) =>
                        handleChange("tanggalAkhir", e.target.value)
                      }
                      isRequired={true}
                    />
                  </div> */}
                {/* </div> */}

                <div className="row mb-4">
                  <div className="mb-2"></div>
                  <div className="">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex">
                      <div className="">
                        <Button
                          title="Tambah Pertanyaan"
                          onClick={() => addQuestion("Essay")}
                          iconName="plus"
                          label="Tambah Soal"
                          classType="primary btn-sm px-3 py-2"
                        />
                        <input
                          type="file"
                          id="fileInput"
                          style={{ display: "none" }}
                          onChange={handleFileExcel}
                          accept=".xls, .xlsx"
                        />
                      </div>
                      <div className="ml-3">
                        <Button
                          title="Tambah File Excel"
                          iconName="upload"
                          label="Tambah File Excel"
                          classType="primary btn-sm mx-2 px-3 py-2"
                          onClick={() =>
                            document.getElementById("fileInput").click()
                          } // Memicu klik pada input file
                        />
                      </div>
                    </div>
                    {/* Tampilkan nama file yang dipilih */}
                    {selectedFile && <span>{selectedFile.name}</span>}
                    <div className="d-flex">
                      <div className="mr-4">
                        <Button
                          title="Unggah File Excel"
                          iconName="paper-plane"
                          classType="primary btn-sm px-3 py-2"
                          onClick={handleUploadFile}
                          label="Unggah File"
                        />
                      </div>

                      <Button
                        iconName="download"
                        label="Unduh Template"
                        classType="warning btn-sm px-3 py-2 mx-2"
                        onClick={handleDownloadTemplate}
                        title="Unduh Template Excel"
                      />
                    </div>
                  </div>
                  </div>
                </div>
                {formContent.map((question, index) => (
                  <div key={index} className="card mb-4">
                    <div className="card-header bg-white fw-medium text-black d-flex justify-content-between align-items-center">
                      <span>Pertanyaan</span>
                      <span>
                        Skor:{" "}
                        {(question.type === "Essay" ||
                        question.type === "Praktikum"
                          ? parseInt(question.point)
                          : 0) +
                          (question.type === "Pilgan"
                            ? (question.options || []).reduce(
                                (acc, option) => acc + parseInt(option.point),
                                0
                              )
                            : 0)}
                      </span>{" "}
                      <div className="col-lg-2">
                        <select
                          className="form-select"
                          aria-label="Default select example"
                          value={question.type}
                          onChange={(e) => handleQuestionTypeChange(e, index)}
                        >
                          <option value="Essay">Essay</option>
                          <option value="Pilgan">Pilihan Ganda</option>
                          <option value="Praktikum">Praktikum</option>
                        </select>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="row">
                        <div className="col-lg-12 question-input">
                          <label
                            htmlFor="deskripsiMateri"
                            className="form-label fw-bold"
                          >
                            Pertanyaan <span style={{ color: "Red" }}> *</span>
                          </label>
                          <Editor
                            forInput={"pertanyaan_${index}"}
                            value={removeHtmlTags(question.text)}
                            onEditorChange={(content) => {
                              const updatedFormContent = [...formContent];
                              updatedFormContent[index].text = content;
                              setFormContent(updatedFormContent);

                              // Update formQuestion.soal
                              setFormQuestion((prevFormQuestion) => ({
                                ...prevFormQuestion,
                                soal: content,
                              }));
                            }}
                            apiKey="444kasui9s3azxih6ix4chynoxmhw6y1urkpmfhufvrbernz"
                            init={{
                              height: 300,
                              menubar: false,
                              plugins: [
                                "advlist autolink lists link image charmap print preview anchor",
                                "searchreplace visualblocks code fullscreen",
                                "insertdatetime media table paste code help wordcount",
                              ],
                              toolbar:
                                "undo redo | formatselect | bold italic backcolor | " +
                                "alignleft aligncenter alignright alignjustify | " +
                                "bullist numlist outdent indent | removeformat | help",
                            }}
                          />
                        </div>

                        {/* Tampilkan tombol gambar dan PDF hanya jika type = essay */}
                        {(question.type === "Essay" ||
                          question.type === "Praktikum") && (
                          <div className="col-lg-12 d-flex align-items-center form-check">
                            <div className="d-flex flex-column w-100">
                              <FileUpload
                                forInput={`fileInput_${index}`}
                                formatFile=".jpg,.jpeg,.png"
                                label={
                                  <span className="file-upload-label">
                                    Gambar (.jpg, .jpeg, .png)
                                  </span>
                                }
                                onChange={(e) => handleFileChange(e, index)}
                                hasExisting={formContent[index]?.img || null}
                                style={{ fontSize: "12px" }}
                              />

                              {/* Tampilkan preview gambar jika ada gambar yang dipilih */}
                              {question.previewUrl && (
                                <div
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "300px",
                                    overflow: "hidden",
                                    marginLeft: "10px",
                                  }}
                                >
                                  <img
                                    src={question.previewUrl}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "auto",
                                      objectFit: "contain",
                                    }}
                                  />
                                </div>
                              )}

                              {question.gambar && !question.selectedFile && (
                                <div
                                  style={{
                                    maxWidth: "300px", // Set maximum width for the image container
                                    maxHeight: "300px", // Set maximum height for the image container
                                    overflow: "hidden", // Hide any overflow beyond the set dimensions
                                    marginLeft: "10px",
                                  }}
                                >
                                  <img
                                    src={question.gambar}
                                    alt="Preview Gambar"
                                    style={{
                                      width: "100%", // Ensure image occupies full width of container
                                      height: "auto", // Maintain aspect ratio
                                      objectFit: "contain", // Fit image within container without distortion
                                    }}
                                  />
                                </div>
                              )}
                              <div className="mt-2">
                                <label className="form-label fw-bold">
                                  Point <span style={{ color: "Red" }}> *</span>
                                </label>{" "}
                                {/* Memberikan margin atas kecil untuk jarak yang rapi */}
                                <Input
                                  type="number"
                                  value={question.point}
                                  onChange={(e) => handlePointChange(e, index)}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {question.type === "Pilgan" && (
                          <>
                            <div
                              className="col-lg-2 mb-3"
                              style={{ width: "250px" }}
                            >
                              <select
                                className="form-select"
                                aria-label="Default select example"
                                value={question.jenis}
                                onChange={(e) =>
                                  handleJenisTypeChange(e, index)
                                }
                              >
                                <option value="Tunggal">Pilihan Tunggal</option>
                                <option value="Jamak">Pilihan Jamak</option>
                              </select>
                            </div>
                            <div className="col-lg-12">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className="form-check"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                  }}
                                >
                                  {/* Input Radio atau Checkbox */}
                                  <input
                                    type={
                                      question.jenis === "Tunggal"
                                        ? "radio"
                                        : "checkbox"
                                    }
                                    id={`option_${index}_${optionIndex}`}
                                    name={`option_${index}`} // Pastikan name sama untuk radio button
                                    value={option.value}
                                    checked={!!option.isChecked} // Atur apakah opsi ini dipilih
                                    onChange={(e) =>
                                      handleOptionChange(e, index, optionIndex)
                                    }
                                    style={{ marginRight: "10px" }}
                                  />

                                  {/* Input Label Opsi */}
                                  <input
                                    type="text"
                                    value={option.label}
                                    onChange={(e) =>
                                      handleOptionLabelChange(
                                        e,
                                        index,
                                        optionIndex
                                      )
                                    }
                                    className="option-input"
                                    readOnly={question.type === "answer"}
                                    style={{ marginRight: "10px" }}
                                  />

                                  {/* Tampilkan Label Baru */}
                                  {!option.id && (
                                    <span className="badge bg-warning">
                                      Baru
                                    </span>
                                  )}

                                  {/* Tombol Hapus Opsi */}
                                  <Button
                                    iconName="delete"
                                    classType="btn-sm ms-2 px-2 py-0"
                                    onClick={() =>
                                      handleDeleteOption(index, optionIndex)
                                    }
                                    style={{ marginRight: "10px" }}
                                  />

                                  {/* Input Nilai untuk Pilihan */}
                                  {option.isChecked && (
                                    <input
                                      type="number"
                                      id={`optionPoint_${index}_${optionIndex}`}
                                      value={option.point}
                                      className="btn-sm ms-2 px-2 py-0"
                                      onChange={(e) =>
                                        handleOptionPointChange(
                                          e,
                                          index,
                                          optionIndex
                                        )
                                      }
                                      style={{ width: "50px" }}
                                    />
                                  )}
                                </div>
                              ))}

                              <Button
                                onClick={() => handleAddOption(index)}
                                iconName="add"
                                classType="success btn-sm px-3 py-2 mt-2 rounded-3"
                                label="Opsi Baru"
                              />
                            </div>
                          </>
                        )}

                        <div className="d-flex justify-content-between my-2 mx-1">
                                                    <div></div>
                                                    <div className="d-flex">
                                                    <div className="mr-3">
                                                        <Button
                                                        iconName="trash"
                                                        label="Hapus"
                                                        classType="btn-sm ms-2 px-3 py-2 fw-semibold rounded-3"
                                                        style={{ backgroundColor: "red", color: "white" }}
                                                        onClick={() => handleDeleteQuestion(index)}
                                                        />
                                                    </div>
                                                    <div className="mr-4">
                                                        <Button
                                                        iconName="duplicate"
                                                        label="Duplikat"
                                                        classType="primary btn-sm ms-2 px-3 py-2 fw-semibold rounded-3 "
                                                        onClick={() => handleDuplicateQuestion(index)}
                                                        />
                                                    </div>
                                                    <div className="">
                                                        <Button
                                                        title="Tambah Pertanyaan"
                                                        onClick={() => addQuestion("Essay")}
                                                        iconName="plus"
                                                        label="Tambah Soal"
                                                        classType="primary btn-sm px-3 py-2 fw-semibold rounded-3"
                                                        />
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>
                                            </div>
                  </div>
                ))}
                 <div className="d-flex justify-content-between">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Sebelumnya"
            onClick={() => onChangePage("pretestEdit", AppContext_master.MateriForm)}
          />
          {hasTest ? (
            <Button
              classType="primary ms-2 px-4 py-2"
              type="submit"
              label="Edit"
              onClick={handleSaveChanges}
              disabled={isSaving}
            />
          ) : null}
        </div>
              </div>
            ) : (
              <>
                          <div className="" style={{marginLeft:"20px", marginRight:"20px"}}>
                          <Alert type="warning" message={(
                            <span>
                              Post-Test belum ditambahkan. <a onClick={() => onChangePage("posttestEditNot", AppContext_master.MateriForm = AppContext_master.DetailMateriEdit, AppContext_master.count += 1)} className="text-primary">Tambah Data</a>
                            </span>
                          )} />
                          </div>
                            <div className="d-flex justify-content-between ">
                        <div className="ml-4">
                        <Button
                        classType="outline-secondary me-2 px-4 py-2"
                        label="Sebelumnya"
                        onClick={() => onChangePage("pretestEdit", AppContext_test.ForumForm, AppContext_master.MateriForm, AppContext_master.count += 1)}
                      />
                      </div>
                      {/* <div className="d-flex mr-4" >
                      <Button
                        classType="primary ms-3 px-4 py-2"
                        label="Berikutnya"
                        onClick={() => onChangePage("posttestEdit", AppContext_master.MateriForm, AppContext_master.count += 1)}
                      />
                      </div> */}
                    </div>
                        </>
            )}
          </div>
        </div>
       
        
        {showConfirmation && (
          <Konfirmasi
            title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
            pesan={
              isBackAction
                ? "Apakah anda ingin kembali?"
                : "Anda yakin ingin simpan data?"
            }
            onYes={handleConfirmYes}
            onNo={handleConfirmNo}
          />
        )}
      </form>
    </>
  );
}
