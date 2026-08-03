import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Clipboard from '@libs/Clipboard';

import CONST from '@src/CONST';

import type {AccessibilityRole, StyleProp, TextStyle} from 'react-native';

import React, {useCallback} from 'react';

import type {PressableWithDelayToggleProps} from './Pressable/PressableWithDelayToggle';

import PressableWithDelayToggle from './Pressable/PressableWithDelayToggle';

type CopyTextToClipboardProps = {
    /** The text to display and copy to the clipboard */
    text?: string;

    /** Styles to apply to the text */
    textStyles?: StyleProp<TextStyle>;

    urlToCopy?: string;

    accessibilityRole?: AccessibilityRole;
} & Pick<PressableWithDelayToggleProps, 'iconStyles' | 'iconSize' | 'styles' | 'shouldUseButtonBackground' | 'shouldHaveActiveBackground' | 'inline'>;

function CopyTextToClipboard({
    text,
    textStyles,
    urlToCopy,
    accessibilityRole,
    iconStyles,
    iconSize,
    shouldHaveActiveBackground,
    shouldUseButtonBackground,
    styles,
    inline,
}: CopyTextToClipboardProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Copy']);

    const copyToClipboard = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing doesn't achieve the same result in this case
        Clipboard.setString(urlToCopy || text || '');
    }, [text, urlToCopy]);

    return (
        <PressableWithDelayToggle
            text={text}
            tooltipText={translate('common.copyToClipboard')}
            tooltipTextChecked={translate('common.copied')}
            icon={icons.Copy}
            textStyles={textStyles}
            onPress={copyToClipboard}
            accessible
            accessibilityLabel={translate('common.copyToClipboard')}
            accessibilityRole={accessibilityRole}
            sentryLabel={CONST.SENTRY_LABEL.COPY_TEXT_TO_CLIPBOARD.COPY_BUTTON}
            shouldHaveActiveBackground={shouldHaveActiveBackground}
            iconSize={iconSize}
            iconStyles={iconStyles}
            styles={styles}
            shouldUseButtonBackground={shouldUseButtonBackground}
            inline={inline}
        />
    );
}

export default CopyTextToClipboard;
