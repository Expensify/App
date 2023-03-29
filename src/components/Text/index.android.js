import React, {forwardRef, useState} from 'react';
import BaseText from './BaseText';
import {defaultProps, propTypes} from './baseTextPropTypes';

const Text = (props) => {
    const [truncatedText, setTruncatedText] = useState(typeof props.children === 'string' ? props.children : null);

    const handleTextLayout = ({nativeEvent: {lines}}) => {
        if (!props.numberOfLines || lines.length <= props.numberOfLines) {
            return;
        }

        let newText = '';
        for (let index = 0; index < props.numberOfLines; index += 1) {
            newText = `${newText}${lines[index].text}`;
        }

        setTruncatedText(`${newText.slice(0, -3)}...`);
    };

    return (
        <BaseText
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            numberOfLines={null}
            onTextLayout={handleTextLayout}
        >
            {typeof props.children === 'string' ? truncatedText : props.children}
        </BaseText>
    );
};

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;
Text.displayName = 'Text';

export default forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Text {...props} innerRef={ref} />
));
