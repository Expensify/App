import React, {forwardRef, useState} from 'react';
import BaseText from './BaseText';
import {defaultProps as baseTextDefaultProps, propTypes as baseTextPropTypes} from './baseTextPropTypes';

const Text = (props) => {
    // eslint-disable-next-line react/destructuring-assignment
    const {numberOfLines, ...rest} = props;
    const [truncatedText, setTruncatedText] = useState(typeof props.children === 'string' ? props.children : null);

    const handleTextLayout = ({nativeEvent: {lines}}) => {
        if (!numberOfLines || lines.length <= numberOfLines) {
            return;
        }

        let newText = '';
        for (let index = 0; index < numberOfLines; index += 1) {
            newText = `${newText}${lines[index].text}`;
        }

        setTruncatedText(`${newText.slice(0, -3)}...`);
    };

    return (
        <BaseText
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onTextLayout={handleTextLayout}
        >
            {typeof props.children === 'string' ? truncatedText : props.children}
        </BaseText>
    );
};

Text.propTypes = baseTextPropTypes;
Text.defaultProps = baseTextDefaultProps;
Text.displayName = 'Text';

export default forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Text {...props} innerRef={ref} />
));
