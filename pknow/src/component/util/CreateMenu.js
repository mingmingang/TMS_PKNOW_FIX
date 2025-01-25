import { ROOT_LINK, API_LINK, APPLICATION_ID } from "./Constants";
import UseFetch from "./UseFetch";

const CreateMenu = async (role) => {
  
  try {
    
    const data = await UseFetch(API_LINK + "Utilities/GetListMenu", {
      username: "",
      role: role,
      application: APPLICATION_ID,
    });
    
    let lastHeadkey = "";
    const transformedMenu = [
      {
        head: "Notifikasi",
        headkey: "notifikasi",
        link: ROOT_LINK + "/notifications",
        sub: [],
        isHidden: true,
      },
      {
        head: "Daftar",
        headkey: "daftar",
        link: ROOT_LINK + "/daftar",
        sub: [],
        isHidden: true,
      },
      {
        head: "Login",
        headkey: "login",
        link: ROOT_LINK + "/login",
        sub: [],
        isHidden: true,
      },
    ];

    // console.log("menu",data)

    data.forEach((item) => {
      if (item.parent === null || item.link === "#") {
        lastHeadkey = item.nama.toLowerCase().replace(/\s/g, "_");
        transformedMenu.push({
          head: item.nama,
          headkey: lastHeadkey,
          link: item.link === "#" ? item.link : ROOT_LINK + "/" + item.link,
          sub: [],
        });
      } else {
        const parent = transformedMenu.find(
          (item) => item.headkey === lastHeadkey
        );
        if (parent) {
          parent.sub.push({
            title: item.nama,
            link: ROOT_LINK + "/" + item.link,
          });
        }
      }
    });
    return transformedMenu;
  } catch  (error) {
    console.error("Error in CreateMenu:", error.message);
    console.error("Stack trace:", error.stack);
    return [];
  }
};

export default CreateMenu;
