import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {PropsWithChildren} from 'react';

import React from 'react';
import {View} from 'react-native';

import ComposerActionButton from './ComposerActionButton';
import ComposerBox from './ComposerBox';
import ComposerContainer from './ComposerContainer';
import {useComposerActions, useComposerState} from './ComposerContext';
import ComposerDropZone from './ComposerDropZone';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerSendButton from './ComposerSendButton';

function ComposerInputArea({children}: PropsWithChildren) {
    const styles = useThemeStyles();
    const {reportID} = useComposerState();
    const {onLayout} = useComposerActions();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    return (
        <View
            testID={CONST.COMPOSER.TEST_ID.REPORT_ACTION_COMPOSE}
            onLayout={onLayout}
            style={[isComposerFullSize && styles.chatItemFullComposeRow]}
        >
            <ComposerLocalTime />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ComposerContainer>
                    <ComposerDropZone>
                        <ComposerBox>
                            <ComposerActionButton />
                            <ComposerInput />
                            <ComposerEmojiPicker />
                            <ComposerSendButton />
                        </ComposerBox>
                    </ComposerDropZone>
                    {children}
                </ComposerContainer>
                <ComposerImportedState />
            </View>
        </View>
    );
}

export default ComposerInputArea;
