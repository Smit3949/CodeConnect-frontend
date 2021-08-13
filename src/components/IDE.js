import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import Peer from 'peerjs';
import closeIcon from '../images/icons/close.png';
import muteIcon from '../images/icons/mute.svg';
import videoIcon from '../images/icons/video.svg';
import phoneIcon from '../images/icons/phone.svg';
import { Icon } from '@iconify/react';
import eraser24Filled from '@iconify/icons-fluent/eraser-24-filled';
import penFill from '@iconify/icons-bi/pen-fill';
import 'react-circular-progressbar/dist/styles.css';
import { v4 as uuidV4 } from 'uuid';


export default function IDE() {
    const [docId, setDocId] = useState(null);
    const [socket, setSocket] = useState(null);
    const [cpp, setcpp] = useState('');
    const [java, setjava] = useState('');
    const [python, setpython] = useState('');
    const [selected, setSelected] = useState('PYTHON');
    const [peer, setPeer] = useState(null);
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [modal, setModal] = useState(false);
    const username = 'smit'
    const videoGrid = document.getElementById('video-grid');
    const myVideo = document.createElement('video');
    myVideo.className = "rounded mb-4"
    myVideo.muted = true;
    const [myStream, setMystream] = useState(null);
    const peers = {};
    const colorsRef = useRef(null);
    const [userId, setUserId] = useState(null);
    const [textEditor, setTextEditor] = useState('input');
    const [processing, setProcessing] = useState(false);
    const [percentageStage, setPercentageStage] = useState(0);



    useEffect(() => {
        setDocId(uuidV4());
        var TempSocket = io('http://localhost:3001');
        setSocket(TempSocket);
        const peer = new Peer(undefined, {
            host: 'localhost',
            port: 9000,
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


    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        })
        videoGrid.append(video);
    };

    useEffect(() => {
        if (socket == null) return;

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            addVideoStream(myVideo, stream);

            setMystream(stream);
            peer.on('call', cal => {
                cal.answer(stream);
                const video = document.createElement('video');
                video.className = "rounded mb-4"

                cal.on('stream', (anotherUserVideoStream) => {
                    addVideoStream(video, anotherUserVideoStream);
                });
            });

            socket.on('user-connected', (userId, username) => {
                const call = peer.call(userId, stream);
                console.log('user connected : ', username);
                const video = document.createElement('video')
                video.id = userId;
                call.on('stream', (anotherUserVideoStream) => {

                    console.log(anotherUserVideoStream.getAudioTracks());
                    addVideoStream(video, anotherUserVideoStream, username);
                });

                call.on('close', () => {
                    video.remove();
                });
                peers[userId] = call;
            });


        });

        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close();
        });

        peer.on('open', (id) => {
            setUserId(id);
            socket.emit('join-room', docId, id, username);
        });
        // eslint-disable-next-line
    }, [socket, docId, peer]);

    const muteMic = () => {
        myStream.getAudioTracks()[0].enabled = !(myStream.getAudioTracks()[0].enabled);
        socket.emit('toggled', userId, myStream.getVideoTracks()[0].enabled, myStream.getAudioTracks()[0].enabled);
    }

    const muteCam = () => {
        if (socket === null) return;
        myStream.getVideoTracks()[0].enabled = !(myStream.getVideoTracks()[0].enabled);
        // toggle webcam tracks
        socket.emit('toggled', userId, myStream.getVideoTracks()[0].enabled, myStream.getAudioTracks()[0].enabled);
    }

    useEffect(() => {
        if (socket === null) return;
        socket.on('received-toggled-events', (userId, video, audio) => {
            console.log(userId, video, audio);
        });
    })


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

    let statusLoop = null;

    const runCode = () => {
        setOutput('')
        setTextEditor('output');
        setProcessing(true);
        setPercentageStage(10);

        var lang = selected;
        // console.log(lang, input);
        var backend_url = 'https://api.hackerearth.com/v4/partner/code-evaluation/submissions/';

        var data = {
            "lang": lang,
            "source": python,
            "input": input,
            "memory_limit": 243232,
            "time_limit": 5,
            "context": "{'id': 213121}",
            "callback": "https://client.com/callback/"
        }


        var status;
        fetch(backend_url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'client-secret': process.env.REACT_APP_HACKEREARTH_SECRET
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                status = data.status_update_url;

                setPercentageStage(25)

                statusLoop = setInterval(() => {
                    fetch(status, {
                        method: 'GET',
                        mode: 'cors',
                        cache: 'no-cache',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            'client-secret': process.env.REACT_APP_HACKEREARTH_SECRET
                        },
                        redirect: 'follow',
                        referrerPolicy: 'no-referrer',
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            setPercentageStage(75)
                            // console.log(data);
                            if (data.result.compile_status === 'OK') {
                                if (data.result.run_status.status === 'AC') {
                                    getOutput(data.result.run_status.output);
                                    clearInterval(statusLoop);
                                }
                                else if (data.result.run_status.status === 'OLE') {
                                    setOutput(data.result.run_status.status_detail);
                                    setProcessing(false);
                                    clearInterval(statusLoop);
                                }
                                else if (data.result.run_status.status !== 'NA') {
                                    setOutput(data.result.run_status.stderr);
                                    setProcessing(false);
                                    clearInterval(statusLoop);
                                }
                            }
                            else {
                                setOutput(data.result.compile_status);
                                setProcessing(false);
                                clearInterval(statusLoop);
                                return;
                            }
                        })
                        .catch(e => {
                            setProcessing(false);
                            clearInterval(statusLoop);
                            console.log(e)
                        });
                }, 2000)
            }).catch(e => {
                console.log(e)
            });;

    };

    const getOutput = (link) => {
        axios.get(link).then((res) => {
            setPercentageStage(100)
            setProcessing(false);
            setOutput(res.data);
        }).catch((err) => {
            console.log(err);
        })
    }

    const toggleModal = () => {
        setModal(!modal);
    }

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
            <div className="flex-grow flex">
                <div id="editor" className="flex-grow flex flex-col">
                    <FileTabs />
                    <div className="flex-grow overflow-y-auto" style={{ height: "calc(100vh - 310px)" }}>
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
                    <div className={`flex-grow ${modal ? "top-0" : " top-full"} duration-300 left-0 p-4 backdrop-filter backdrop-blur-sm absolute z-50 w-screen h-screen`}>
                        <div ref={colorsRef} className="colors absolute flex select-none left-10 top-10">
                            <Icon icon={penFill} data-color="black" className="block cursor-pointer color black text-orange-standard" height="28" />
                            <Icon icon={eraser24Filled} data-color="white" className="block cursor-pointer color white ml-4" height="30" />
                        </div>
                        <div className="absolute right-10 select-none top-10">
                            <img onClick={toggleModal} src={closeIcon} className="w-6 cursor-pointer" alt="close icon" />
                        </div>

                        <canvas id="whiteboard-canvas" className="m-0 border h-full w-full bg-white rounded-xl border-black" />
                    </div>
                    <div className="h-64 flex flex-col bg-gray-standard">
                        <div className="flex items-center justify-evenly text-center duration-100">
                            <div onClick={() => {
                                setTextEditor('input')
                            }}
                                className={` cursor-pointer w-1/2 ${(textEditor === 'input' ? "hover:opacity-90 border-black" : " hover:opacity-60 border-transparent opacity-50")} border-r  bg-orange-standard`}>Input</div>
                            <div
                                onClick={() => {
                                    setTextEditor('output')
                                }}
                                className={`cursor-pointer w-1/2 ${(textEditor === 'output' ? "hover:opacity-90 border-black" : " hover:opacity-60 border-transparent opacity-50")} border-l bg-orange-standard`}>Output</div>
                        </div>
                        <div className="w-full flex-grow p-4 relative">
                            {
                                textEditor === 'input' ?
                                    <textarea className="rounded-md outline-none shadow-md w-full h-full p-4 resize-none" placeholder="enter an input..." onChange={(e) => { setInput(e.target.value) }} value={input} rows="4" cols="50">
                                    </textarea>
                                    : <textarea className={` ${processing ? "transform animate-pulse" : ""} rounded-md outline-none shadow-md w-full h-full p-4 resize-none`} readOnly placeholder="output will be shown here" value={output} rows="4" cols="50">
                                    </textarea>
                            }
                            {
                                processing &&
                                <div className="absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
                                    <CircularProgressbar styles={buildStyles({
                                        rotation: 0.25,
                                        strokeLinecap: 'butt',
                                        textSize: '22px',
                                        pathTransitionDuration: 0.5,
                                        pathColor: `#EE9B00`,
                                        textColor: '#EE9B00'
                                    })} className="h-20" value={percentageStage} text={`${percentageStage}%`} />
                                </div>
                            }
                        </div>
                        <input accept="text/plain" type="file" onChange={handleFileDataChange} className="hidden" id="input-file-upload" />
                        <div onClick={handleInputFileChange} className="mb-4 text-orange-standard w-full text-center cursor-pointer"><span className="hover:opacity-70">... or upload an file</span></div>
                    </div>
                </div>
                <RightVideoPanel muteCam={muteCam} muteMic={muteMic} />
            </div>
        </>
    )
}





function RightVideoPanel({ muteCam, muteMic }) {

    return (
        <div style={{ height: "calc(100vh - 50px)" }} className="flex flex-col items-center relative p-2 bg-purple-dark shadow-lg">
            {/* <button><img className="h-4 my-2" src={upArrow} alt="scroll up arrow" /></button> */}
            <div className="flex flex-col items-center overflow-y-auto justify-center pb-10" id="video-grid"></div>
            {/* <button><img className="h-4 my-2 transform rotate-180" src={upArrow} alt="scroll down arrow" /></button> */}
            <div className="flex items-center backdrop-filter backdrop-blur absolute left-0 bottom-0 pt-2 rounded-lg pb-4 w-full justify-around mt-2">
                <button className="bg-orange-standard border border-r rounded-full h-8 w-8 p-1.5">
                    <img src={muteIcon} alt="mute icon" />
                </button>
                <button className="bg-orange-standard border border-r rounded-full h-8 w-8 p-1.5">
                    <img src={videoIcon} onClick={muteCam} alt="video icon" />
                </button>
                <button className="bg-orange-standard border border-r rounded-full h-8 w-8 p-1.5">
                    <img src={phoneIcon} onClick={muteMic} alt="phone icon" />
                </button>
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