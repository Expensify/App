import * as React from 'react';
import {useState} from 'react';
import styles from '../../styles/styles';
import {Text, useWindowDimensions, View} from 'react-native';

const WrappedTextOld = ({children, textStyles, wordStyles}) => {
  const [lines, setLines] = useState([]);
  console.log('NewWrappedText', textStyles, wordStyles);
  const {width} = useWindowDimensions();
  // The width * 0.8 follows the width defined in src/components/RenderHTML.js this is hardcoded there thus has to be hardcoded here as well.
  return (
    <View>
      {lines.map((line, idx) => {
        const {x, y, height, width} = line;

        let leftBorderRadius = {};
        let rightBorderRadius = {};
        let leftBorderWidth = {borderLeftWidth: 1};
        let rightBorderWidth = {borderRightWidth: 1};
        if (idx === 0) {
          rightBorderWidth = {borderRightWidth: 0};
          rightBorderRadius = {
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
          };
        }

        if (idx > 0 && idx < lines.length - 1) {
          leftBorderWidth = {borderLeftWidth: 0};
          rightBorderWidth = {borderRightWidth: 0};
          leftBorderRadius = {
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 0,
          };
          rightBorderRadius = {
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
          };
        }

        if (idx === lines.length - 1) {
          leftBorderWidth = {borderLeftWidth: 0};
          leftBorderRadius = {
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 0,
          };
          rightBorderRadius = {
            borderBottomRightRadius: 15,
            borderTopRightRadius: 15,
          };
        }

        return (
          <View
            key={`lineOrder_${idx}`}
            style={[
              ...wordStyles,
              {
                top: y,
                position: 'absolute',
                height: height - 5,
                width: width + 10,
                marginTop: 2.5,
                marginLeft: -5,
                borderWidth: 1,
                ...leftBorderRadius,
                ...rightBorderRadius,
                ...leftBorderWidth,
                ...rightBorderWidth,
              },
            ]}
          />
        );
      })}

      <Text
        style={[textStyles, {lineHeight: textStyles.lineHeight + 5}]}
        onTextLayout={(e) => {
          console.log('onTextLayout', e.nativeEvent);
          setLines(e.nativeEvent.lines);
        }}>
        {children}
      </Text>
    </View>
  );
};

export default WrappedTextOld;
