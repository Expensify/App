import React, {useCallback} from 'react';
import type {AccessibilityRole, StyleProp, TextStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import Clipboard from '@libs/Clipboard';
import * as Expensicons from './Icon/Expensicons';
import PressableWithDelayToggle from './Pressable/PressableWithDelayToggle';

type CopyTextToClipboardProps = {
    /** The text to display and copy to the clipboard */
    text: string;

    /** Styles to apply to the text */
    textStyles?: StyleProp<TextStyle>;

    urlToCopy?: string;

    accessibilityRole?: AccessibilityRole;
};

function CopyTextToClipboard({text, textStyles, urlToCopy, accessibilityRole}: CopyTextToClipboardProps) {
    const {translate} = useLocalize();

    const copyToClipboard = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
        Clipboard.setString(urlToCopy || text);
    }, [text, urlToCopy]);

    return (
        <PressableWithDelayToggle
            text={text}
            tooltipText={translate('reportActionContextMenu.copyToClipboard')}
            tooltipTextChecked={translate('reportActionContextMenu.copied')}
            icon={Expensicons.Copy}
            textStyles={textStyles}
            onPress={copyToClipboard}
            accessible
            accessibilityLabel={translate('reportActionContextMenu.copyToClipboard')}
            accessibilityRole={accessibilityRole}
        />
    );
}

CopyTextToClipboard.displayName = 'CopyTextToClipboard';

export default CopyTextToClipboard;
