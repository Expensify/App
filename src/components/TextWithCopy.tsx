import React, {useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText} from 'react-native';
import Clipboard from '@libs/Clipboard';
import Text from './Text';
import type {TextProps} from './Text';

type TextWithCopyProps = TextProps & {
    copyText: string;
};

function TextWithCopy({children, copyText, ...rest}: TextWithCopyProps) {
    const textRef = useRef<RNText>(null);

    return (
        <Text
            ref={textRef}
            onPress={() => {
                Clipboard.setString(copyText);
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </Text>
    );
}

export default TextWithCopy;
