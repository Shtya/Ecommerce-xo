"use client";
import CateNavbar from "./cateNavbar";
// import LangNavbar from "./langNavbar";
import SearchNavbar from "./searchNavbar";

export default function Navbar() {
  return (
    <div className=" ">
   
      <div className="bg-white/80 fixed top-0 start-0 end-0 w-full z-50  ">
           {/* <LangNavbar /> */}
        <SearchNavbar />
        <CateNavbar />
      </div>
    </div>
  );
}
