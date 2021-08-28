import React, { useEffect } from 'react';
import ReactGA from 'react-ga';

export default function Preview({ docId }) {
    useEffect(() => {
        ReactGA.pageview('preview-screen');
    }, [])

    const joinRoomViaRoomId = () => {
        const roomId = document.getElementById("roomIdInput");
        const roomIdValue = roomId.value;

        if (roomIdValue.includes("http") || roomIdValue.includes("https")) {
            const url = new URL(roomIdValue);
            const path = url.pathname;
            ReactGA.event({
                category: `button.clicked`,
                action: `Join Room`,
                label: `from copied url`
            });
            window.location.href = `${path}`;
        }
        else {
            ReactGA.event({
                category: `button.clicked`,
                action: `Join Room`,
                label: `from input url`
            });
            window.location.href = `/${roomIdValue}`;
        }
    }

    return (
        <div className="bg-orange-standard select-none flex items-center justify-center h-full w-full">
            <div className="mb-20 flex flex-col items-center">
                <div className="flex w-full text-white text-7xl font-bold codeFont justify-center">
                    <span>&#60;CodeConnect &#47;&#62;</span>
                </div>
                <div className="flex flex-col mt-20 justify-center  text-white">
                    <button onClick={() => {
                        ReactGA.event({
                            category: `button.clicked`,
                            action: `Create Room`
                        });
                        window.location.href = `/${docId}`
                    }} className=" hover:shadow-md duration-150 px-4 py-2 rounded-lg shadow text-blue-500 bg-white border border-blue-600 font-semibold">Create Room</button>
                    {/* <button className=" hover:shadow-md duration-300 px-4 mx-2 py-2 rounded-lg shadow bg-blue-600 font-medium">Sign Up</button> */}
                    <div className="mt-10 flex">
                        <input id="roomIdInput" placeholder="Enter Room ID" type="text" className=" duration-300 rounded w-80 border-white focus:shadow-lg shadow-md text-black outline-none focus:outline-none px-4 py-3 codeFont" />
                        <button onClick={joinRoomViaRoomId} className="hover:shadow-lg duration-300 hover:bg-blue-700 px-4 ml-2 py-2 rounded-lg shadow bg-blue-600 font-medium">Join Room</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
