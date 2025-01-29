import { useState, useEffect } from "react";
import MasterProfile from "./Index";
import MasterKataSandi from "./KataSandi";
// import MasterLihatKelompokKeahlianDraft from "./LihatKKDraft";
// import MasterEditKelompokKeahlian from "./EditKK";
// import MasterLihatKelompokKeahlianPublish from "./LihatKKPublish";

export default function Dashboard() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  useEffect(() => {
    // Cek apakah ada redirect dari localStorage
    const redirectTo = localStorage.getItem("redirectTo");
    if (redirectTo) {
      setPageMode(redirectTo); // Pindah ke halaman yang diinginkan
      localStorage.removeItem("redirectTo"); // Hapus setelah digunakan
    }
  }, []);

function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterProfile onChangePage={handleSetPageMode} />;
      case "katasandi":
        return <MasterKataSandi onChangePage={handleSetPageMode} />;
      //   case "detailDraft":
      //     return (
      //       <MasterLihatKelompokKeahlianDraft onChangePage={handleSetPageMode} withID={dataID} />
      //     );
      //   case "detailPublish":
      //     return (
      //       <MasterLihatKelompokKeahlianPublish onChangePage={handleSetPageMode} withID={dataID} />
      //     );
      // case "edit":
      //   return (
      //     <MasterEditKelompokKeahlian
      //       onChangePage={handleSetPageMode}
      //       withID={dataID}
      //     />
      //   );
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
