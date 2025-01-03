import { useEffect, useRef, useState } from "react";
import { useLocation} from 'react-router-dom';
import { object, string } from "yup";
import { API_LINK, ROOT_LINK } from "../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../util/ValidateForm";
import SweetAlert from "../../../util/SweetAlert";
import UseFetch from "../../../util/UseFetch";
import UploadFile from "../../../util/UploadFile";
import Button from "../../../part/Button copy";
import DropDown from "../../../part/Dropdown";
import Input from "../../../part/Input";
import FileUpload from "../../../part/FileUpload";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import KMS_Sidebar from '../../../part/KMS_SideBar';
// import Sidebar from '../../.backbone/SideBar';
import styled from 'styled-components';
import KMS_Uploader from "../../../part/KMS_Uploader";
import axios from "axios";
import Swal from 'sweetalert2';
import AppContext_test from "./TestContext";
import { RFC_2822 } from "moment/moment";
import he from "he";
import Cookies from "js-cookie";
import { decryptId } from "../../../util/Encryptor";
import Search from "../../../part/Search";

const ButtonContainer = styled.div`
  bottom: 35px;
  display: flex;
  justify-content: space-between;
`;

export default function PengerjaanTest({ onChangePage, quizType, materiId, quizId, durasi }) {
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;

  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState([]);
  const [questionNumbers, setQuestionNumbers] = useState(0);
  const [nilai, setNilai] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(false);
  const [fileAnswers, setFileAnswers] = useState({});

  const formDataRef = useRef({
    trqId: AppContext_test.dataIdTrQuiz,
    quizId: quizId,
    status: "Not Reviewed",
    karyawanId:activeUser,
    // nilai: "", 
    // answers: [],
    // createdBy: AppContext_test.displayName,
    keterangan: "",
  });

  const [formDataRef2, setFormData2] = useState([]);
  console.log("id tr quiz di test", AppContext_test.dataIdTrQuiz)
  useEffect(() => {
  }, [quizType, materiId]);


  const formUpdate = useRef({
    idMateri:AppContext_test.materiId,
    karyawanId: activeUser,
    totalProgress: "0", 
    statusMateri_PDF: "",
    statusMateri_Video: "",
    statusSharingExpert_PDF: "",
    statusSharingExpert_Video: "",
    createdBy: activeUser,
  });


  function convertEmptyToNull(obj) {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = value === "" ? null : value;
    }
    return newObj;
  }
  
  const processedFormUpdate = convertEmptyToNull(formUpdate);
  const fileInputRef = useRef(null);

  const userSchema = object({
    gambar: string(),
  });

  const handleSubmitConfirmation = () => {
    Swal.fire({
      title: 'Apakah anda yakin sudah selesai?',
      text: 'Jawaban akan disimpan dan tidak dapat diubah lagi.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, submit',
      cancelButtonText: 'Tidak',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleAdd();
        handleSubmitAction();
      }
    });
  };

   useEffect(() => {
  }, [quizType, materiId]);
  
  useEffect(() => {
    if (timeRemaining == true){
        handleAdd();
        handleSubmitAction();
    }
  }, [timeRemaining]);

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    const validationError = await validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  function handleSubmitAction() {
    if (quizType == "Pretest"){
      onChangePage("pretest", true, materiId)
      AppContext_test.refreshPage = "pretest";
    } else if (quizType == "Posttest"){
      onChangePage("posttest", true, materiId)
      AppContext_test.refreshPage = "posttest";
    }
  }

  const handleTextareaChange = (event, index, itemId) => {
    const value = event.target.value;
    handleValueAnswer("0", "", "", "essay", index, value, itemId);
  };


  const handleFileChange = (ref, extAllowed, event, currentIndex, id_question) => {
    console.log("data event", event)
    const file = event.target.files[0];
    console.log("data file", file)

    if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!extAllowed.includes(fileExtension)) {
            Swal.fire({
                title: "Format tidak valid!",
                text: `Harap unggah file dengan format yang diizinkan: ${extAllowed.join(', ')}`,
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        // Simpan file ke state
        setFileAnswers((prev) => ({
            ...prev,
            [`${currentIndex}-${id_question}`]: file,
        }));

        // Panggil handleValueAnswer (jika diperlukan)
        handleValueAnswer("0", "", "", "Praktikum", currentIndex, event, id_question);
    }
};

const getUploadedFile = (currentIndex, id_question) => {

  return fileAnswers[`${currentIndex}-${id_question}`]?.name || "Tidak ada file yang dipilih";
};


  useEffect(() => {
    const checkStatus = () => {
      const hasEssayOrPraktikum = currentData.some(item => item.type === "Essay" || item.type === "Praktikum");
      formDataRef.current.status = hasEssayOrPraktikum ? "Not Reviewed" : "Reviewed";
    };

    checkStatus();
  }, [currentData]);


  const handleAdd = async (e) => {
    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    let countBenar = 0;
    let totalPoint = 0;
    const totalNilai = answers.reduce((accumulator, currentValue) => {
      console.log("value",currentValue.nilaiSelected);
      const nilaiSelected = parseFloat(currentValue.nilaiSelected) || 0;
      if (nilaiSelected !== 0) {
        countBenar += 1;
        totalPoint += currentValue.nilaiSelected;
        console.log("totalPoin", countBenar)
      }
      return accumulator + nilaiSelected;
    }, 0);
    if(formDataRef.current.status === "Reviewed"){  
    if(countBenar < 80){
      formDataRef.current.keterangan = "Tidak Lulus Quiz";
    } else {
      formDataRef.current.keterangan = "Lulus Quiz";
    }
    } else {
      formDataRef.current.status = "Not Reviewed";
    }

    // formDataRef.current.nilai = totalNilai;
    // formDataRef.current.answers = submittedAnswers;
    // formDataRef.current.jumlahBenar = countBenar;

    console.log("semua jawaban", submittedAnswers[0])
    let responseSave = false;
    let maxRetries = 10; 
    let retryCount = 0;

    const submittedAnswersFormatted = submittedAnswers.map(item => ({
      ans_urutan: item[0],
      que_id: item[1],
      ans_jawaban_pengguna: item[2],
      ans_nilai: item[3],
      trq_id: item[4],
      ans_created_by: item[5]
    }));

    console.log("submitt answer", submittedAnswersFormatted)

    while ((!responseSave)) {
      try {
        const response = await axios.post(API_LINK + 'Quiz/SaveDetailTransaksiQuiz', formDataRef.current);
        if (response.data.length != 0){
          responseSave = true;
          try {
            const response = await axios.post(API_LINK + 'Quiz/UpdateNilaiQuiz', {
              idTrQuiz: AppContext_test.dataIdTrQuiz,
              jumlahBenar: countBenar,
              nilai: totalPoint
            });
            if (response.data.length != 0){
              responseSave = true;
            }
          } catch (error) {
            console.error("Error:", error);
          }
          for (let i = 0; i < submittedAnswersFormatted.length; i++) {
            console.log("Data ke-", i, ":", submittedAnswersFormatted[i]);
            try {
              const response = await axios.post(API_LINK + 'Quiz/SaveDataAnswer', submittedAnswersFormatted[i]);
              if (response.data.length != 0) {
                console.log("Berhasil:", response.data);
              }
            } catch (error) {
              console.error("Error:", error.response ? error.response.data : error.message);
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };


  const retryRequest = async (url, data, maxRetries = 100, delay = 50) => {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const response = await axios.post(url, data);
        return response.data;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new Error("Max retries reached");
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const selectPreviousQuestion = () => {
    if (selectedQuestion > 1) {
      setSelectedQuestion(selectedQuestion - 1);
    } else {
      setSelectedQuestion(selectedQuestion + questionNumbers - 1);
    }
  };

  const selectNextQuestionOrSubmit = () => {
    if (selectedQuestion < questionNumbers) {
      setSelectedQuestion(selectedQuestion + 1);
    } else {
      handleSubmitConfirmation();
    }
  };

  const [selectedQuestion, setSelectedQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [submittedAnswersEssay, setSubmittedAnswersEssay] = useState([]);

  useEffect(() => {
  }, [AppContext_test.arrayAnswerQuiz]);

  const handleValueAnswer = (urutan, idSoal, answer, nilaiSelected, index, file, id_question) => {
    console.log("tes answer", urutan,idSoal, nilaiSelected, index, file, id_question )
    setSelectedOption(answer);

    const updatedAnswers = [...answers];
    const submitAnswer = [...submittedAnswers];
    const existingAnswerIndex = updatedAnswers.findIndex(
      (ans) => ans.idSoal === idSoal 
    );
    if (file != undefined || file != null){
      const uploadPromises = [];
      const existingAnswerNonPilgan = updatedAnswers.findIndex(
        (ans) => ans.id_question === id_question 
      );
      uploadPromises.push(
        UploadFile(file.target).then((data) => {
          console.log("data file", data)
          console.log("data praktikum", nilaiSelected)
          if (nilaiSelected != "essay") {
            if (existingAnswerNonPilgan !== -1) {
              console.log("ayamm")
              updatedAnswers[existingAnswerNonPilgan] = {urutan,id_question,answer,nilaiSelected};
              submitAnswer[existingAnswerNonPilgan] = [urutan,id_question,data.Hasil,"0",AppContext_test.dataIdTrQuiz,activeUser];
            }else{
              console.log("bebek")
              updatedAnswers.push({urutan,id_question,answer,nilaiSelected});
              submitAnswer.push ([urutan,id_question,data.Hasil,"0",AppContext_test.dataIdTrQuiz,activeUser]) ;
            }
          } else {
            if (existingAnswerNonPilgan !== -1) {
              console.log("kodok")
              updatedAnswers[existingAnswerNonPilgan] = {nilaiSelected,id_question,answer};
              submitAnswer[existingAnswerNonPilgan] = [urutan,id_question,file,"0",AppContext_test.dataIdTrQuiz,activeUser];
              console.log("submit answerr", urutan,id_question,file,"0",AppContext_test.dataIdTrQuiz,activeUser)
            }else{
              console.log("cabee")
              updatedAnswers.push({nilaiSelected,id_question,answer});
              submitAnswer.push ([urutan,id_question,answer,"0",AppContext_test.dataIdTrQuiz,activeUser]) ;
            }
          }
        })
      )

    }else{
      // if (existingAnswerIndex !== -1) {
      //   updatedAnswers[existingAnswerIndex] = {urutan,idSoal,answer,nilaiSelected};
      //   submitAnswer[existingAnswerIndex] = [urutan,idSoal,answer,nilaiSelected,AppContext_test.dataIdTrQuiz, activeUser];
      // } else {
      //   updatedAnswers.push({urutan,idSoal,answer,nilaiSelected});
      //   submitAnswer.push ([urutan,idSoal,answer,nilaiSelected,AppContext_test.dataIdTrQuiz,activeUser]) ;
      // }

      if (currentData[index - 1]?.options[0]?.cho_tipe === "Jamak") {
        // Jika tipe soal adalah jamak
        const existingAnswerIndex = updatedAnswers.findIndex(
          (ans) => ans.idSoal === idSoal && ans.answer === answer
        );
        if (existingAnswerIndex !== -1) {
          // Jika sudah ada di state, hapus jawaban
          updatedAnswers.splice(existingAnswerIndex, 1);
          submitAnswer[existingAnswerIndex] = [urutan,id_question,answer,nilaiSelected,AppContext_test.dataIdTrQuiz, activeUser];
        } else {
          // Jika belum ada di state, tambahkan jawaban
          updatedAnswers.push({ urutan, idSoal, answer, nilaiSelected });
          submitAnswer[existingAnswerIndex] = [urutan,id_question,answer,nilaiSelected,AppContext_test.dataIdTrQuiz, activeUser];
        }
      } else {
        // Logika untuk pilihan tunggal
        const existingAnswerIndex = updatedAnswers.findIndex(
          (ans) => ans.idSoal === idSoal
        );
        if (existingAnswerIndex !== -1) {
          updatedAnswers[existingAnswerIndex] = {
            urutan,
            idSoal,
            answer,
            nilaiSelected,
          };
          
          submitAnswer[existingAnswerIndex] = [urutan,idSoal,answer,nilaiSelected,AppContext_test.dataIdTrQuiz, activeUser];
          console.log("tesstimoni", urutan,idSoal,answer,nilaiSelected,AppContext_test.dataIdTrQuiz, activeUser)
        } else {
          console.log("bebbeee")
          updatedAnswers.push({ urutan, idSoal, answer, nilaiSelected });
          submitAnswer.push ([urutan,idSoal,answer,nilaiSelected,AppContext_test.dataIdTrQuiz,activeUser]) ;
          console.log("haloo", urutan,idSoal,answer,nilaiSelected,AppContext_test.dataIdTrQuiz, activeUser)
        }
      }
    }

    idSoal = index;
    setAnswers(updatedAnswers);
    setSubmittedAnswers(submitAnswer);  
    AppContext_test.indexTest = index;
  };
  
  useEffect(() => {
  }, [submittedAnswers]);

  useEffect(() => {
    setAnswerStatus((prevStatus) => {
      const newStatus = [...prevStatus];
      newStatus[AppContext_test.indexTest - 1] = "answered";
      return newStatus;
    });
  }, [answers, AppContext_test.indexTest]);


  const [answerStatus, setAnswerStatus] = useState([]);

  useEffect(() => {
    const initialAnswerStatus = Array(questionNumbers).fill(null);
    setAnswerStatus(initialAnswerStatus);
  }, [questionNumbers]);


  const [gambar, setGambar] = useState();

  useEffect(() => {
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(API_LINK + "Quiz/GetDataQuestion", {
          idQuiz: quizId
        });
        console.log("idQuiz", response.data);
        console.log("question", response)
        const checkIsDone = await axios.post(API_LINK + "Quiz/GetDataResultQuiz", {
          materiId: AppContext_test.materiId,
          karyawanId: activeUser,
        });
        if (response.data && Array.isArray(response.data)) {
        AppContext_test.quizId = response.data[0].ForeignKey;
        const questionMap = new Map();
        const filePromises = [];

        const transformedData = response.data.map((item) => {
          const { Soal, TipeSoal, Jawaban, UrutanJawaban, NilaiJawaban, ForeignKey, Key, Gambar } = item;
          if (!questionMap.has(Soal)) {
            questionMap.set(Soal, true);
            const question = {
              id: Key,
              type: TipeSoal,
              question: Soal,
              correctAnswer: Jawaban,
              point: NilaiJawaban,
              answerStatus: "none",
              gambar: Gambar ? "" : null,
            };

            if (Gambar) {
              const gambarPromise = API_LINK + `Upload/GetFile/${Gambar}`;
              console.log("gambar",gambarPromise)
              question.gambar = gambarPromise; 
              filePromises.push(gambarPromise);
            }

            if (TipeSoal === "Pilgan") {
              question.options = response.data
                .filter(choice => choice.Key === item.Key)
                .map(choice => ({
                  value: choice.Jawaban,
                  urutan: choice.UrutanJawaban,
                  nomorSoal: choice.Key,
                  nilai: choice.NilaiJawabanOpsi,
                  cho_tipe: choice.TipePilihan,
                }));
              question.correctAnswer = question.options.find(option => option.value === Jawaban && option.nilai !== "0");
            }
            return question;
          }
          return null;
        }).filter(item => item !== null);

        await Promise.all(filePromises);

        setCurrentData(transformedData);
        setQuestionNumbers(transformedData.length);
      } else {
        throw new Error("Data format is incorrect");
      }
      } catch (error) {
        setIsError(true);
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    formDataRef.current.quizId = AppContext_test.quizId
  }, [AppContext_test.quizId]);

  const getSubmittedAnswer = (itemId) => {
    // Cari nilai yang sesuai dalam submittedAnswers
    const answer = submittedAnswers.find(
      (answer) => answer[1] === itemId
    );
    // Jika ditemukan, kembalikan nilai yang sesuai, jika tidak kembalikan string kosong
    return answer ? answer[2] : "";
  };

  const removeHtmlTags = (str) => {
    return str.replace(/<\/?[^>]+(>|$)/g, ''); // Menghapus semua tag HTML
  };

  return (
  <>
    <Search
            title="Kuis Materi"
            description="Berdoalah terlebih dahulu, pastikan anda menjawab jawaban yang paling tepat bagi anda. Penialaian anda akan menjadi bahan evaluasi pada materi ini."
            placeholder="Cari Kelompok Keahlian"
            showInput={false}
          />
    <div className="d-flex mt-3" style={{ marginLeft:"100px", marginRight:"100px", height:"100vh"}}>
      <div className=" p-3 d-flex ">
        <div className="mb-3 d-flex" style={{ overflowX: 'auto' }}>
          {currentData.map((item, index) => {
            const key = `${item.question}_${index}`;
            if (index + 1 !== selectedQuestion) return null;
            const totalPoints =
            item.type === "Pilgan" && item.options
              ? item.options.reduce(
                  (sum, option) => sum + (parseFloat(option.nilai) || 0),
                  0
                )
              : item.type === "Essay" || item.type === "Praktikum"
              ? parseFloat(item.point || 0) // Ambil poin langsung dari item.point
              : 0;

            const currentIndex = index + 1;
            return (
              <div key={key} className="mb-3" style={{ display: 'block', minWidth: '910px', marginRight: '20px' }}>
                {/* Soal */}
                <div className="mb-3">
                  <h4 style={{ wordWrap: 'break-word', overflowWrap: 'break-word', textAlign:'justify', color:"#002B6C" }}>
                    <div className="">        
                        <span>{removeHtmlTags(he.decode(item.question))}</span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#6c757d", 
                          marginLeft: "8px", 
                        }}
                      >
                        ({totalPoints} Points)
                      </span>

                    </div>
                  </h4>
                {(item.type === "Essay" || item.type === "Praktikum") && item.gambar && (
                  <div>
                    <img
                      id="image"
                      src={item.gambar}
                      alt="gambar"
                      className="img-fluid"
                      style={{
                        maxWidth: '500px',
                        maxHeight: '500px',
                        overflow: 'hidden',
                        borderRadius:"20px"
                      }}
                    />
                  </div>
                )}
                </div>

                {/* Jawaban */}
                {item.type === "Praktikum" ? (
                <FileUpload
                forInput="jawaban_file"
                label="Jawaban (.zip)"
                formatFile=".zip" // Format file yang diizinkan
                hasExisting={getUploadedFile(index + 1, item.id)} // Menampilkan nama file yang dipilih
                onChange={(event) => handleFileChange(fileInputRef, ["zip"], event, index + 1, item.id)}
                style={{ width: "105vh" }}
            />
            
                ) : item.type === "Essay" ? (
                  <Input
                    name="essay_answer"
                    type="textarea"
                    label="Jawaban Anda:"
                    value={getSubmittedAnswer(item.id)}
                    onChange={(event) => handleTextareaChange(event, index + 1, item.id)}
                    style={{ width: '105vh' }}
                  />
                ) : (
                  // <div className="d-flex flex-column">
                  //   {item.options.map((option, index) => {
                  //     const isCorrect = option === item.correctAnswer;
                  //     const isSelected = answers.some(
                  //       (ans) => ans.idSoal == option.nomorSoal && ans.urutan == option.urutan
                  //     );

                  //     let borderColor1 = '';
                  //     let backgroundColor1 = '';

                  //     if (isSelected) {
                  //       borderColor1 = isCorrect ? '#28a745' : '#dc3545';
                  //       backgroundColor1 = isCorrect ? '#e9f7eb' : '#ffe3e6';
                  //     } else if (isCorrect && isSelected) {
                  //       borderColor1 = '#28a745';
                  //       backgroundColor1 = '#e9f7eb';
                  //     }

                  //     return (
                  //       <div key={option.urutan} className="mt-4 mb-2" style={{ display: "flex", alignItems: "center" }}>
                  //         <input
                  //           type="radio"
                  //           id={`option-${option.urutan}`}
                  //           name={ `question-${selectedQuestion}`}
                  //           onChange={() => handleValueAnswer(option.urutan, option.nomorSoal, option.value, option.nilai, currentIndex)}
                  //           checked={isSelected}
                  //           style={{ display: "none" }}
                  //         />
                  //         <label
                  //           htmlFor={`option-${option.urutan}`}
                  //           className={`btn btn-outline-primary ${isSelected ? 'active' : ''}`}
                  //           style={{
                  //             width: "40px",
                  //             height: "40px",
                  //             display: "flex",
                  //             alignItems: "center",
                  //             justifyContent: "center",
                  //           }}
                  //         >
                  //           {String.fromCharCode(65 + index)}
                  //         </label>
                  //         <span className="ms-2" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{option.value}</span>
                  //       </div>
                  //     );
                  //   })}
                  // </div>
                  <div className="d-flex flex-column">
                      {/* Keterangan pada jamak, isi jumlah checkbox sesuai opsi yang benar*/}
                      {item.options[0].cho_tipe === "Jamak" && (
                        <div className="">
                          Pilihlah{" "}
                          {
                            item.options.filter(
                              (option) => parseFloat(option.nilai) !== 0
                            ).length
                          }{" "}
                          opsi jawaban.
                        </div>
                      )}

                      {item.options.map((option, index) => {
                        const isCorrect = option === item.correctAnswer;
                        const isSelected = answers.some(
                          (ans) =>
                            ans.idSoal == option.nomorSoal &&
                            ans.urutan == option.urutan
                        );

                        let borderColor1 = "";
                        let backgroundColor1 = "";

                        if (isSelected) {
                          borderColor1 = isCorrect ? "#28a745" : "#dc3545";
                          backgroundColor1 = isCorrect ? "#e9f7eb" : "#ffe3e6";
                        } else if (isCorrect && isSelected) {
                          borderColor1 = "#28a745";
                          backgroundColor1 = "#e9f7eb";
                        }

                        return (
                          <div
                            key={option.urutan}
                            className="mt-4 mb-2"
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {console.log("item", item.options)}
                            {item.options[0].cho_tipe === "Tunggal" ? (
                              // Tampilkan Radio Button untuk Tunggal
                              <>
                                <input
                                  type="radio"
                                  id={`option-${option.urutan}`}
                                  name={`question-${selectedQuestion}`}
                                  onChange={() =>
                                    handleValueAnswer(
                                      option.urutan,
                                      option.nomorSoal,
                                      option.value,
                                      option.nilai,
                                      currentIndex
                                    )
                                  }
                                  checked={isSelected}
                                  style={{ display: "none" }}
                                />
                                <label
                                  htmlFor={`option-${option.urutan}`}
                                  className={`btn btn-outline-primary ${
                                    isSelected ? "active" : ""
                                  }`}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {String.fromCharCode(65 + index)}
                                </label>
                                <span
                                  className="ms-2"
                                  style={{
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {option.value}
                                </span>
                              </>
                            ) : (
                              // Tampilkan Checkbox untuk Jamak
                              <>
                                <input
                                  type="checkbox"
                                  id={`option-${option.urutan}`}
                                  name={`question-${selectedQuestion}`}
                                  onChange={(e) =>
                                    handleValueAnswer(
                                      option.urutan,
                                      option.nomorSoal,
                                      option.value,
                                      option.nilai,
                                      currentIndex
                                    )
                                  }
                                  checked={isSelected}
                                  style={{
                                    marginLeft: "6px",
                                    marginRight: "10px",
                                    transform: "scale(2)",
                                    borderColor: "#000",
                                  }}
                                />
                                <span
                                  style={{
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                  }}
                                >
                                  {option.value}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                )}
          <form onSubmit={handleAdd}>
          <div className="mt-4">
            <ButtonContainer>
              <Button
                style={{backgroundColor:"transparent"}}
                classType="outline-secondary me-2 px-4 py-2"
                label="Sebelumnya"
                onClick={selectPreviousQuestion}
              />
              <Button
                classType="primary ms-2 px-4 py-2"
                label={selectedQuestion < questionNumbers ? "Berikutnya" : "Selesai"}
                onClick={selectNextQuestionOrSubmit}
              />
            </ButtonContainer>
          </div>
        </form>
              </div>
            );
          })}
        </div>
        <div style={{ height: '100%', width: '1px', backgroundColor: '#E4E4E4', margin: '0 auto' }} />
      </div>
     
      <KMS_Sidebar
        questionNumbers={questionNumbers}
        selectedQuestion={selectedQuestion}
        setSelectedQuestion={setSelectedQuestion}
        answerStatus={answerStatus}
        checkMainContent="test"
        setTimeRemaining={setTimeRemaining}
        timeRemaining={durasi}
        onChangePage={onChangePage}
      />
    </div>
  </>
);

}