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
      return "pengenalanEdit";
    case 1:
      return "materiEdit";
    case 2:
      return "forumEdit";
    case 3:
      return "sharingEdit";
    case 4:
      return "pretestEdit";
    case 5:
      return "posttestEdit";
    default:
      return "Unknown stepIndex";
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

export default function MasterPreTestEdit({ onChangePage, withID }) {
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

  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  
  const [formData, setFormData] = useState({
    quizId: "",
    materiId: "",
    quizJudul: "",
    quizDeskripsi: "",
    quizTipe: "Pretest",
    tanggalAwal: "",
    tanggalAkhir: "",
    timer: "",
    status: "Aktif",
    modifby: activeUser,
  });

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

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    window.location.reload();
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

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

  const [formChoice, setFormChoice] = useState({
    urutanChoice: "",
    isiChoice: "",
    questionId: "",
    nilaiChoice: "",
    quemodifby: activeUser,
  });

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

  const initialFormQuestion = {
    quizId: "",
    soal: "",
    tipeQuestion: "Essay",
    gambar: "",
    questionDeskripsi: "",
    status: "Aktif",
    quemodifby: activeUser,
  };

  /* ----- Handle Function Start ---- */

  const Materi = AppContext_master.DetailMateriEdit;
  console.log("dataa", Materi)

  const hasTest = Materi.Pretest !== null && Materi.Pretest !== "";

  useEffect(() => {
    console.log("Materi:", Materi);
    console.log("Materi.Pretest:", Materi?.Pretest);
    console.log("hasTest:", hasTest);
  }, [Materi, hasTest]);

  async function fetchSectionAndQuizData() {
    setIsLoading(true);
    try {
      const sectionResponse = await axios.post(
        API_LINK + "Section/GetDataSectionByMateri",
        {
          p1: Materi.Key,
          p2: "Pre-Test",
          p3: "Aktif",
        }
      );
      const sectionData = sectionResponse.data;

      if (sectionData.length === 0) {
        throw new Error("Section data not found.");
      }

      const sectionId = sectionData[0].SectionId;

      console.log("Section ID:", sectionId);

      // Fetch quiz data using sectionId
      const quizResponse = await axios.post(
        API_LINK + "Quiz/GetDataQuizByIdSection",
        {
          secId: sectionId,
        }
      );
      const quizData = quizResponse.data;

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

  // Call the combined function when the component mounts
  useEffect(() => {
    fetchSectionAndQuizData();
  }, []);

  const getDataQuestion = async () => {
    setIsLoading(true);

    try {
      while (true) {
        const { data } = await axios.post(API_LINK + "Quiz/GetDataQuestion", {
          quiId: formData.quizId,
        });

        console.log("quizId", formData.quizId);

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
                  point: question.Skor || 0,
                  key: question.Key,
                });
              }
            } else {
              // Question Essay
              formattedQuestions[question.Key] = {
                type: question.TipeSoal,
                text: question.Soal,
                options: question.TipeSoal === "Pilgan" ? [] : [],
                gambar: question.Gambar || "",
                point: question.NilaiJawaban || 0,
                key: question.Key,
                correctAnswer:
                  question.TipeSoal === "Essay"
                    ? question.JawabanBenar || ""
                    : null,
              };

              if (question.TipeSoal === "Pilgan" && question.JawabanId) {
                formattedQuestions[question.Key].options.push({
                  id: question.JawabanId,
                  label: question.Jawaban,
                  point: question.Skor || 0,
                  key: question.Key,
                });
              }
            }
            console.log("formattedQuestions", formattedQuestions);
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

  const addQuestionRef = (question) => {
    console.log("tesss", question);

    // Jika options belum berupa array, buat array baru
    const options = question.options
      ? Array.isArray(question.options) // Periksa apakah options adalah array
        ? question.options // Jika array, gunakan langsung
        : [question.options] // Jika bukan, bungkus dalam array
      : []; // Jika tidak ada, gunakan array kosong

    // Transformasi setiap opsi menjadi format yang diinginkan
    const processedOptions = options.map((option) => ({
      value: option.value,
      urutan: option.urutan,
      nomorSoal: option.urutan,
      nilai: option.nilai,
      id: option.id,
    }));

    console.log("opsi", processedOptions);

    // Buat struktur data soal baru
    const newQuestion = {
      type: question.queTipe,
      text: question.queSoal,
      options: processedOptions,
      point: question.quePoin,
      correctAnswer: question.queJawaban,
    };

    console.log("newww", newQuestion);

    // Tambahkan ke form content dan reset selected options
    setFormContent((prev) => [...prev, newQuestion]);
    setSelectedOptions((prev) => [...prev, ""]);
  };

  useEffect(() => {
    if (formData.quizId) getDataQuestion();
  }, [formData.quizId]);

  const [forumDataExists, setForumDataExists] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

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

  // Baru untuk handleQuestionTypeChange
  const handleQuestionTypeChange = async (e, index) => {
    const newType = e.target.value; // Tipe baru
    const questionId = formContent[index].key; // ID soal

    // Perbarui tipe soal di state frontend
    const updatedFormContent = [...formContent];
    updatedFormContent[index].type = newType;
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

  const getNewChoiceId = async () => {
    try {
      const response = await axios.post(API_LINK + "Choice/GetLastChoiceId", {
        p1: null,
      });
      const lastId = response.data?.lastId || 0; // Ambil ID terakhir, jika gagal default ke 0
      const newId = `CHO${String(parseInt(lastId, 10) + 1).padStart(4, "0")}`; // Tambah 1 dan format ID
      console.log("New Choice ID:", newId);
      return newId;
    } catch (error) {
      console.error("Error fetching last choice ID:", error);
      throw error;
    }
  };

  const handleAddOption = (index) => {
    const updatedFormContent = [...formContent];

    const newChoice = {
      id: null, // Belum ada ID karena belum disimpan ke database
      label: "Isi pilihan baru", // Default label
      value: "",
      point: 0,
      questionIndex: index, // Indeks pertanyaan
      questionId: updatedFormContent[index]?.key || null, // Gunakan questionId jika ada
    };

    updatedFormContent[index].options.push(newChoice);
    setFormContent(updatedFormContent);
  };

  const saveNewQuestions = async () => {
    try {
      for (const question of formContent) {
        if (!question.key) {
          const payload = {
            p1: formData.quizId,
            p2: question.text,
            p3: question.type,
            p4: question.gambar || "",
            p5: "Aktif",
            p6: activeUser,
            p7: question.point || 0,
          };

          const response = await axios.post(
            API_LINK + "Question/SaveDataQuestion",
            payload
          );
          const newQuestionId = response.data?.[0]?.hasil;

          if (!newQuestionId) throw new Error("Failed to save question.");

          // Perbarui key di pertanyaan
          question.key = newQuestionId;
        }
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      throw error;
    }
  };

  const handleSaveChoices = async () => {
    try {
      for (const choice of tempChoices) {
        if (!choice.id) {
          const questionId = formContent[choice.questionIndex]?.key;

          if (!questionId) {
            console.error(
              `Error: questionId not found for choice at index ${choice.questionIndex}`
            );
            continue;
          }

          const payload = {
            p1: choice.urutan || choice.questionIndex + 1, // Urutan pilihan
            p2: choice.label, // Isi pilihan
            p3: questionId, // ID pertanyaan (que_id)
            p4: choice.point, // Nilai pilihan
            p5: activeUser, // User pembuat
          };

          // Simpan ke database
          const response = await createChoice(payload);

          // Jika berhasil, update ID pada formContent dan tempChoices
          const cho_id = response[0]?.hasil || "";
          if (cho_id) {
            setFormContent((prev) => {
              const updated = [...prev];
              updated[choice.questionIndex].options = updated[
                choice.questionIndex
              ].options.map((opt) =>
                opt === choice ? { ...opt, id: cho_id } : opt
              );
              return updated;
            });
          }
        }
      }

      // Kosongkan tempChoices setelah berhasil
      setTempChoices([]);
    } catch (error) {
      console.error("Gagal menyimpan pilihan:", error);
    }
  };

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const isStartDateBeforeEndDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  };

  const fileGambarRef = useRef(null);

  const handleFileChangeGambar = (ref, index, extAllowed) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file ? file.name : "";
    const fileSize = file ? file.size : 0;
    const fileExt = fileName.split(".").pop().toLowerCase();
    const validationError = validateInput(name, value, userSchema);
    let error = "";

    // Validasi ukuran dan ekstensi file
    if (fileSize / 1024576 > 10) error = "berkas terlalu besar";
    else if (!extAllowed.split(",").includes(fileExt))
      error = "format berkas tidak valid";

    if (error) {
      ref.current.value = "";
    } else {
      // Tampilkan preview jika file adalah gambar
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => ({
            ...prev,
            [index]: reader.result, // Simpan preview berdasarkan indeks
          }));
        };
        reader.readAsDataURL(file);
      }
    }

    // Set error jika ada
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  const handleOptionLabelChange = (e, questionIndex, optionIndex) => {
    const { value } = e.target;
    const updatedFormContent = [...formContent];
    updatedFormContent[questionIndex].options[optionIndex].label = value;
    setFormContent(updatedFormContent);
  };

  const handleOptionChange = (e, index) => {
    const { value } = e.target;

    // Update correctAnswer pada formContent
    const updatedFormContent = [...formContent];
    updatedFormContent[index].correctAnswer = value;
    setFormContent(updatedFormContent);

    // Update selectedOptions untuk radio button yang dipilih
    const updatedSelectedOptions = [...selectedOptions];
    updatedSelectedOptions[index] = value;
    setSelectedOptions(updatedSelectedOptions);
  };

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

  const handleSaveChanges = async () => {
    try {
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

      Swal.fire("Berhasil!", "Perubahan berhasil disimpan.", "success");
    } catch (error) {
      console.error("Error saving changes:", error);
      Swal.fire(
        "Gagal!",
        "Terjadi kesalahan saat menyimpan perubahan.",
        "error"
      );
    }
  };

  const handleDeleteQuestion = (index) => {
    const question = formContent[index];
    const questionId = question.key; // Pastikan key adalah que_id

    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Pertanyaan ini akan dihapus permanen setelah Anda menyimpan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        if (question.type === "Pilgan") {
          // Simpan semua choice yang akan dihapus
          const choiceIds = question.options.map((option) => option.id);
          setDeletedChoices((prev) => [...prev, ...choiceIds]);
        }

        // Tandai question untuk dihapus
        setDeletedQuestions((prev) => [...prev, questionId]);

        // Hapus dari state formContent
        const updatedFormContent = [...formContent];
        updatedFormContent.splice(index, 1);
        setFormContent(updatedFormContent);

        Swal.fire("Dihapus!", "Pertanyaan telah dihapus sementara.", "success");
      }
    });
  };

  const [deletedQuestions, setDeletedQuestions] = useState([]);

  // Utility function to handle API calls
  const deleteQuestionAPI = async (questionId) => {
    try {
      const response = await axios.post(API_LINK + "Question/DeleteQuestion", {
        p1: questionId,
      });
      console.log("Question Deletion Response:", response.data);
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

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

  const parseExcelData = (data) => {
    const questions = data
      .map((row, index) => {
        // Skip header row (index 0) and the row below it (index 1)
        if (index < 2) return null;

        const options = row[3] ? row[3].split(",") : [];
        const points = typeof row[4] === "string" ? row[4].split(",") : [];

        return {
          text: row[1],
          type:
            row[2].toLowerCase() === "essay"
              ? "Essay"
              : row[2].toLowerCase() === "praktikum"
              ? "Praktikum"
              : "Pilgan",
          options: options.map((option, idx) => ({
            label: option,
            value: String.fromCharCode(65 + idx),
            point: points[idx] ? points[idx].trim() : null,
          })),
          point: row[5],
        };
      })
      .filter(Boolean);

    const initialSelectedOptions = questions.map((question, index) => {
      if (question.type === "Pilgan") {
        // Temukan indeks jawaban benar di dalam options
        const correctIndex = question.options.findIndex(
          (option) => option.value === question.correctAnswer
        );

        if (correctIndex !== -1) {
          // Jika jawaban benar ditemukan, pilih radio button tersebut
          return question.options[correctIndex].value;
        } else {
          // Jika jawaban benar tidak ditemukan, tetapkan nilai kosong
          return "";
        }
      } else {
        // Tidak ada pilihan awal untuk pertanyaan essay
        return "";
      }
    });

    setSelectedOptions(initialSelectedOptions);
    setFormContent((prevQuestions) => [...prevQuestions, ...questions]);
  };

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

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

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
      // Upload file ke server menggunakan fungsi uploadFile
      const uploadResponse = await uploadFile(file);
      console.log("Upload Response:", uploadResponse);

      // Pastikan menggunakan nama properti yang benar dari respons server
      if (!uploadResponse || !uploadResponse.Hasil) {
        throw new Error("Respon server tidak valid.");
      }

      // Perbarui data pertanyaan dengan file gambar
      const updatedFormContent = [...formContent];
      updatedFormContent[index] = {
        ...updatedFormContent[index],
        selectedFile: file, // Menyimpan file untuk akses nanti
        gambar: uploadResponse.Hasil, // Nama file yang dikembalikan server
        previewUrl: URL.createObjectURL(file), // Untuk preview
      };
      setFormContent(updatedFormContent);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

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

  const handleAdd = async (e) => {
    e.preventDefault();
    formData.timer = convertTimeToSeconds(timer);

    const validationErrors = await validateAllInputs(
      filteredData,
      userSchema,
      setErrors
    );

    console.log("Data yang divalidasi:", filteredData);
    console.log("Skema validasi:", userSchema.describe());

    console.log(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire({
        title: "Gagal!",
        text: "Pastikan semua data terisi dengan benar!.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    // Hitung total poin dari semua pertanyaan
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

    if (totalPoint !== 100) {
      Swal.fire({
        title: "Gagal!",
        text: `Total poin untuk seluruh pertanyaan harus berjumlah 100. Saat ini: ${totalPoint}`,
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    console.log(
      "Total Question Points (Essay/Praktikum):",
      formContent
        .filter((q) => q.type === "Essay" || q.type === "Praktikum")
        .reduce((total, q) => total + parseInt(q.point || 0, 10), 0)
    );

    console.log(
      "Total Option Points (Pilihan Ganda):",
      formContent
        .filter((q) => q.type === "Pilgan")
        .reduce(
          (total, q) =>
            total +
            q.options.reduce(
              (optionTotal, opt) => optionTotal + parseInt(opt.point || 0, 10),
              0
            ),
          0
        )
    );

    const quizPayload = {
      quizId: formData.quizId,
      materiId: formData.materiId,
      quizJudul: formData.quizJudul,
      quizDeskripsi: formData.quizDeskripsi,
      quizTipe: formData.quizTipe,
      tanggalAwal: formData.tanggalAwal,
      tanggalAkhir: formData.tanggalAkhir,
      timer: formData.timer,
      status: "Aktif",
      modifby: activeUser,
    };

    try {
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
        return;
      }

      const quizId = quizResponse.data[0].hasil;

      for (const question of formContent) {
        const formQuestion = {
          questionId: question.key || "", 
          quizId: quizId,
          soal: question.text,
          tipeQuestion: question.type,
          gambar: question.gambar || "",
          status: "Aktif",
          quemodifby: activeUser,
          point: parseInt(question.point, 10) || 0,
        };

        console.log("Payload for edit question:", formQuestion);

        console.log(question.key);
        if (question.type === "Essay" || question.type === "Praktikum") {
          if (question.selectedFile) {
            try {
              const uploadResult = await uploadFile(question.selectedFile);
              formQuestion.gambar = uploadResult.Hasil;

              console.log("Gam", formQuestion.gambar);
            } catch (uploadError) {
              console.error("Gagal mengunggah gambar:", uploadError);
              Swal.fire({
                title: "Gagal!",
                text: `Gagal mengunggah gambar untuk pertanyaan: ${question.text}`,
                icon: "error",
                confirmButtonText: "OK",
              });
              return;
            }
          } else {
            formQuestion.gambar = "";
          }
        } else if (question.type === "Pilgan") {
          formQuestion.gambar = "";
        }

        // Simpan pertanyaan
        const questionResponse = await axios.post(
          API_LINK + "Question/UpdateDataQuestion",
          formQuestion
        );
        console.log("API Response for Question Save:", questionResponse.data);

        if (!questionResponse.data.length) {
          Swal.fire({
            title: "Error!",
            text: `Gagal menyimpan pertanyaan "${question.text}".`,
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }

        const questionId = questionResponse.data[0].hasil;
        console.log("Pertanyaan ID:", questionId);

        // Simpan jawaban untuk Pilgan atau Essay
        if (question.type === "Essay" || question.type === "Praktikum") {
          const answerData = {
            cho_id: question.answerId || "", // Tambahkan ID jawaban jika ada
            questionId: questionId,
            urutanChoice: "",
            cho_isi: question.text, // Isi jawaban
            cho_nilai: question.point,
            quemodifby: activeUser,
          };

          console.log("ans ess", answerData);
          await axios.post(API_LINK + "Choice/UpdateDataChoice", answerData);
        } else if (question.type === "Pilgan") {
          for (const [optionIndex, option] of question.options.entries()) {
            const answerData = {
              cho_id: option.id || "", 
              questionId: questionId,
              urutanChoice: optionIndex + 1,
              cho_isi: option.label,
              cho_nilai: option.point || 0,
              quemodifby: activeUser,
            };

            console.log("ans pilgan", answerData);
            await axios.post(API_LINK + "Choice/UpdateDataChoice", answerData);
          }
        }

        try {
          // Proses penghapusan opsi dari database
          for (const choiceId of deletedChoices) {
            await axios.post(API_LINK + "Choice/DeleteChoice", {
              cho_id: choiceId,
            });
          }
        } catch (error) {
          console.error("Error delete choice:", error);
        }
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Pre Test berhasil diubah",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
       window.location.reload();
      });
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menyimpan data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  const downloadFile = async (fileName) => {
    try {
      const response = await axios.get(
        `${API_LINK}Utilities/DownloadFile/${fileName}`,
        {
          responseType: "blob", // Untuk menangani data biner
        }
      );

      // Buat URL objek untuk file yang diunduh
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Set nama file untuk unduhan
      link.setAttribute("download", fileName);

      // Tambahkan link sementara ke DOM, klik untuk mengunduh, lalu hapus
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  useEffect(() => {
    const updatedFormContent = formContent.map((question) => {
      if (question.gambar) {
        return {
          ...question,
          previewUrl: `${API_LINK}Utilities/Upload/DownloadFile?namaFile=${encodeURIComponent(
            question.gambar
          )}`,
        };
      }
      return question;
    });
    setFormContent(updatedFormContent);
  }, []);

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/template.xlsx"; // Path to your template file in the public directory
    link.download = "template.xlsx";
    link.click();
  };

  const updateFormQuestion = (name, value) => {
    setFormQuestion((prevFormQuestion) => ({
      ...prevFormQuestion,
      [name]: value,
    }));
  };

  const handleTimerChange = (e) => {
    const { value } = e.target;
    setTimer(value);
    // console.log(convertTimeToSeconds(timer))
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

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

  const handlePageChange = (content) => {
    onChangePage(content);
  };

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

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };
  const handleStepChange = (stepContent) => {
    onChangePage(stepContent);
  };
  //   if (isLoading) return <Loading />;

  const handleStepAdded = (stepName) => {
    console.log("Step ditambahkan:", stepName);
  };

  const handleStepRemoved = (stepName) => {
    console.log("Step dihapus:", stepName);
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
            Edit Pre-Test
          </h4>
        </div>
      </div>

      <form id="myForm" onSubmit={handleAdd}>
        <div>
          <CustomStepper
            activeStep={4}
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
                  <div className="col-lg">
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
                                hasExisting={formContent[index]?.gambar || null}
                                style={{ fontSize: "12px" }}
                              />

                              {/* Tampilkan preview gambar jika ada gambar yang dipilih */}
                              {question.previewUrl && (
                                <div
                                  style={{
                                    maxWidth: "300px",
                                    maxHeight: "300px",
                                    overflow: "hidden",
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
                                <input
                                  type="radio"
                                  id={`option_${index}_${optionIndex}`}
                                  name={`option_${index}`}
                                  value={option.value}
                                  checked={
                                    selectedOptions[index] === option.value
                                  }
                                  onChange={(e) => handleOptionChange(e, index)}
                                  style={{ marginRight: "10px" }}
                                />
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
                                {!option.id && (
                                  <span className="badge bg-warning">Baru</span>
                                )}{" "}
                                {/* Bagian ini */}
                                <Button
                                  iconName="delete"
                                  classType="btn-sm ms-2 px-2 py-0"
                                  onClick={() =>
                                    handleDeleteOption(index, optionIndex)
                                  }
                                  style={{ marginRight: "10px" }}
                                />
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
                              </div>
                            ))}
                            <Button
                              onClick={() => handleAddOption(index)}
                              iconName="add"
                              classType="success btn-sm ms-2 px-3 py-1"
                              label="Opsi Baru"
                            />
                          </div>
                        )}
                        <div className="d-flex justify-content-between my-2 mx-1">
                          <div></div>
                          <div className="d-flex">
                            <div className="mr-3">
                              <Button
                                iconName="trash"
                                label="Hapus"
                                classType="btn-sm ms-2 px-3 py-2 fw-semibold rounded-3"
                                style={{
                                  backgroundColor: "red",
                                  color: "white",
                                }}
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
                    onClick={() =>
                      onChangePage(
                        "sharingEdit",
                        AppContext_test.ForumForm,
                        AppContext_master.MateriForm,
                        (AppContext_master.count += 1)
                      )
                    }
                  />
                  {hasTest ? (
                    <div className="d-flex">
                      <Button
                        classType="primary ms-2 px-4 py-2"
                        type="submit"
                        label="Edit"
                        onClick={handleSaveChanges}
                      />
                      <Button
                        classType="primary ms-3 px-4 py-2"
                        label="Berikutnya"
                        onClick={() =>
                          onChangePage(
                            "posttestEdit",
                            AppContext_master.MateriForm,
                            (AppContext_master.count += 1),
                            AppContext_test.ForumForm
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div
                  className=""
                  style={{ marginLeft: "20px", marginRight: "20px" }}
                >
                  <Alert
                    type="warning"
                    message={
                      <span>
                        Pre-Test belum ditambahkan.{" "}
                        <a
                          onClick={() =>
                            onChangePage(
                              "pretestEditNot",
                              AppContext_master.MateriForm
                            )
                          }
                          className="text-primary"
                        >
                          Tambah Data
                        </a>
                      </span>
                    }
                  />
                </div>
                <div className="d-flex justify-content-between ">
                  <div className="ml-4">
                    <Button
                      classType="outline-secondary me-2 px-4 py-2"
                      label="Sebelumnya"
                      onClick={() =>
                        onChangePage(
                          "sharingEdit",
                          AppContext_test.ForumForm,
                          AppContext_master.MateriForm = AppContext_master.DetailMateriEdit,
                          (AppContext_master.count += 1)
                        )
                      }
                    />
                  </div>
                  <div className="d-flex mr-4">
                    <Button
                      classType="primary ms-3 px-4 py-2"
                      label="Berikutnya"
                      onClick={() =>
                        onChangePage(
                          "posttestEdit",
                          AppContext_master.MateriForm = AppContext_master.DetailMateriEdit,
                          (AppContext_master.count += 1)
                        )
                      }
                    />
                  </div>
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
