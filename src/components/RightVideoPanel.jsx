import React, { useState } from "react";
import muteIcon from "../images/icons/mute.svg";
import videoIcon from "../images/icons/video.svg";
import phoneIcon from "../images/icons/phone.svg";
import { Tag } from "@chakra-ui/react";

export default function RightVideoPanel({ muteCam, muteMic }) {
  const [isMuteCam, setIsMuteCam] = useState(false);
  const [isMuteMic, setIsMuteMic] = useState(false);

  return (
    <div
      style={{ height: "calc(100vh - 47px)" }}
      className="overflow-hidden duration-300 bg-transparent px-2 pt-2 pb-3 flex flex-col items-center justify-start"
    >
      <div className="flex overflow-hidden custom-shadow-light h-full rounded-lg justify-start items-center flex-col bg-gradient-to-br from-purple-standard via-purple-dark to-theme-orange bg-opacity-100 relative pt-2 px-2 shadow-lg">
        <Tag size={"md"} variant="solid" w="full" colorScheme="#EE9B00">
          People in room
        </Tag>
        <div className="justify-between flex-col pt-2 pb-3">
          <div
            style={{ width: "200px" }}
            className="flex flex-col video-grid-height items-center overflow-y-auto justify-start"
            id="video-grid"
          ></div>
          <div className="flex items-center absolute backdrop-filter backdrop-blur left-0 bottom-0 pt-2 rounded-lg pb-4 w-full justify-around mt-2">
            <button
              onClick={() => {
                setIsMuteMic(!isMuteMic);
                muteMic();
              }}
              className={` ${
                isMuteMic ? "bg-theme-orange text-white" : " bg-theme-grey"
              } border transform duration-300 hover:shadow-2xl shadow-lg border-transparent rounded-full h-8 w-8 p-1.5`}
            >
              <img src={muteIcon} alt="mute icon" />
            </button>
            <button
              onClick={() => {
                setIsMuteCam(!isMuteCam);
                muteCam();
              }}
              className={`${
                isMuteCam ? "bg-theme-orange text-white" : " bg-theme-grey"
              } border transform duration-300 hover:shadow-2xl shadow-lg border-transparent rounded-full h-8 w-8 p-1.5`}
            >
              <img src={videoIcon} alt="video icon" />
            </button>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className=" bg-red-600 border border-transparent shadow-2xl rounded-full h-8 w-8 p-1.5"
            >
              <img src={phoneIcon} alt="phone icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
