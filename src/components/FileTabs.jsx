import React from "react";

export default function FileTabs({ files }) {
  return (
    <div className="w-full">
      {files &&
        files.map((file, index) => {
          return (
            <div
              className="flex flex-col items-center justify-center"
              key={index}
            >
              <div className="flex flex-col items-center justify-center">
                <div className="flex-grow flex-shrink-0">
                  <img className="h-4 my-2" src={file.icon} alt="file icon" />
                </div>
                <div className="flex-grow flex-shrink-0">
                  <span className="ml-2">{file.name}</span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
