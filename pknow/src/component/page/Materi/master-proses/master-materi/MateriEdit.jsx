import { useRef, useState, useEffect } from "react";
import { object, string } from "yup";
import { API_LINK } from "../../../../util/Constants";
import { validateAllInputs, validateInput } from "../../../../util/ValidateForm";
import SweetAlert from "../../../../util/SweetAlert";
import UseFetch from "../../../../util/UseFetch";
import Button from "../../../../part/Button copy";
import FileUpload from "../../../../part/FileUpload";
import uploadFile from "../../../../util/UploadFile";
import Alert from "../../../../part/Alert";
import AppContext_master from "../MasterContext";
import AppContext_test from "../../master-test/TestContext";
import axios from "axios";
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import BackPage from "../../../../../assets/backPage.png";
import Konfirmasi from "../../../../part/Konfirmasi";

const steps = ["Pengenalan", "Materi", "Forum", "Sharing Expert", "Pre Test", "Post Test"];

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
            //onClick={() => onChangePage(getStepContent(index))} 
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

export default function MastermateriEdit({ onChangePage}) {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listKategori, setListKategori] = useState([]);
  const [isFileDisabled, setIsFileDisabled] = useState(false);
  const [resetStepper, setResetStepper] = useState(0);
  const fileInputRef = useRef(null);
  const gambarInputRef = useRef(null);
  const vidioInputRef = useRef(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false); 
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleGoBack = () => {
    setIsBackAction(true);  
    setShowConfirmation(true);  
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false); 
    window.location.reload()  
  };


  const handleConfirmNo = () => {
    setShowConfirmation(false);  
  };

  const previewFile = async (namaFile) => {
    try {
      namaFile = namaFile.trim();
      console.log(namaFile);

      // Ubah URL untuk menyertakan namaFile langsung di path URL
      const response = await axios.get(`${API_LINK}Upload/GetFile/${namaFile}`, {
        responseType: 'arraybuffer' 
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error fetching file:", error);
    }
};

  const Materi = AppContext_master.MateriForm;
  const kategori = AppContext_master.KategoriIdByKK;
  AppContext_test.materiPdf = Materi.File_pdf
  AppContext_test.materiVideo = Materi.File_video

  // Referensi ke form data menggunakan useRef
  const formDataRef = useRef({
    mat_id:Materi.Key,
    kat_id: AppContext_test.KategoriIdByKK, 
    mat_judul: Materi.Judul, 
    mat_file_pdf: Materi.File_pdf,
    mat_file_video: Materi.File_video,
    mat_pengenalan: "",
    mat_keterangan: Materi.Keterangan,
    kry_id: AppContext_test.karyawanId,
    mat_kata_kunci:Materi["Kata Kunci"],
    mat_gambar: "",
    modifiedBy: AppContext_test.activeUser
  });

  // Validasi skema menggunakan Yup
  const userSchema = object({
    mat_id:string(),
    kat_id: string(),
    mat_judul: string(),
    mat_file_pdf: string(),
    mat_file_video: string(),
    mat_pengenalan: string(),
    mat_keterangan: string(),
    kry_id: string(),
    mat_kata_kunci: string(),
    mat_gambar: string(),
    modifiedBy: string(),
  });

  const handlePdfChange = () => handleFileChange(fileInputRef, "pdf,docx,xlsx,pptx", 10);
  const handleVideoChange = () => handleFileChange(vidioInputRef, "mp4,mov", 250);
  const handleFileChange = async (ref, extAllowed, maxFileSize) => {
    const { name, value } = ref.current;
    const file = ref.current.files[0];
    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop();
    const validationError = await validateInput(name, value, userSchema);
    let error = "";

    if (fileSize / 1024 / 1024 > maxFileSize) {
      error = `Berkas terlalu besar, maksimal ${maxFileSize}MB`;
      SweetAlert("Error", error, "error");
    } else if (!extAllowed.split(",").includes(fileExt)) {
      error = "Format berkas tidak valid";
      SweetAlert("Error", error, "error");
    }

    if (error) ref.current.value = "";

    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: error,
    }));
  };

  // Handle form submit
  const handleAdd = async (e) => {
    e.preventDefault();

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsFormSubmitted(true);
      setIsLoading(true);
      setIsError((prevError) => {
        return { ...prevError, error: false };
      });
      setErrors({});

      const uploadPromises = [];

      let hasPdfFile = false;
      let hasVideoFile = false;

      if (fileInputRef.current && fileInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(fileInputRef.current).then((data) => {
            formDataRef.current["mat_file_pdf"] = data.Hasil;
            AppContext_test.materiPdf = data.Hasil;
            hasPdfFile = true;
          })
        );
      }

      if (vidioInputRef.current && vidioInputRef.current.files.length > 0) {
        uploadPromises.push(
          uploadFile(vidioInputRef.current).then((data) => {
            formDataRef.current["mat_file_video"] = data.Hasil;
            AppContext_test.materiVideo = data.Hasil;
            hasVideoFile = true;
          })
        );
      }

      Promise.all(uploadPromises).then(() => {
        if (!hasPdfFile && !hasVideoFile) {
          setIsLoading(false);
          SweetAlert("Terjadi Kesalahan!", "Harus memilih salah satu file PDF atau file video, tidak boleh keduanya kosong.", "error");
          return;
        }
        axios.post(API_LINK + "Materi/UpdateSaveDataMateri", formDataRef.current)
          .then(response => {
            console.log(formDataRef.current)
            const data = response.data;
            console.log(data)
            if (data[0].hasil === "OK") {
              SweetAlert("Sukses", "Data Materi berhasil disimpan", "success");
              AppContext_master.formSavedMateriFile = true;
            } else {
              setIsError(prevError => ({
                ...prevError,
                error: true,
                message: "Terjadi kesalahan: Gagal menyimpan data Materi."
              }));
            }
          })
          .catch(error => {
            console.error('Terjadi kesalahan:', error);
            setIsError(prevError => ({
              ...prevError,
              error: true,
              message: "Terjadi kesalahan: " + error.message
            }));
          })
          .finally(() => setIsLoading(false));
      });
    }
  };

  const fetchDataKategori = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const data = await UseFetch(API_LINK + "Program/GetKategoriKKById", { kategori });
        const mappedData = data.map(item => ({
          value: item.Key,
          label: item["Nama Kategori"],
          idKK: item.idKK,
          namaKK: item.namaKK
        }));
        return mappedData;
      } catch (error) {
        console.error("Error fetching kategori data:", error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsError({ error: false, message: '' });
      setIsLoading(true);
      try {
        const data = await fetchDataKategori();
        if (isMounted) {
          setListKategori(data);
        }
      } catch (error) {
        if (isMounted) {
          setIsError({ error: true, message: error.message });
          setListKategori([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [kategori]);
  useEffect(() => {
    if (AppContext_master.MateriForm && AppContext_master.MateriForm.current && Object.keys(AppContext_master.MateriForm.current).length > 0) {
      formDataRef.current = { ...formDataRef.current, ...AppContext_master.MateriForm.current };
    }

    if (AppContext_master.formSavedMateriFile === false) {
      setIsFileDisabled(false);
    }
  }, [AppContext_master.MateriForm,  AppContext_master.formSavedMateriFile]);
  // Render form
  const dataSimpan = AppContext_master.formSavedMateriFile; // Menyimpan nilai AppContext_master.formSavedMateri untuk menentukan apakah form harus di-disable atau tidak

  const handlePageChange = (content) => {
    onChangePage(content);
  };


  // if (isLoading) return <Loading />;


  return (
    <>
      {isError.error && (
        <div className="flex-fill">
          <Alert type="danger" message={isError.message} />
        </div>
      )}
      <style>
        {`
          .mce-notification {
            display: none !important;
          }
        `}
      </style>
      <div className="" style={{display:"flex", justifyContent:"space-between", marginTop:"100px", marginLeft:"70px", marginRight:"70px"}}>
            <div className="back-and-title" style={{display:"flex"}}>
              <button style={{backgroundColor:"transparent", border:"none"}} onClick={handleGoBack}><img src={BackPage} alt="" /></button>
                <h4 style={{ color:"#0A5EA8", fontWeight:"bold", fontSize:"30px", marginTop:"10px", marginLeft:"20px"}}>Edit Materi</h4>
              </div>
               
              </div>

      <form onSubmit={handleAdd} style={{margin:"20px 100px"}}>
          <div className="mb-4">
            <CustomStepper
          activeStep={1}
          steps={steps}
          onChangePage={handlePageChange}
          getStepContent={getStepContent}
        />
        </div>

        <div className="card mb-4">
          <div className="card-body p-4">
            <div className="row">
              <div className="">
                <FileUpload
                  ref={fileInputRef}
                  forInput="mat_file_pdf"
                  label="File Materi (.pdf, .docx, .xlsx, .pptx)"
                  formatFile=".pdf,.docx,.xlsx,.pptx,.mp4"
                  onChange={() =>
                    handlePdfChange(fileInputRef, "pdf,docx,xlsx,pptx")
                  }
                  errorMessage={errors.mat_file_pdf}
                  style={{width:"195%"}}
                />
                {AppContext_test.materiPdf && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none mt-0"
                    onClick={(e) => {
                      e.preventDefault(); 
                      previewFile(AppContext_test.materiPdf); 
                    }}
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>
              <div className="">
                <FileUpload
                  ref={vidioInputRef}
                  forInput="mat_file_video"
                  label="File Materi (.mp4, .mov)"
                  formatFile=".mp4,.mov"
                  maxFileSize={250}
                  onChange={() =>
                    handleVideoChange(vidioInputRef, "mp4,mov")
                  }
                  errorMessage={errors.mat_file_video}
                  // disabled={isFileDisabled || dataSimpan}
                  style={{width:"195%"}}
                />
                {AppContext_test.materiVideo && (
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.preventDefault(); 
                      previewFile(AppContext_test.materiVideo); 
                    }}
                     className="text-decoration-none mt-0"
                  >
                    Lihat berkas yang telah diunggah
                  </a>
                )}
              </div>

            </div>
          </div>
          <div className="d-flex justify-content-between my-4 mx-1 mt-0">
          {/* <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Kembali"
            onClick={() => onChangePage("index")}
          />
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Simpan"
            isDisabled={isFormDisabled || dataSaved}
          />
          <Button
            classType="dark ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("pretestAdd", AppContext_master.MateriForm = formDataRef, AppContext_master.count += 1)}
            // isDisabled={!isFormSubmitted}
          /> */}
            <div className="ml-4">
          <Button
            classType="outline-secondary me-2 px-4 py-2"
            label="Sebelumnya"
            onClick={() => onChangePage("pengenalanEdit", AppContext_master.MateriForm)}
          />
          </div>
          <div className="d-flex mr-4" >
          <Button
            classType="primary ms-2 px-4 py-2"
            type="submit"
            label="Edit"
            style={{marginRight:"10px"}}
          />
          <Button
            classType="primary ms-3 px-4 py-2"
            label="Berikutnya"
            onClick={() => onChangePage("forumEdit", AppContext_master.MateriForm, AppContext_master.count += 1, AppContext_test.DetailMateriEdit)}
          />
          </div>
        </div>
        </div>
      </form>
      {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
          pesan={isBackAction ? "Apakah anda ingin kembali?" : "Anda yakin ingin simpan data?"}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
        )}
    </>
  );
}

