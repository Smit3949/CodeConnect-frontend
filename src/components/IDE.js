import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import ReactGA from 'react-ga';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import Peer from 'peerjs';
import closeIcon from '../images/icons/close.png';
import muteIcon from '../images/icons/mute.svg';
import videoIcon from '../images/icons/video.svg';
import phoneIcon from '../images/icons/phone.svg';
import { Icon } from '@iconify/react';
import eraser24Filled from '@iconify/icons-fluent/eraser-24-filled';
import penFill from '@iconify/icons-bi/pen-fill';
import { Tabs, TabList, TabPanels, Tab, TabPanel, Skeleton, Progress, Tag } from "@chakra-ui/react"
import 'react-circular-progressbar/dist/styles.css';


export default function IDE({ docId, modal, toggleModal, python, setpython, input, setInput, selected, setSelected, output, textEditor, setTextEditor, processing, percentageStage, isInputBoxShown }) {
    const [socket, setSocket] = useState(null);
    const [cpp, setcpp] = useState('');
    const [java, setjava] = useState('');
    const [peer, setPeer] = useState(null);
    const userName = 'smit'
    const videoGrid = document.getElementById('video-grid');
    const myVideo = document.createElement('video');
    const myVideoCont = document.createElement('div');
    myVideoCont.appendChild(myVideo);
    myVideoCont.className = "videoContainer rounded mb-4"
    myVideo.muted = true;
    const [myStream, setMystream] = useState(null);
    const peers = {};
    const colorsRef = useRef(null);
    const [userId, setUserId] = useState(null);
    const [myvideoon, setMyvideoon] = useState(true);


    useEffect(() => {
        ReactGA.pageview('IDE-screen');
        var TempSocket = io(process.env.REACT_APP_BACKEND_ENDPOINT_URL);
        setSocket(TempSocket);
        const peer = new Peer(undefined, {
            host: process.env.REACT_APP_BACKEND_ENDPOINT,
            port: 443,
            path: '/'
        });
        setPeer(peer);

        return () => {
            TempSocket.disconnect();
        };
    }, []);


    useEffect(() => {
        if (socket == null) return;
        socket.emit('get-document', docId);
        socket.once('load-document', (data) => {
            setcpp(data.cpp);
            setjava(data.java);
            setpython(data.python);
        });
        // eslint-disable-next-line
    }, [socket, docId]);


    useEffect(() => {
        if (socket === null) return;
        var updateC = (delta) => {
            setpython(delta.python);
            setjava(delta.java);
            setcpp(delta.cpp);
            setcpp(delta.cpp);
            setcpp(delta.cpp);
        }
        socket.on('receive-changes', updateC);
        return () => {
            socket.off('receive-changes', updateC);
        }
        // eslint-disable-next-line
    }, [socket, cpp, java, python]);

    useEffect(() => {
        if (socket === null) return;
        var data = {
            'cpp': cpp,
            'java': java,
            'python': python
        };

        var savetodb = setTimeout(() => { socket.emit('save-document', data); socket.emit('changes', data); }, 2000);

        return () => {
            clearTimeout(savetodb);
        };

    }, [socket, cpp, java, python]);


    function addVideoStream(videoCont, video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        })
        videoGrid.append(videoCont);
    };

    useEffect(() => {
        if (socket == null) return;

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            addVideoStream(myVideoCont, myVideo, stream);
            setMyvideoon(true);
            setMystream(stream);
            peer.on('call', call => {
                call.answer(stream);
                const video = document.createElement('video');
                const videoCont = document.createElement('div');
                videoCont.appendChild(video);
                videoCont.id = call.peer;
                videoCont.dataset.name = call.metadata.name;
                videoCont.className = "videoContainer rounded mb-4";
                call.on('stream', (anotherUserVideoStream) => {
                    addVideoStream(videoCont, video, anotherUserVideoStream);
                });

                call.on('close', () => {
                    video.remove();
                    videoCont.remove();
                });
                peers[call.peer] = call;
            });

            socket.on('user-connected', (userId) => {
                const call = peer.call(userId, stream, { metadata: { name: userName } });
                const video = document.createElement('video')
                const videoCont = document.createElement('div');
                videoCont.appendChild(video);
                videoCont.id = userId;
                videoCont.dataset.name = call.metadata.name;
                videoCont.className = "videoContainer rounded mb-4";
                call.on('stream', (anotherUserVideoStream) => {
                    addVideoStream(videoCont, video, anotherUserVideoStream);
                });

                call.on('close', () => {
                    video.remove();
                    videoCont.remove();
                });
                peers[userId] = call;
            });


        });

        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close();
        });

        peer.on('open', (id) => {
            setUserId(id);
            myVideoCont.id = id;
            myVideoCont.dataset.name = userName;
            socket.emit('join-room', docId, id);
        });
        // eslint-disable-next-line
    }, [socket, docId, peer]);

    const addVideo = useCallback(() => {
        if (socket == null) return;

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            addVideoStream(myVideoCont, myVideo, stream);
            setMyvideoon(true);
            setMystream(stream);
            replaceStream(stream);
            peer.on('call', call => {
                call.answer(stream);
                const video = document.createElement('video');
                const videoCont = document.createElement('div');
                videoCont.className = "videoContainer rounded mb-4"
                videoCont.appendChild(video);
                videoCont.id = call.peer;
                videoCont.dataset.name = call.metadata.name;
                call.on('stream', (anotherUserVideoStream) => {
                    addVideoStream(videoCont, video, anotherUserVideoStream);
                });

                call.on('close', () => {
                    video.remove();
                    videoCont.remove();
                });
                peers[call.peer] = call;
            });

            socket.on('user-connected', (userId) => {
                const call = peer.call(userId, stream, { metadata: { name: userName } });
                const video = document.createElement('video')
                const videoCont = document.createElement('div');
                videoCont.className = "videoContainer rounded mb-4"
                videoCont.appendChild(video);
                videoCont.id = userId;
                videoCont.dataset.name = call.metadata.name;
                call.on('stream', (anotherUserVideoStream) => {
                    addVideoStream(videoCont, video, anotherUserVideoStream);
                });

                call.on('close', () => {
                    video.remove();
                    videoCont.remove();
                });
                peers[userId] = call;
            });


        });

        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close();
        });

        peer.on('open', (id) => {
            setUserId(id);
            myVideoCont.id = id;
            myVideoCont.dataset.name = userName;

            socket.emit('join-room', docId, id);
        });
        // eslint-disable-next-line
    }, [socket, docId, peer]);



    const muteMic = () => {
        myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
        const toggledVideo = document.getElementById(userId);
        if (myStream.getAudioTracks()[0].enabled) {
            toggledVideo.classList.remove("audio-off");
        }
        else {
            toggledVideo.classList.add("audio-off");
        }
        socket.emit('toggled', userId, myStream.getVideoTracks()[0].enabled, myStream.getAudioTracks()[0].enabled);
    }

    const muteCam = () => {

        if (socket === null) return;
        if (myStream && myvideoon) {
            myStream.getVideoTracks().forEach((track) => {
                if (track.kind === 'video') {
                    track.stop();
                }
            });
            // console.log(myStream.getVideoTracks()[0].enabled);
            setMyvideoon(false);
        }
        else {
            addVideo();
            setMyvideoon(true);
        }
        myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
        try {
            const toggledVideo = document.getElementById(userId);
            if (myStream.getVideoTracks()[0].enabled) {
                toggledVideo.classList.remove("video-off");
            }
            else {
                toggledVideo.classList.add("video-off");
            }
        }
        catch (err) {
            console.log(err);
        }


        // // toggle webcam tracks
        socket.emit('toggled', userId, myStream.getVideoTracks()[0].enabled, myStream.getAudioTracks()[0].enabled);
    }


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
        })
    }

    useEffect(() => {
        if (socket === null) return;
        socket.on('received-toggled-events', (userId, video, audio) => {
            try {
                const toggledVideo = document.getElementById(userId);

                if (video) {
                    toggledVideo.classList.remove("video-off");
                }
                else {
                    toggledVideo.classList.add("video-off");
                }

                if (audio) {
                    toggledVideo.classList.remove("audio-off");
                }
                else {
                    toggledVideo.classList.add("audio-off");
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }, [socket])


    useEffect(() => {


        if (socket === null || colorsRef === null) return;
        const canvas = document.getElementById('whiteboard-canvas')
        const context = canvas.getContext('2d');

        const colors = document.getElementsByClassName('color');
        // console.log(colors, 'the colors');
        // console.log(test);
        const current = {
            color: 'black',
            width: 5,
        };

        const onColorUpdate = (e) => {
            let objectColor;
            for (let i = 0; i < e.path.length; i++) {
                if (e.path[i].dataset.color) {
                    objectColor = e.path[i].dataset.color;
                    break;
                }
            }
            current.color = objectColor;
            if (current.color === 'black') current.width = 5;
            else current.width = 25;
        };

        for (let i = 0; i < colors.length; i++) {
            colors[i].addEventListener('click', onColorUpdate, false);
        }
        let drawing = false;


        const drawLine = (x0, y0, x1, y1, color, width, emit) => {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.strokeStyle = color;
            context.lineWidth = width;
            context.stroke();
            context.closePath();

            if (!emit) { return; }
            const w = canvas.width;
            const h = canvas.height;
            // console.log(w, h, window.width, window.height);


            socket.emit('drawing', {
                x0: x0 / w,
                y0: y0 / h,
                x1: x1 / w,
                y1: y1 / h,
                color,
                width
            });
        };



        const onMouseDown = (e) => {

            // console.log(drawing + ' d');
            drawing = true;
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        };

        const onMouseMove = (e) => {
            if (!drawing) { return; }
            drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.width, true);
            current.x = e.clientX || e.touches[0].clientX;
            current.y = e.clientY || e.touches[0].clientY;
        };

        const onMouseUp = (e) => {

            if (!drawing) { return; }
            drawing = false;
            drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, current.width, true);
        };
        const throttle = (callback, delay) => {
            let previousCall = new Date().getTime();
            return function () {
                const time = new Date().getTime();

                if ((time - previousCall) >= delay) {
                    previousCall = time;
                    callback.apply(null, arguments);
                }
            };
        };


        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('mouseout', onMouseUp, false);
        canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

        canvas.addEventListener('touchstart', onMouseDown, false);
        canvas.addEventListener('touchend', onMouseUp, false);
        canvas.addEventListener('touchcancel', onMouseUp, false);
        canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);


        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', onResize, false);
        onResize();
        const onDrawingEvent = (data) => {
            const w = canvas.width;
            const h = canvas.height;
            drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.width);
        }
        socket.on('drawing', onDrawingEvent);
    }, [socket]);


    const handleInputFileChange = () => {
        const input = document.getElementById('input-file-upload');
        input.click();
    };

    const handleFileDataChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const textData = e.target.result;
            setInput(textData);
        }
        reader.readAsText(file);
    }

    return (
        <>
            <div className="flex">
                <div className="h-screen flex flex-grow flex-col">
                    <div className="flex-grow flex">
                        <div id="editor" className="flex-grow relative flex flex-col">
                            <FileTabs />
                            <div className="flex duration-500 relative overflow-y-auto px-2 pt-2 pb-4" style={isInputBoxShown ? { height: "94%", maxHeight: "calc(100vh - 10px)" } : { height: "calc(100vh - 310px)" }}>
                                <div className=" w-full custom-shadow h-full rounded-xl overflow-hidden">
                                    {
                                        selected === 'CPP' &&
                                        <section className="playground">
                                            <div className="code-editor-java flex flex-col h-full mb-5 java-code">
                                                <div className="editor-header">
                                                    <LanguageSelector language={selected.toLowerCase()} setLanguage={setSelected} />
                                                </div>
                                                <CodeMirror
                                                    value={cpp}
                                                    className="flex-grow text-base"
                                                    options={{
                                                        mode: "text/x-csrc",
                                                        theme: 'material',
                                                        lineNumbers: true,
                                                        scrollbarStyle: null,
                                                        lineWrapping: true,
                                                    }}
                                                    onBeforeChange={(editor, data, cpp) => {
                                                        setcpp(cpp);
                                                    }}
                                                />
                                            </div>
                                        </section>
                                    }
                                    {
                                        selected === 'JAVA' &&
                                        <section className="playground">
                                            <div className="code-editor-java flex flex-col h-full mb-5 java-code">
                                                <div className="editor-header">
                                                    <LanguageSelector language={selected.toLowerCase()} setLanguage={setSelected} />
                                                </div>
                                                <CodeMirror
                                                    value={java}
                                                    className="flex-grow text-base"
                                                    options={{
                                                        mode: "text/x-java",
                                                        theme: 'material',
                                                        lineNumbers: true,
                                                        scrollbarStyle: null,
                                                        lineWrapping: true,
                                                    }}
                                                    onBeforeChange={(editor, data, java) => {
                                                        setjava(java);
                                                    }}
                                                />
                                            </div>
                                        </section>
                                    }
                                    {
                                        selected === 'PYTHON' &&
                                        <section className="playground">
                                            <div className="code-editor-java flex flex-col h-full mb-5 java-code">
                                                <div className="editor-header">
                                                    <LanguageSelector language={selected.toLowerCase()} setLanguage={setSelected} />
                                                </div>
                                                <CodeMirror
                                                    value={python}
                                                    className="flex-grow text-base"
                                                    options={{
                                                        mode: "python",
                                                        theme: 'material',
                                                        lineNumbers: true,
                                                        scrollbarStyle: null,
                                                        lineWrapping: true,
                                                    }}
                                                    onBeforeChange={(editor, data, python) => {
                                                        setpython(python);
                                                    }}
                                                />
                                            </div>
                                        </section>
                                    }
                                </div>
                            </div>
                            <div className={`flex-grow ${modal ? "top-0" : " top-full"} duration-300 left-0 p-4 backdrop-filter backdrop-blur-sm absolute z-50 w-screen h-screen`}>
                                <div ref={colorsRef} className="colors absolute flex select-none left-10 top-10">
                                    <Icon icon={penFill} data-color="black" className="block cursor-pointer color black text-orange-standard" height="28" />
                                    <Icon icon={eraser24Filled} data-color="white" className="block cursor-pointer color white ml-4" height="30" />
                                </div>
                                <div className="absolute right-10 select-none top-10">
                                    <img onClick={toggleModal} src={closeIcon} className="w-6 cursor-pointer" alt="close icon" />
                                </div>

                                <canvas id="whiteboard-canvas" style={{ height: "90%" }} className="m-0 border w-full bg-white rounded-xl border-black" />
                            </div>
                            <div className={`${isInputBoxShown ? "absolute w-full bottom-0 left-0 transform translate-y-full" : ""} duration-500`}>
                                <div className="shadow-lg border-2 border-opacity-50 border-theme-teal-dark mx-2 rounded-xl">
                                    <Tabs index={textEditor === "input" ? 0 : 1} isFitted variant="line" colorScheme="#224f5c50">
                                        <TabList>
                                            <Tab onClick={() => {
                                                setTextEditor("input");
                                            }} className=" font-semibold ">Input</Tab>
                                            <Tab onClick={() => {
                                                setTextEditor("output");
                                            }} className=" font-semibold ">Output</Tab>
                                        </TabList>
                                        <TabPanels>
                                            <TabPanel paddingX="2" paddingBottom="2" paddingTop="0" >
                                                <textarea className="  rounded-md outline-none w-full h-full p-4 resize-none" placeholder="enter an input..." onChange={(e) => { setInput(e.target.value) }} value={input} rows="4" cols="50">
                                                </textarea>
                                            </TabPanel>
                                            <TabPanel paddingX="0" paddingY="0" className="relative" >
                                                {processing && <Progress colorScheme="teal" size="sm" value={percentageStage} className="mb-1" />}
                                                <Skeleton isLoaded={!processing} className="rounded-xl px-2">
                                                    <textarea className={` ${processing ? "transform animate-pulse" : ""} rounded-md outline-none w-full h-full pt-4 pb-6 px-6 resize-none`} readOnly placeholder="output will be shown here" value={output} rows="4" cols="50">
                                                    </textarea>
                                                </Skeleton>
                                            </TabPanel>
                                        </TabPanels>
                                    </Tabs>
                                </div>
                                <input accept="text/plain" type="file" onChange={handleFileDataChange} className="hidden" id="input-file-upload" />
                                <div onClick={handleInputFileChange} className="mt-4 text-theme-teal-dark font-semibold w-full text-center cursor-pointer"><span className="hover:opacity-70">... or upload an file</span></div>

                            </div>
                        </div>
                        <RightVideoPanel muteCam={muteCam} muteMic={muteMic} />
                    </div>
                </div>
            </div>
        </>
    )
}



