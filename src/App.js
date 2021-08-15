import { useState } from 'react';
import IDE from "./components/IDE";
import { Login, Logout } from "./components/auth/Auth0";
import { useAuth0 } from '@auth0/auth0-react'
import { Icon } from '@iconify/react';
import axios from 'axios';
import runIcon from './images/icons/run.svg';
import whiteboard24Regular from '@iconify/icons-fluent/whiteboard-24-regular';

function App() {
  const [textEditor, setTextEditor] = useState('input');
  const [output, setOutput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [percentageStage, setPercentageStage] = useState(0);
  const [selected, setSelected] = useState('PYTHON');
  const [input, setInput] = useState('');
  const [python, setpython] = useState('');
  const [modal, setModal] = useState(false);
  const { isAuthenticated, user } = useAuth0();


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

  return (
    <div className="flex">
      <div className="h-screen flex flex-grow flex-col">
        <Header userInfo={user} runCode={runCode} isAuthenticated={isAuthenticated} toggleModal={toggleModal} />
        <IDE modal={modal} toggleModal={toggleModal} setModal={setModal} python={python} setpython={setpython} input={input} setInput={setInput} selected={selected} setSelected={setSelected} output={output} setOutput={setOutput} textEditor={textEditor} setTextEditor={setTextEditor} processing={processing} setProcessing={setProcessing} percentageStage={percentageStage} setPercentageStage={setPercentageStage} />
      </div>
    </div>
  );
}

export default App;

function Header({ runCode, toggleModal, isAuthenticated, userInfo }) {
  console.log(userInfo);
  const [toolTip, showToolTip] = useState(false);
  return (
    <div className=" bg-purple-standard flex py-2 px-2 justify-between items-center">
      <div className="flex items-center">
        <div className="h-7">
          <img className="h-full" src={'./logo.png'} alt="codeconnect logo" />
        </div>
      </div>
      <div className="flex items-center">
        <button className=" text-white mr-4" onClick={toggleModal}><Icon icon={whiteboard24Regular} className="text-orange-standard" height="28" /></button>
        <button onClick={runCode} className="bg-orange-standard flex items-center text-base font-medium rounded px-3 py-1 mr-2">
          <img className="h-3" src={runIcon} alt="run code icon" />
          <span className="ml-2">Run</span>
        </button>
        {
          isAuthenticated ?
            <Logout /> :
            <Login />
        }
        <div className="mx-1 relative">
          {
            isAuthenticated &&
            <img onMouseEnter={() => { showToolTip(true) }} onMouseLeave={() => { showToolTip(false) }} className="h-7 w-7 rounded-full" src={userInfo.picture} alt="user icon" />
          }
          {
            toolTip && isAuthenticated &&
            <div className="absolute z-50 top-full right-0 mt-2 text-center text-xs text-gray-200 bg-black mr-4 px-1">{userInfo.email}</div>
          }
        </div>
      </div>
    </div>
  )
}