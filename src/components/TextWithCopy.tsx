import React, {useRef} from 'react';
import type {TextProps} from 'react-native';
import type {Text as RNText} from 'react-native';
import Clipboard from '@libs/Clipboard';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import Text from './Text';

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
            onLongPress={(event) => {
                showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, copyText, textRef.current);
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </Text>
    );
}

export default TextWithCopy;
