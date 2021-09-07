import React, { useEffect, useState, useRef } from 'react';
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
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import closeIcon from '../images/icons/close.png';
import { Icon } from '@iconify/react';
import eraser24Filled from '@iconify/icons-fluent/eraser-24-filled';
import penFill from '@iconify/icons-bi/pen-fill';
import 'react-circular-progressbar/dist/styles.css';


export default function IDE({ docId, modal, toggleModal, python, setpython, input, setInput, selected, setSelected, output, textEditor, setTextEditor, processing, percentageStage }) {
    const [socket, setSocket] = useState(null);
    const [cpp, setcpp] = useState('');
    const [java, setjava] = useState('');
    const colorsRef = useRef(null);


    useEffect(() => {
        ReactGA.pageview('IDE-screen');
        var TempSocket = io(process.env.REACT_APP_BACKEND_ENDPOINT_URL);
        setSocket(TempSocket);
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
        };



        const onMouseDown = (e) => {
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
                        <div id="editor" className="flex-grow flex flex-col">
                            <div className="flex-grow overflow-y-auto" style={{ height: "calc(100vh - 310px)" }}>
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
                    </div>
                </div>
            </div>
        </>
    )
}

function LanguageSelector({ language, setLanguage }) {
    return (
        <select className="text-white cursor-pointer bg-transparent" onChange={() => {
            setLanguage('PYTHON')
        }} value={language} name="language-selector">
            <option value="python">python</option>
            <option value="cpp">cpp</option>
            <option value="java">java</option>
        </select>
    )
}