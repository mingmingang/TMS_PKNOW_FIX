import { useState } from "react";
import MasterKelas from "./Index";

export default function MasterPICPKNOW() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterKelas onChangePage={handleSetPageMode} />;
    }
  }
  
  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
