import { useState, useEffect } from 'react';
import IDE from "./components/IDE";
// import { Login, Logout } from "./components/auth/Auth0";
import { useAuth0 } from '@auth0/auth0-react'
import { Tooltip, Avatar } from "@chakra-ui/react"
import { Icon } from '@iconify/react';
import axios from 'axios';
import { v4 as uuidV4 } from 'uuid';
import ReactGA from 'react-ga';
import runIcon from './images/icons/run.svg';
import whiteboard24Regular from '@iconify/icons-fluent/whiteboard-24-regular';
import Preview from './components/Preview';



function App() {
  const [textEditor, setTextEditor] = useState('input');
  const [processing, setProcessing] = useState(false);
  const [percentageStage, setPercentageStage] = useState(0);
  const [selected, setSelected] = useState('python');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [python, setpython] = useState('');
  const [cpp, setcpp] = useState('');
  const [java, setjava] = useState('');
  const [js, setjs] = useState('');
  const [pascal, setpascal] = useState('');
  const [perl, setperl] = useState('');
  const [php, setphp] = useState('');
  const [ruby, setruby] = useState('');
  const [modal, setModal] = useState(false);
  const [docId, setDocId] = useState(null);
  const [isDocId, setIsDocId] = useState(false);
  const { isAuthenticated, user } = useAuth0();
  const [isInputBoxShown, setisInputBoxShown] = useState(true);


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
    setisInputBoxShown(false);

    var lang = selected;
    const backend_url = process.env.REACT_APP_BACKEND_ENDPOINT_URL + "/runcode";
    var source = "print(1)";
    if (lang === "python") {
      source = python;
    }
    else if (lang === "cpp") {
      source = cpp;
    }
    else if (lang === "java") {
      source = java;
    }
    else if (lang === "javascript") {
      source = js;
    }
    else if (lang === "pascal") {
      source = pascal;
    }
    else if (lang === "perl") {
      source = perl;
    }
    else if (lang === "php") {
      source = php;
    }
    else if (lang === "ruby") {
      source = ruby;
    }
    if (lang === "javascript") lang = "javascript_node";
    var data = {
      "lang": lang.toUpperCase(),
      "source": source,
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
            <Header userInfo={user} runCode={runCode} isAuthenticated={isAuthenticated} toggleModal={toggleModal} isInputBoxShown={isInputBoxShown} setisInputBoxShown={setisInputBoxShown} />
            <IDE docId={docId} modal={modal} java={java} setjava={ setjava } toggleModal={toggleModal} setModal={setModal} cpp={cpp} setcpp={setcpp} js={js} setjs={setjs} php={php} setphp={setphp} perl={perl} setperl={setperl} ruby={ruby} setruby={setruby} pascal={pascal} setpascal={ setpascal} python={python} setpython={setpython} input={input} setInput={setInput} selected={selected} setSelected={setSelected} output={output} setOutput={setOutput} textEditor={textEditor} setTextEditor={setTextEditor} processing={processing} setProcessing={setProcessing} percentageStage={percentageStage} setPercentageStage={setPercentageStage} isInputBoxShown={isInputBoxShown} />
          </>
          :
          <Preview docId={docId} />
      }
    </div>
  );
}

export default App;

function Header({ runCode, toggleModal, isAuthenticated, isInputBoxShown, setisInputBoxShown }) {
  const [toolTip, showToolTip] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [isUserPresent, setIsUserPresent] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setUserInfo(user);
      if (user) {
        setIsUserPresent(true);
      }
      else setIsUserPresent(false);
    }
    catch (e) {
      setIsUserPresent(false);
    }
  }, [])

  const toggleInputBox = () => {
    ReactGA.event({
      category: `button.clicked`,
      action: `Input Box ${isInputBoxShown ? "Closed" : "Opened"}`,
    });
    setisInputBoxShown(!isInputBoxShown);
  }

  return (
    <div className=" bg-purple-standard flex py-2 px-4 justify-between items-center rounded-b-lg custom-shadow-medium">
      <div className="flex items-center">
        <div className="h-7 flex items-center font-medium text-xl codeFont text-orange-standard">
          <img className="h-full" src={'./logo.png'} alt="codeconnect logo" />
          <span className="ml-2">CodeConnect</span>
        </div>
      </div>
      <div className="flex items-center">
        <Tooltip label="Input/Output" hasArrow fontSize="md" bg="teal.600">
          <button className=" text-white mr-4" onClick={toggleInputBox}><Icon icon="bi:input-cursor-text" className="text-orange-standard" height="24" /></button>
        </Tooltip>
        <Tooltip label="Whiteboard" hasArrow fontSize="md" bg="teal.600">
          <button className=" text-white mr-4" onClick={toggleModal}><Icon icon={whiteboard24Regular} className="text-orange-standard" height="28" /></button>
        </Tooltip>
        <Tooltip label="Run Code" hasArrow fontSize="sm" bg="teal.600">
          <button onClick={runCode} className="bg-orange-standard flex items-center text-base font-medium rounded px-3 py-0.5 mr-2">
            <img className="h-2.5" src={runIcon} alt="run code icon" />
            <span className="ml-2">Run</span>
          </button>
        </Tooltip>
        {/* {
          isAuthenticated ?
            <Logout /> :
            <Login />
        } */}
        {
          isUserPresent &&
          <Tooltip label={userInfo.email} hasArrow fontSize="sm" bg="teal.900">
            <Avatar size="sm" name={userInfo.name} src={userInfo.picture} />
          </Tooltip>
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