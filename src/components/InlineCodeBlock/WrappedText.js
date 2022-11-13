import * as React from 'react';
import {useState} from 'react';
import {Text, useWindowDimensions, View} from 'react-native';

const WrappedText = ({children, textStyles, wordStyles}) => {
  const [lines, setLines] = useState([]);
  console.log('NewWrappedText', textStyles, wordStyles);
  const {width} = useWindowDimensions();

  return (
    <View style={{}}>
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

        if (lines.length === 1) {
          leftBorderRadius = {
            borderBottomRightRadius: 15,
            borderTopRightRadius: 15,
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
                top: y - 2,
                position: 'absolute',
                height: height - 5,
                width: width + 10,
                marginTop: 14,
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
        style={[
          textStyles,
          {
            paddingLeft: 5,
            paddingRight: 5,
            lineHeight: textStyles.lineHeight + 5,
            marginTop: 5,
            top: 4,
          },
        ]}
        onTextLayout={(e) => {
          console.log('onTextLayout', e.nativeEvent);
          setLines(e.nativeEvent.lines);
        }}>
        {children}
      </Text>
    </View>
  );
};

export default WrappedText;
