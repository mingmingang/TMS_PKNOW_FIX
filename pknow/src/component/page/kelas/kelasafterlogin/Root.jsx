import { useState } from "react";
import MasterKelas from "./Index";
import MasterTambahKelompokKeahlian from "../../master-pic-pknow/KelolaKK/TambahKK";
import MasterDetailKelas from "./DetailKelas";

export default function MasterPICPKNOW() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterKelas onChangePage={handleSetPageMode} />;
        case "add":
            return <MasterTambahKelompokKeahlian onChangePage={handleSetPageMode} />;
            case "detail":
        return (
          <MasterDetailKelas
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
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
