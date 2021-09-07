import { useState, useEffect } from 'react';
import IDE from "./components/IDE";
import { useAuth0 } from '@auth0/auth0-react'
import { Icon } from '@iconify/react';
import axios from 'axios';
import { v4 as uuidV4 } from 'uuid';
import ReactGA from 'react-ga';
import runIcon from './images/icons/run.svg';
import whiteboard24Regular from '@iconify/icons-fluent/whiteboard-24-regular';
import Preview from './components/Preview';

function App() {
  const [textEditor, setTextEditor] = useState('input');
  const [output, setOutput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [percentageStage, setPercentageStage] = useState(0);
  const [selected, setSelected] = useState('PYTHON');
  const [input, setInput] = useState('');
  const [python, setpython] = useState('');
  const [modal, setModal] = useState(false);
  const [docId, setDocId] = useState(null);
  const [isDocId, setIsDocId] = useState(false);
  const { isAuthenticated, user } = useAuth0();


  useEffect(() => {
    if (window.location.pathname === "/") {
      const uid = uuidV4();
      setDocId(uid)
      setIsDocId(false);
    }
    else {
      setDocId(window.location.pathname.split('/')[1])
      setIsDocId(true);
    }
    if (isAuthenticated) {
      ReactGA.event({
        category: `user.logged`,
        action: `Login`,
        label: `${user.email}`
      });
    }
    // eslint-disable-next-line
  }, []);


  let statusLoop = null;

  const runCode = () => {

    ReactGA.event({
      category: `button.clicked`,
      action: `Run Code`,
      lang: `${selected}`
    });

    setOutput('')
    setTextEditor('output');
    setProcessing(true);
    setPercentageStage(10);

    var lang = selected;
    const backend_url = process.env.REACT_APP_BACKEND_ENDPOINT_URL + "/runcode";

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
    var raw = JSON.stringify(data);

    var requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: raw,
      redirect: 'follow'
    };
    fetch(backend_url, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        status = data.status_update_url;
        const url = backend_url + "?url=" + status;

        setPercentageStage(25)

        statusLoop = setInterval(() => {
          fetch(url, {
            method: 'GET'
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
    ReactGA.event({
      category: `button.clicked`,
      action: `Whiteboard ${modal ? "Opened" : "Closed"}`,
    });
    setModal(!modal);
  }

  return (
    <div className="h-screen flex flex-grow flex-col">
      {
        isDocId ?
          <>
            <Header runCode={runCode} toggleModal={toggleModal} />
            <IDE docId={docId} modal={modal} toggleModal={toggleModal} setModal={setModal} python={python} setpython={setpython} input={input} setInput={setInput} selected={selected} setSelected={setSelected} output={output} setOutput={setOutput} textEditor={textEditor} setTextEditor={setTextEditor} processing={processing} setProcessing={setProcessing} percentageStage={percentageStage} setPercentageStage={setPercentageStage} />
          </>
          :
          <Preview docId={docId} />
      }
    </div>
  );
}

export default App;

function Header({ runCode, toggleModal }) {
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
      </div>
    </div>
  )
}