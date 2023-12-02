import { useState, useEffect } from "react";
import IDE from "./components/IDE";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";
import ReactGA from "react-ga";

import Preview from "./components/Preview";
import Header from "./components/Header";

function App() {
  const [textEditor, setTextEditor] = useState("input");
  const [processing, setProcessing] = useState(false);
  const [percentageStage, setPercentageStage] = useState(0);
  const [selected, setSelected] = useState("python");
  const [code, setCode] = useState({
    input: "",
    output: "",
    python: "",
    cpp: "",
    java: "",
    javascript: "",
    pascal: "",
    perl: "",
    php: "",
    ruby: "",
  });
  const [modal, setModal] = useState(false);
  const [docId, setDocId] = useState(null);
  const [isDocId, setIsDocId] = useState(false);
  const { isAuthenticated, user } = useAuth0();
  const [isInputBoxShown, setisInputBoxShown] = useState(true);

  useEffect(() => {
    if (window.location.pathname === "/") {
      const uid = uuidV4();
      setDocId(uid);
      setIsDocId(false);
    } else {
      setDocId(window.location.pathname.split("/")[1]);
      setIsDocId(true);
    }
    if (isAuthenticated) {
      ReactGA.event({
        category: `user.logged`,
        action: `Login`,
        label: `${user.email}`,
      });
    }
    // eslint-disable-next-line
  }, []);

  let statusLoop = null;

  const runCode = () => {
    ReactGA.event({
      category: `button.clicked`,
      action: `Run Code`,
      lang: `${selected}`,
    });

    setCode({ ...code, output: "" });
    setTextEditor("output");
    setProcessing(true);
    setPercentageStage(10);
    setisInputBoxShown(false);

    var lang = selected;
    const backend_url = process.env.REACT_APP_BACKEND_ENDPOINT_URL + "/runcode";
    var source = "print(1)";
    if (lang === "python") {
      source = code.python;
    } else if (lang === "cpp") {
      source = code.cpp;
    } else if (lang === "java") {
      source = code.java;
    } else if (lang === "javascript") {
      source = code.javascript;
    } else if (lang === "pascal") {
      source = code.pascal;
    } else if (lang === "perl") {
      source = code.perl;
    } else if (lang === "php") {
      source = code.php;
    } else if (lang === "ruby") {
      source = code.ruby;
    }
    if (lang === "javascript") lang = "javascript_node";
    var data = {
      lang: lang.toUpperCase(),
      source: source,
      input: code.input,
      memory_limit: 243232,
      time_limit: 5,
      context: "{'id': 213121}",
      callback: "https://client.com/callback/",
    };

    var status;
    var raw = JSON.stringify(data);

    var requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: raw,
      redirect: "follow",
    };
    fetch(backend_url, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        status = data.status_update_url;
        const url = backend_url + "?url=" + status;

        setPercentageStage(25);

        statusLoop = setInterval(() => {
          fetch(url, {
            method: "GET",
          })
            .then((res) => res.json())
            .then((data) => {
              setPercentageStage(75);
              // console.log(data);
              if (data.result.compile_status === "OK") {
                if (data.result.run_status.status === "AC") {
                  getOutput(data.result.run_status.output);
                  clearInterval(statusLoop);
                } else if (data.result.run_status.status === "OLE") {
                  setCode({
                    ...code,
                    output: data.result.run_status.status_detail,
                  });
                  setProcessing(false);
                  clearInterval(statusLoop);
                } else if (data.result.run_status.status !== "NA") {
                  setCode({
                    ...code,
                    output: data.result.run_status.stderr,
                  });
                  setProcessing(false);
                  clearInterval(statusLoop);
                }
              } else {
                setCode({
                  ...code,
                  output: data.result.compile_status,
                });
                setProcessing(false);
                clearInterval(statusLoop);
                return;
              }
            })
            .catch((e) => {
              setProcessing(false);
              clearInterval(statusLoop);
              console.log(e);
            });
        }, 2000);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getOutput = (link) => {
    axios
      .get(link)
      .then((res) => {
        setPercentageStage(100);
        setProcessing(false);
        setCode({
          ...code,
          output: res.data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleModal = () => {
    ReactGA.event({
      category: `button.clicked`,
      action: `Whiteboard ${modal ? "Opened" : "Closed"}`,
    });
    setModal(!modal);
  };

  return (
    <div className="h-screen flex flex-grow flex-col">
      {isDocId ? (
        <>
          <Header
            userInfo={user}
            runCode={runCode}
            isAuthenticated={isAuthenticated}
            toggleModal={toggleModal}
            isInputBoxShown={isInputBoxShown}
            setisInputBoxShown={setisInputBoxShown}
          />
          <IDE
            docId={docId}
            modal={modal}
            code={code}
            setCode={setCode}
            toggleModal={toggleModal}
            setModal={setModal}
            selected={selected}
            setSelected={setSelected}
            textEditor={textEditor}
            setTextEditor={setTextEditor}
            processing={processing}
            setProcessing={setProcessing}
            percentageStage={percentageStage}
            setPercentageStage={setPercentageStage}
            isInputBoxShown={isInputBoxShown}
          />
        </>
      ) : (
        <Preview docId={docId} />
      )}
    </div>
  );
}

export default App;
