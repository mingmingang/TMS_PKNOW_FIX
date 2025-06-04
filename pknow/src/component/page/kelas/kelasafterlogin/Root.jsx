import MasterKelas from "./Index";
import MasterDetailKelas from "./DetailKelas";
import MasterTestPostTest from "./PostTest";
import MasterTestPreTest from "./PreTest";
import MasterTestPengerjaanTest from "./Test";
import MasterTestDetailTest from "./DetailTest";
import MasterTestForum from "./Forum";
import MasterTestMateriPDF from "./MateriPDF";
import MasterTestMateriVideo from "./MateriVideo";
import MasterTestPengenalan from "./Pengenalan";
import MasterTestSharingPDF from "./SharingPDF";
import MasterTestSharingVideo from "./SharingVideo";
import { useState, createContext, useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MasterBeliKelas from "./BeliKelas";

export default function MasterPICPKNOW() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();
   const [marginRight, setMarginRight] = useState("40vh");
  const [isDataReady, setIsDataReady] = useState(false); 
  const [materiId, setMateriId] = useState();
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
    switch (pageMode) {
      case "index":
        return <MasterKelas onChangePage={handleSetPageMode} />;
            case "detail":
        return (
          <MasterDetailKelas
            onChangePage={handleSetPageMode}
            withID={dataID}
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
         case "forum":
        return (
          <MasterTestForum 
            onChangePage={handleSetPageMode} 
            isOpen={isOpen}
          />
        );
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

      case "beli":
        return (
          <MasterBeliKelas
          onChangePage={handleSetPageMode}
            withID={dataID}
            />
        );
    }
  }
  
  // function handleSetPageMode(mode) {
  //   setPageMode(mode);
  // }

  // function handleSetPageMode(mode, withID) {
  //   setDataID(withID);
  //   setPageMode(mode);
  // }

   function handleSetPageMode(newPageMode, dataReady = false, key = "", isOpen = false, quizType = "", quizKey = "", durasi = "") {
    setPageMode(newPageMode);
    setIsDataReady(dataReady);
    setMateriId(key);
    setIsOpen(isOpen);
    setQuizType(dataReady);
    setQuizId(isOpen);
    setDurasi(durasi);
    setDataID(dataReady);
  }
  

  return <div>{getPageMode()}</div>;
}
