import { useState } from "react";
import MasterKelasKu from "./Index";
// import MasterKataSandi from "./KataSandi";
// import MasterLihatKelompokKeahlianDraft from "./LihatKKDraft";
// import MasterEditKelompokKeahlian from "./EditKK";
// import MasterLihatKelompokKeahlianPublish from "./LihatKKPublish";

export default function Root() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterKelasKu onChangePage={handleSetPageMode} />;
    //   case "katasandi":
    //     return <MasterKataSandi onChangePage={handleSetPageMode} />;
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
