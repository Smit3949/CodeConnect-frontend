import React from "react";

export default function LanguageSelector({ language, setLanguage }) {
  return (
    <select
      className="text-white cursor-pointer bg-transparent"
      onChange={(e) => {
        setLanguage(e.target.value);
      }}
      value={language}
      name="language-selector"
    >
      <option className="bg-theme-dark-blue" value="cpp">
        cpp
      </option>
      <option className="bg-theme-dark-blue" value="python">
        python
      </option>
      <option className="bg-theme-dark-blue" value="java">
        java
      </option>
      <option className="bg-theme-dark-blue" value="javascript">
        javascript
      </option>
      <option className="bg-theme-dark-blue" value="perl">
        perl
      </option>
      <option className="bg-theme-dark-blue" value="php">
        php
      </option>
      <option className="bg-theme-dark-blue" value="ruby">
        ruby
      </option>
      <option className="bg-theme-dark-blue" value="pascal">
        pascal
      </option>
    </select>
  );
}
