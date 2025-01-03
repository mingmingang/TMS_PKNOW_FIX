import { useState, createContext, useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import KMS_Rightbar from "../../backbone/KMS_RightBar";
import KMS_Rightbar from "../../../part/RightBar"
import MasterTestIndex from "./Index";
import MasterTestPostTest from "./PostTest";
import MasterTestPreTest from "./PreTest";
import MasterTestPengerjaanTest from "./Test";
// import MasterTestHasilTest from "./HasilTest";
import MasterTestDetailTest from "./DetailTest";
import MasterTestForum from "./Forum";
import MasterTestMateriPDF from "./MateriPDF";
import MasterTestMateriVideo from "./MateriVideo";
import MasterTestPengenalan from "./Pengenalan";
import MasterSharing from "./SharingPDF";
// import AppContext_test from "./TestContext";
import MasterTestSharingPDF from "./SharingPDF";
import MasterTestSharingVideo from "./SharingVideo";

export default function MasterTest() {
  
  const [pageMode, setPageMode] = useState("index");
  const [marginRight, setMarginRight] = useState("40vh");
  const [isDataReady, setIsDataReady] = useState(false); 
  const [materiId, setMateriId] = useState("");
  const [durasi, setDurasi] = useState("");
  const [quizId, setQuizId] = useState("");
  const [quizType, setQuizType] = useState("");
  const [isOpen, setIsOpen] = useState();
  const [refreshKey, setRefreshKey] = useState(0);

  function handlePreTestClick_close() {
    setMarginRight("0vh");
  }

  function handlePreTestClick_open() {
    setMarginRight("40vh");
  }

  useEffect(() => {
    if (pageMode === "index" || pageMode === "pengerjaantest" || pageMode === "detailtest") {
      setMarginRight("0vh");
      setIsOpen(false);
    } else {
      setMarginRight("43vh");
      setIsOpen(true);
    }
  }, [pageMode]);

  function getPageMode() {
    const key = `${pageMode}-${refreshKey}`;
    switch (pageMode) {
      case "index":
        return (
          <MasterTestIndex 
            onChangePage={handleSetPageMode} 
            isOpen={isOpen}
          />
        );
      case "pengenalan":
        return (
          <MasterTestPengenalan
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "pretest":
        return (
          <MasterTestPreTest
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "posttest":
          return <MasterTestPostTest 
          onChangePage={handleSetPageMode}
          CheckDataReady={isDataReady}
          materiId={materiId}
          isOpen={isOpen}
           />;
     
      case "pengerjaantest":
        return <MasterTestPengerjaanTest 
          onChangePage={handleSetPageMode} 
          quizId={quizId}
          materiId={materiId}
          quizType={quizType}
          durasi={durasi}
        />;
      case "detailtest":
        return (
          <MasterTestDetailTest 
            onChangePage={handleSetPageMode} 
            quizType={quizType}
            materiId={materiId}
            quizId={quizId}
          />
        );
      // case "hasiltest":
      //   return (
      //     <MasterTestHasilTest
      //       onChangePage={handleSetPageMode}
      //       CheckDataReady={isDataReady}
      //       materiId={materiId}
      //     />
      //   );
      case "forum":
        return (
          <MasterTestForum 
            onChangePage={handleSetPageMode} 
            isOpen={isOpen}
          />
        );
      // case "materipdf":
      //   return <MasterTestMateriPDF onChangePage={handleSetPageMode} key={key}/>;
      // case "materivideo":
      //   return <MasterTestMateriVideo onChangePage={handleSetPageMode} key={key}/>;
      // case "sharing":
      //   return (
      //     <MasterSharing
      //       onChangePage={handleSetPageMode}
      //       CheckDataReady={isDataReady}
      //       materiId={materiId}
      //       isOpen={isOpen}
      //     />
      //   );
      case "materipdf":
        return (
          <MasterTestMateriPDF
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );

        case "materivideo":
          return (
            <MasterTestMateriVideo
              onChangePage={handleSetPageMode}
              CheckDataReady={isDataReady}
              materiId={materiId}
              isOpen={isOpen}
            />
          );

      case "sharingPDF":
        return (
          <MasterTestSharingPDF
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "sharingVideo":
        return (
          <MasterTestSharingVideo
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
        />
      );
    }
  }

  function handleSetPageMode(newPageMode, dataReady = false, key = "", isOpen = false, quizType = "") {
    setPageMode(newPageMode);
    setIsDataReady(dataReady);
    setMateriId(key);
    setIsOpen(isOpen);
    setQuizType(quizType);
  }

  function handleSetPageMode(newPageMode, quizType = "", key = "", quizKey = "", durasi = "") {
    setPageMode(newPageMode);
    setQuizType(quizType);
    setMateriId(key);
    setQuizId(quizKey);
    setDurasi(durasi)
  }

  return (
  <div style={{ marginRight: "0" }}>
    {/* <KMS_Rightbar
      handlePreTestClick_close={handlePreTestClick_close}
      handlePreTestClick_open={handlePreTestClick_open}
      isOpen={isOpen}
      onChangePage={handleSetPageMode}
      materiId={materiId}
      refreshKey={refreshKey}
      setRefreshKey={setRefreshKey}
    /> */}
    {getPageMode()}
  </div>
  );

}
