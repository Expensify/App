import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import AztecRichTextEditor from '../vendor/react-native-aztec';
import {processUserInput} from './processUserInput';

const LiveMarkdownPreview = () => {
  const [value, setValue] = useState('<p>Type here!</p>');
  const [selection, setSelection] = useState({start: 0, end: 0});
  const richTextEditorRef = React.useRef();

  const handleOnChange = event => {
    const userInput = event.nativeEvent.text;
    const processedUserInput = processUserInput(userInput);

    if (value !== processedUserInput) {
      setValue(processedUserInput);
    }
  };

  const handleOnSelectionChange = (selectionStart, selectionEnd, text) => {
    const newSelection = {
      start: selectionStart,
      end: selectionEnd,
    };

    const hasSelectionChanged =
        selection.start !== newSelection.start ||
        selection.end !== newSelection.end;

    const isNewline =
        text === value &&
        newSelection.start === selection.start + 1 &&
        newSelection.end === selection.end + 1;

    if (hasSelectionChanged && !isNewline) {
      setSelection(newSelection);
    }
  };

  return (
      <>
        <AztecRichTextEditor
            autocorrect={false}
            ref={richTextEditorRef}
            style={styles.richTextEditor}
            onChange={event => {
              handleOnChange(event);
            }}
            onSelectionChange={(selectionStart, selectionEnd, text, event) => {
              handleOnSelectionChange(selectionStart, selectionEnd, text, event);
            }}
            text={{
              text: value,
              selection: selection,
            }}
        />
      </>
  );
};

const styles = StyleSheet.create({
  richTextEditor: {
    height: 200,
  },
});

export default LiveMarkdownPreview;
