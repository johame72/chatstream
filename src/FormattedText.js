import React from 'react';
import { marked } from 'marked';

function FormattedText({ text }) {
  const getMarkdownText = () => {
    var rawMarkup = marked(text, { sanitize: true });
    return { __html: rawMarkup };
  };

  return <div dangerouslySetInnerHTML={getMarkdownText()} />;
}

export default FormattedText;
