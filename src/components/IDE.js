import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import ReactGA from "react-ga";
import Peer from "peerjs";
import closeIcon from "../images/icons/close.png";
import { Icon } from "@iconify/react";
import eraser24Filled from "@iconify/icons-fluent/eraser-24-filled";
import penFill from "@iconify/icons-bi/pen-fill";
import "react-circular-progressbar/dist/styles.css";
import RightVideoPanel from "./RightVideoPanel";
import CodeEditor from "./CodeEditor";

export default function IDE({
  docId,
  modal,
  toggleModal,
  selected,
  setSelected,
  textEditor,
  setTextEditor,
  processing,
  percentageStage,
  isInputBoxShown,
  code,
  setCode,
}) {
  const [socket, setSocket] = useState(null);

  const [peer, setPeer] = useState(null);
  const userName = "smit";
  const videoGrid = document.getElementById("video-grid");
  const myVideo = document.createElement("video");
  const myVideoCont = document.createElement("div");
  myVideoCont.appendChild(myVideo);
  myVideoCont.className = "videoContainer rounded mb-4";
  myVideo.muted = true;
  const [myStream, setMystream] = useState(null);
  const peers = {};
  const colorsRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [myvideoon, setMyvideoon] = useState(true);
  const [pencilColor, setPencilColor] = useState("#000000");

  useEffect(() => {
    ReactGA.pageview("IDE-screen");
    var TempSocket = io(process.env.REACT_APP_BACKEND_ENDPOINT_URL);
    setSocket(TempSocket);
    const peer = new Peer(undefined, {
      host: process.env.REACT_APP_BACKEND_ENDPOINT,
      port: 443,
      path: "/",
    });
    setPeer(peer);

    return () => {
      TempSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null) return;
    socket.emit("get-document", docId);
    socket.once("load-document", (data) => {
      setCode({ ...code, ...data });
    });
    // eslint-disable-next-line
  }, [socket, docId]);

  useEffect(() => {
    if (socket === null) return;
    var updateC = (delta) => {
      setCode({ ...code, ...delta });
    };
    socket.on("receive-changes", updateC);
    return () => {
      socket.off("receive-changes", updateC);
    };
    // eslint-disable-next-line
  }, [socket, code]);

  useEffect(() => {
    if (socket === null) return;

    var savetodb = setTimeout(() => {
      socket.emit("save-document", code);
      socket.emit("changes", code);
    }, 2000);
    var updateC = (delta) => {
      setCode({ ...code, ...delta });
    };
    socket.on("receive-changes", updateC);
    return () => {
      socket.off("receive-changes", updateC);
      clearTimeout(savetodb);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, code]);

  function addVideoStream(videoCont, video, stream) {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoGrid.append(videoCont);
  }

  useEffect(() => {
    if (socket == null) return;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        addVideoStream(myVideoCont, myVideo, stream);
        setMyvideoon(true);
        setMystream(stream);
        peer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          const videoCont = document.createElement("div");
          videoCont.appendChild(video);
          videoCont.id = call.peer;
          videoCont.dataset.name = call.metadata.name;
          videoCont.className = "videoContainer rounded mb-4";
          call.on("stream", (anotherUserVideoStream) => {
            addVideoStream(videoCont, video, anotherUserVideoStream);
          });

          call.on("close", () => {
            video.remove();
            videoCont.remove();
          });
          peers[call.peer] = call;
        });

        socket.on("user-connected", (userId) => {
          const call = peer.call(userId, stream, {
            metadata: { name: userName },
          });
          const video = document.createElement("video");
          const videoCont = document.createElement("div");
          videoCont.appendChild(video);
          videoCont.id = userId;
          videoCont.dataset.name = call.metadata.name;
          videoCont.className = "videoContainer rounded mb-4";
          call.on("stream", (anotherUserVideoStream) => {
            addVideoStream(videoCont, video, anotherUserVideoStream);
          });

          call.on("close", () => {
            video.remove();
            videoCont.remove();
          });
          peers[userId] = call;
        });
      });

    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
    });

    peer.on("open", (id) => {
      setUserId(id);
      myVideoCont.id = id;
      myVideoCont.dataset.name = userName;
      socket.emit("join-room", docId, id);
    });
    // eslint-disable-next-line
  }, [socket, docId, peer]);

  const addVideo = useCallback(() => {
    if (socket == null) return;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        addVideoStream(myVideoCont, myVideo, stream);
        setMyvideoon(true);
        setMystream(stream);
        replaceStream(stream);
        peer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          const videoCont = document.createElement("div");
          videoCont.className = "videoContainer rounded mb-4";
          videoCont.appendChild(video);
          videoCont.id = call.peer;
          videoCont.dataset.name = call.metadata.name;
          call.on("stream", (anotherUserVideoStream) => {
            addVideoStream(videoCont, video, anotherUserVideoStream);
          });

          call.on("close", () => {
            video.remove();
            videoCont.remove();
          });
          peers[call.peer] = call;
        });

        socket.on("user-connected", (userId) => {
          const call = peer.call(userId, stream, {
            metadata: { name: userName },
          });
          const video = document.createElement("video");
          const videoCont = document.createElement("div");
          videoCont.className = "videoContainer rounded mb-4";
          videoCont.appendChild(video);
          videoCont.id = userId;
          videoCont.dataset.name = call.metadata.name;
          call.on("stream", (anotherUserVideoStream) => {
            addVideoStream(videoCont, video, anotherUserVideoStream);
          });

          call.on("close", () => {
            video.remove();
            videoCont.remove();
          });
          peers[userId] = call;
        });
      });

    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
    });

    peer.on("open", (id) => {
      setUserId(id);
      myVideoCont.id = id;
      myVideoCont.dataset.name = userName;

      socket.emit("join-room", docId, id);
    });
    // eslint-disable-next-line
  }, [socket, docId, peer]);

  const muteMic = () => {
    myStream.getAudioTracks()[0].enabled =
      !myStream.getAudioTracks()[0].enabled;
    const toggledVideo = document.getElementById(userId);
    if (myStream.getAudioTracks()[0].enabled) {
      toggledVideo.classList.remove("audio-off");
    } else {
      toggledVideo.classList.add("audio-off");
    }
    socket.emit(
      "toggled",
      userId,
      myStream.getVideoTracks()[0].enabled,
      myStream.getAudioTracks()[0].enabled
    );
  };

  const muteCam = () => {
    if (socket === null) return;
    if (myStream && myvideoon) {
      myStream.getVideoTracks().forEach((track) => {
        if (track.kind === "video") {
          track.stop();
        }
      });
      // console.log(myStream.getVideoTracks()[0].enabled);
      setMyvideoon(false);
    } else {
      addVideo();
      setMyvideoon(true);
    }
    myStream.getVideoTracks()[0].enabled =
      !myStream.getVideoTracks()[0].enabled;
    try {
      const toggledVideo = document.getElementById(userId);
      if (myStream.getVideoTracks()[0].enabled) {
        toggledVideo.classList.remove("video-off");
      } else {
        toggledVideo.classList.add("video-off");
      }
    } catch (err) {
      console.log(err);
    }

    // // toggle webcam tracks
    socket.emit(
      "toggled",
      userId,
      myStream.getVideoTracks()[0].enabled,
      myStream.getAudioTracks()[0].enabled
    );
  };

  const replaceStream = (mediaStream) => {
    Object.values(peers).forEach((peer) => {
      peer.peerConnection?.getSenders().forEach((sender) => {
        if (sender.track.kind === "audio") {
          if (mediaStream.getAudioTracks().length > 0) {
            sender.replaceTrack(mediaStream.getAudioTracks()[0]);
          }
        }
        if (sender.track.kind === "video") {
          if (mediaStream.getVideoTracks().length > 0) {
            sender.replaceTrack(mediaStream.getVideoTracks()[0]);
          }
        }
      });
    });
  };

  useEffect(() => {
    if (socket === null) return;
    socket.on("received-toggled-events", (userId, video, audio) => {
      try {
        const toggledVideo = document.getElementById(userId);

        if (video) {
          toggledVideo.classList.remove("video-off");
        } else {
          toggledVideo.classList.add("video-off");
        }

        if (audio) {
          toggledVideo.classList.remove("audio-off");
        } else {
          toggledVideo.classList.add("audio-off");
        }
      } catch (err) {
        console.log(err);
      }
    });
  }, [socket]);

  useEffect(() => {
    if (socket === null || colorsRef === null) return;
    const canvas = document.getElementById("whiteboard-canvas");
    const context = canvas.getContext("2d");
    const colorPicker = document.getElementById("pencil-color-picker");

    const colors = document.getElementsByClassName("color");
    // console.log(colors, 'the colors');
    // console.log(test);
    const current = {
      color: "#000000",
      width: 5,
    };

    const onColorUpdate = (e) => {
      let objectColor;
      for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].dataset.color) {
          if (e.path[i].dataset.color === "white") objectColor = "#ffffff";
          else objectColor = pencilColor;
          break;
        }
      }
      current.color = objectColor;
      if (current.color !== "#ffffff") current.width = 5;
      else current.width = 25;
    };

    const onPencilColorChange = (e) => {
      setPencilColor(e.target.value);
      current.color = e.target.value;
      if (current.color !== "#ffffff") current.width = 5;
      else current.width = 25;
    };

    for (let i = 0; i < colors.length; i++) {
      colors[i].removeEventListener("click", onColorUpdate);
      colorPicker.removeEventListener("change", onPencilColorChange);
      colors[i].addEventListener("click", onColorUpdate, false);
      colorPicker.addEventListener("change", onPencilColorChange, false);
    }
    let drawing = false;

    const drawLine = (x0, y0, x1, y1, color, width, emit) => {
      context.beginPath();
      context.strokeStyle = color;
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      console.log(color);
      console.log(context.strokeStyle);
      context.lineWidth = width;
      context.stroke();
      context.closePath();

      if (!emit) {
        return;
      }
      const w = canvas.width;
      const h = canvas.height;
      // console.log(w, h, window.width, window.height);

      setPencilColor(current.color);

      socket.emit("drawing", {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: current.color,
        width,
      });
    };

    const onMouseDown = (e) => {
      // console.log(drawing + ' d');
      drawing = true;
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseMove = (e) => {
      if (!drawing) {
        return;
      }
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        current.width,
        true
      );
      current.x = e.clientX || e.touches[0].clientX;
      current.y = e.clientY || e.touches[0].clientY;
    };

    const onMouseUp = (e) => {
      if (!drawing) {
        return;
      }
      drawing = false;
      drawLine(
        current.x,
        current.y,
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY,
        current.color,
        current.width,
        true
      );
    };
    const throttle = (callback, delay) => {
      let previousCall = new Date().getTime();
      return function () {
        const time = new Date().getTime();

        if (time - previousCall >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    };

    canvas.addEventListener("mousedown", onMouseDown, false);
    canvas.addEventListener("mouseup", onMouseUp, false);
    canvas.addEventListener("mouseout", onMouseUp, false);
    canvas.addEventListener("mousemove", throttle(onMouseMove, 10), false);

    canvas.addEventListener("touchstart", onMouseDown, false);
    canvas.addEventListener("touchend", onMouseUp, false);
    canvas.addEventListener("touchcancel", onMouseUp, false);
    canvas.addEventListener("touchmove", throttle(onMouseMove, 10), false);

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", onResize, false);
    onResize();
    const onDrawingEvent = (data) => {
      const w = canvas.width;
      const h = canvas.height;
      console.log(data.color);
      drawLine(
        data.x0 * w,
        data.y0 * h,
        data.x1 * w,
        data.y1 * h,
        data.color,
        data.width
      );
    };
    socket.on("drawing", onDrawingEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <>
      <div className="flex">
        <div className="h-screen flex flex-grow flex-col">
          <div className="flex-grow flex">
            <CodeEditor
              socket={socket}
              selected={selected}
              setSelected={setSelected}
              textEditor={textEditor}
              setTextEditor={setTextEditor}
              processing={processing}
              percentageStage={percentageStage}
              isInputBoxShown={isInputBoxShown}
              code={code}
              setCode={setCode}
            />
            <div
              className={`flex-grow ${
                modal ? "top-0" : " top-full"
              } duration-300 left-0 p-4 backdrop-filter backdrop-blur-sm absolute z-50 w-screen h-screen`}
            >
              <div
                ref={colorsRef}
                className="colors absolute flex select-none left-10 top-10"
              >
                <Icon
                  icon={penFill}
                  data-color="black"
                  className="block cursor-pointer color black text-orange-standard"
                  height="28"
                />
                <Icon
                  icon={eraser24Filled}
                  data-color="white"
                  className="block cursor-pointer color white ml-4"
                  height="30"
                />
                {/* color picker input element */}
                <input type="color" className="" id="pencil-color-picker" />
              </div>
              <div className="absolute right-10 select-none top-10">
                <img
                  onClick={toggleModal}
                  src={closeIcon}
                  className="w-6 cursor-pointer"
                  alt="close icon"
                />
              </div>

              <canvas
                id="whiteboard-canvas"
                style={{ height: "90%" }}
                className="m-0 border w-full bg-white rounded-xl border-black"
              />
            </div>
            <RightVideoPanel muteCam={muteCam} muteMic={muteMic} />
          </div>
        </div>
      </div>
    </>
  );
}

// function SidePanel() {
//   return (
//     <div className="bg-purple-dark text-orange-standard w-20">
//       <span>Share Room ID</span>
//       <br />
//       <span>Join Room</span>
//       <br />
//       <span>Download</span>
//       <br />
//     </div>
//   )
// }

// function ShareRoomID() {
//   const currentURL = window.location.href;
//   return (
//     <div className="bg-orange-standard text-purple-dark p-5">
//       Share
//       <div className="my-5 text-purple-dark">
//         <span className="bg-grey-standard w-min rounded-l px-3 py-1 align-middle">
//           {currentURL}
//         </span>
//         <span onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-grey-standard bg-opacity-50 w-min px-3 py-1 rounded-r align-middle">
//           Copy
//         </span>
//       </div>
//       <div className="text-purple-dark">
//         NOTE: Anyone with the link can join & edit the code
//       </div>
//     </div>
//   )
// }

// function JoinRoom() {
//   const [input, setInput] = useState('');
//   return (
//     <div className="bg-orange-standard text-purple-dark p-5">
//       Join
//       <div className="my-5 text-purple-dark">
//         <input type="text" value={input} onInput={e => setInput(e.target.value)} className="bg-grey-standard w-min rounded-l px-3 py-1 align-middle outline-none border-none" />
//         <button className="bg-grey-standard bg-opacity-50 w-min px-3 py-1 rounded-r align-middle">
//           <a href={input}>Join</a>
//         </button>
//       </div>
//       <div className="text-purple-dark">
//         NOTE: Make sure you are entering correct URL
//       </div>
//     </div>
//   )
// }
