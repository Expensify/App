import React from 'react';
import type {PropsWithChildren} from 'react';
import {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ComposerContainer from './ComposerContainer';
import {useComposerState} from './ComposerContext';
import ComposerImportedState from './ComposerImportedState';
import ComposerLocalTime from './ComposerLocalTime';

function ComposerLayout({children}: PropsWithChildren) {
    const {reportID} = useComposerState();
    const styles = useThemeStyles();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    return (
        <View
            testID={CONST.COMPOSER.TEST_ID.REPORT_ACTION_COMPOSE}
            style={[isComposerFullSize && styles.chatItemFullComposeRow]}
        >
            <ComposerLocalTime />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ComposerContainer>{children}</ComposerContainer>
                <ComposerImportedState />
            </View>
        </View>
    );
}

export default ComposerLayout;
