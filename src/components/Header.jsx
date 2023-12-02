import React, { useEffect, useState } from "react";
import runIcon from "../images/icons/run.svg";
import whiteboard24Regular from "@iconify/icons-fluent/whiteboard-24-regular";
import { Tooltip, Avatar } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import ReactGA from "react-ga";

export default function Header({
  runCode,
  toggleModal,
  isAuthenticated,
  isInputBoxShown,
  setisInputBoxShown,
}) {
  const [toolTip, showToolTip] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [isUserPresent, setIsUserPresent] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      setUserInfo(user);
      if (user) {
        setIsUserPresent(true);
      } else setIsUserPresent(false);
    } catch (e) {
      setIsUserPresent(false);
    }
  }, []);

  const toggleInputBox = () => {
    ReactGA.event({
      category: `button.clicked`,
      action: `Input Box ${isInputBoxShown ? "Closed" : "Opened"}`,
    });
    setisInputBoxShown(!isInputBoxShown);
  };

  return (
    <div className=" bg-purple-standard flex py-2 px-4 justify-between items-center rounded-b-lg custom-shadow-medium">
      <div className="flex items-center">
        <div className="h-7 flex items-center font-medium text-xl codeFont text-orange-standard">
          <img className="h-full" src={"./logo.png"} alt="codeconnect logo" />
          <span className="ml-2">CodeConnect</span>
        </div>
      </div>
      <div className="flex items-center">
        <Tooltip label="Input/Output" hasArrow fontSize="md" bg="teal.600">
          <button className=" text-white mr-4" onClick={toggleInputBox}>
            <Icon
              icon="bi:input-cursor-text"
              className="text-orange-standard"
              height="24"
            />
          </button>
        </Tooltip>
        <Tooltip label="Whiteboard" hasArrow fontSize="md" bg="teal.600">
          <button className=" text-white mr-4" onClick={toggleModal}>
            <Icon
              icon={whiteboard24Regular}
              className="text-orange-standard"
              height="28"
            />
          </button>
        </Tooltip>
        <Tooltip label="Run Code" hasArrow fontSize="sm" bg="teal.600">
          <button
            onClick={runCode}
            className="bg-orange-standard flex items-center text-base font-medium rounded px-3 py-0.5 mr-2"
          >
            <img className="h-2.5" src={runIcon} alt="run code icon" />
            <span className="ml-2">Run</span>
          </button>
        </Tooltip>
        {/* {
          isAuthenticated ?
            <Logout /> :
            <Login />
        } */}
        {isUserPresent && (
          <Tooltip label={userInfo.email} hasArrow fontSize="sm" bg="teal.900">
            <Avatar size="sm" name={userInfo.name} src={userInfo.picture} />
          </Tooltip>
        )}
        <div className="mx-1 relative">
          {isAuthenticated && (
            <img
              onMouseEnter={() => {
                showToolTip(true);
              }}
              onMouseLeave={() => {
                showToolTip(false);
              }}
              className="h-7 w-7 rounded-full"
              src={userInfo.picture}
              alt="user icon"
            />
          )}
          {toolTip && isAuthenticated && (
            <div className="absolute z-50 top-full right-0 mt-2 text-center text-xs text-gray-200 bg-black mr-4 px-1">
              {userInfo.email}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
