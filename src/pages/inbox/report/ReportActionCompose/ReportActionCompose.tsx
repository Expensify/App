import React from 'react';
import {View} from 'react-native';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerFooter from './ComposerFooter';
import ComposerInputWrapper from './ComposerInputWrapper';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';

type ReportActionComposeProps = {
    reportID: string;
};

function Composer({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    return (
        <View style={[styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerProvider reportID={reportID}>
                <Composer.LocalTime reportID={reportID} />
                <View style={isComposerFullSize ? styles.flex1 : {}}>
                    <Composer.DropZone reportID={reportID}>
                        <Composer.Box reportID={reportID}>
                            <Composer.ActionMenu reportID={reportID} />
                            <Composer.Input reportID={reportID} />
                            <Composer.EmojiPicker reportID={reportID} />
                            <Composer.SendButton />
                        </Composer.Box>
                    </Composer.DropZone>
                    <Composer.Footer reportID={reportID} />
                    {!isSmallScreenWidth && (
                        <View style={[styles.mln5, styles.mrn5]}>
                            <ImportedStateIndicator />
                        </View>
                    )}
                </View>
            </ComposerProvider>
        </View>
    );
}

Composer.LocalTime = ComposerLocalTime;
Composer.Box = ComposerBox;
Composer.DropZone = ComposerDropZone;
Composer.ActionMenu = ComposerActionMenu;
Composer.Input = ComposerInputWrapper;
Composer.EmojiPicker = ComposerEmojiPicker;
Composer.SendButton = ComposerSendButton;
Composer.Footer = ComposerFooter;

export default Composer;
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
