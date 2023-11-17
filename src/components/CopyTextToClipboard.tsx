import React, {useCallback} from 'react';
import {StyleProp, TextStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import * as Expensicons from './Icon/Expensicons';
import PressableWithDelayToggle from './Pressable/PressableWithDelayToggle';
import {WithLocalizeProps} from './withLocalize';

type CopyTextToClipboardProps = WithLocalizeProps & {
    /** The text to display and copy to the clipboard */
    text: string;

    /** Styles to apply to the text */
    textStyles?: StyleProp<TextStyle>;
};

function CopyTextToClipboard(props: CopyTextToClipboardProps) {
    const {translate} = useLocalize();

    const copyToClipboard = useCallback(() => {
        Clipboard.setString(props.text);
    }, [props.text]);

    return (
        <PressableWithDelayToggle
            text={props.text}
            tooltipText={translate('reportActionContextMenu.copyToClipboard')}
            tooltipTextChecked={translate('reportActionContextMenu.copied')}
            icon={Expensicons.Copy}
            textStyles={props.textStyles}
            onPress={copyToClipboard}
            accessible
            accessibilityLabel={translate('reportActionContextMenu.copyEmailToClipboard')}
        />
    );
}

CopyTextToClipboard.displayName = 'CopyTextToClipboard';

export default CopyTextToClipboard;