function RightVideoPanel({ muteCam, muteMic }) {

    const [isMuteCam, setIsMuteCam] = useState(false)
    const [isMuteMic, setIsMuteMic] = useState(false)

    return (
        <div style={{ height: "calc(100vh - 47px)" }} className="overflow-hidden duration-300 bg-transparent px-2 pt-2 pb-3 flex flex-col items-center justify-start">
            <div className="flex overflow-hidden custom-shadow-light h-full rounded-lg justify-start items-center flex-col  bg-teal-standard bg-opacity-100 relative pt-2 px-2 shadow-lg">
                <Tag size={"md"} variant="solid" w="full" colorScheme="teal">
                    People in room
                </Tag>
                <div className="justify-between flex-col pt-2 pb-3">
                    <div style={{ width: "200px" }} className="flex flex-col video-grid-height items-center overflow-y-auto justify-start" id="video-grid">
                    </div>
                    <div className="flex items-center absolute backdrop-filter backdrop-blur left-0 bottom-0 pt-2 rounded-lg pb-4 w-full justify-around mt-2">
                        <button onClick={() => {
                            setIsMuteMic(!isMuteMic)
                            muteMic();
                        }} className={` ${isMuteMic ? "bg-theme-orange text-white" : " bg-theme-grey"} border transform duration-300 hover:shadow-2xl shadow-lg border-transparent rounded-full h-8 w-8 p-1.5`}>
                            <img src={muteIcon} alt="mute icon" />
                        </button>
                        <button onClick={() => {
                            setIsMuteCam(!isMuteCam)
                            muteCam();
                        }} className={`${isMuteCam ? "bg-theme-orange text-white" : " bg-theme-grey"} border transform duration-300 hover:shadow-2xl shadow-lg border-transparent rounded-full h-8 w-8 p-1.5`}>
                            <img src={videoIcon} alt="video icon" />
                        </button>
                        <button onClick={() => {
                            window.location.href = "/"
                        }} className=" bg-red-600 border border-transparent shadow-2xl rounded-full h-8 w-8 p-1.5">
                            <img src={phoneIcon} alt="phone icon" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LanguageSelector({ language, setLanguage }) {
    return (
        <select className="text-white cursor-pointer bg-transparent" onChange={(e) => {
            setLanguage(e.target.value.toUpperCase())
        }} value={language} name="language-selector">
            <option value="python">python</option>
            <option value="cpp">cpp</option>
            <option value="java">java</option>
        </select>
    )
}

function FileTabs({ files }) {
    return (
        <div className="w-full">
            {
                files && files.map((file, index) => {
                    return (
                        <div className="flex flex-col items-center justify-center" key={index}>
                            <div className="flex flex-col items-center justify-center">
                                <div className="flex-grow flex-shrink-0">
                                    <img className="h-4 my-2" src={file.icon} alt="file icon" />
                                </div>
                                <div className="flex-grow flex-shrink-0">
                                    <span className="ml-2">{file.name}</span>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
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