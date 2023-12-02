import {
  Progress,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { Controlled as CodeMirror } from "react-codemirror2";
import React from "react";
import FileTabs from "./FileTabs";
import LanguageSelector from "./LanguageSelector";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/dracula.css";
import "codemirror/theme/panda-syntax.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/python/python";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/pascal/pascal";
import "codemirror/mode/perl/perl";
import "codemirror/mode/php/php";
import "codemirror/mode/ruby/ruby";
import "react-circular-progressbar/dist/styles.css";

const modeMap = {
  python: "python",
  cpp: "text/x-csrc",
  java: "text/x-java",
  javascript: "text/ecmascript",
  pascal: "text/x-pascal",
  ruby: "text/x-ruby",
  php: "text/x-php",
  perl: "text/x-perl",
};
export default function CodeEditor({
  socket,
  selected,
  setSelected,
  code,
  setCode,
  isInputBoxShown,
  processing,
  percentageStage,
  textEditor,
  setTextEditor,
}) {
  const handleFileDataChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const textData = e.target.result;
      setCode({ ...code, input: textData });
    };
    reader.readAsText(file);
  };

  const handleInputFileChange = () => {
    const input = document.getElementById("input-file-upload");
    input.click();
  };

  return (
    <div id="editor" className="flex-grow relative flex flex-col">
      <FileTabs />
      <div
        className="flex duration-500 relative overflow-y-auto px-2 pt-2 pb-4"
        style={
          isInputBoxShown
            ? { height: "94%", maxHeight: "calc(100vh - 10px)" }
            : { height: "calc(100vh - 310px)" }
        }
      >
        <div className=" w-full custom-shadow h-full rounded-xl overflow-hidden">
          {
            <section className="playground">
              <div className="code-editor-java flex flex-col h-full mb-5 java-code">
                <div className="editor-header">
                  <LanguageSelector
                    language={selected.toLowerCase()}
                    setLanguage={setSelected}
                  />
                </div>
                <CodeMirror
                  value={code[selected]}
                  className="flex-grow text-base"
                  options={{
                    mode: modeMap[selected],
                    theme: "dracula",
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                  onBeforeChange={(editor, data, changes) => {
                    setCode({ ...code, [selected]: changes });
                  }}
                />
              </div>
            </section>
          }
        </div>
      </div>
      <div
        className={`${
          isInputBoxShown
            ? "absolute w-full bottom-0 left-0 transform translate-y-full"
            : ""
        } duration-500`}
      >
        <div className="shadow-lg border-2 border-opacity-50 border-theme-teal-dark mx-2 rounded-xl">
          <Tabs
            index={textEditor === "input" ? 0 : 1}
            isFitted
            variant="line"
            colorScheme="#224f5c50"
          >
            <TabList>
              <Tab
                onClick={() => {
                  setTextEditor("input");
                }}
                className=" font-semibold "
              >
                Input
              </Tab>
              <Tab
                onClick={() => {
                  setTextEditor("output");
                }}
                className=" font-semibold "
              >
                Output
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel paddingX="2" paddingBottom="2" paddingTop="0">
                <textarea
                  className="  rounded-md outline-none w-full h-full p-4 resize-none"
                  placeholder="enter an input..."
                  onChange={(e) => {
                    setCode({ ...code, input: e.target.value });
                  }}
                  value={code.input}
                  rows="4"
                  cols="50"
                ></textarea>
              </TabPanel>
              <TabPanel paddingX="0" paddingY="0" className="relative">
                {processing && (
                  <Progress
                    colorScheme="teal"
                    size="sm"
                    value={percentageStage}
                    className="mb-1"
                  />
                )}
                <Skeleton isLoaded={!processing} className="rounded-xl px-2">
                  <textarea
                    className={` ${
                      processing ? "transform animate-pulse" : ""
                    } rounded-md outline-none w-full h-full pt-4 pb-6 px-6 resize-none`}
                    readOnly
                    placeholder="output will be shown here"
                    value={code.output}
                    rows="4"
                    cols="50"
                  ></textarea>
                </Skeleton>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
        <input
          accept="text/plain"
          type="file"
          onChange={handleFileDataChange}
          className="hidden"
          id="input-file-upload"
        />
        <div
          onClick={handleInputFileChange}
          className="mt-4 text-theme-teal-dark font-semibold w-full text-center cursor-pointer"
        >
          <span className="hover:opacity-70">... or upload an file</span>
        </div>
      </div>
    </div>
  );
}
