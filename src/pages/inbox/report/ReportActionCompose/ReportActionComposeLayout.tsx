import React from 'react';
import {View} from 'react-native';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ComposerImportedState from './ComposerImportedState';
import ComposerLocalTime from './ComposerLocalTime';
import ReportActionComposerContainer from './ReportActionComposerContainer';
import type {ReportActionComposeWithChildrenProps} from './ReportActionComposeTypes';

function ReportActionComposeLayout({reportID, children}: ReportActionComposeWithChildrenProps) {
    const styles = useThemeStyles();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    return (
        <View
            testID={CONST.COMPOSER.TEST_ID.REPORT_ACTION_COMPOSE}
            style={[isComposerFullSize && styles.chatItemFullComposeRow]}
        >
            <ComposerLocalTime reportID={reportID} />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ReportActionComposerContainer reportID={reportID}>{children}</ReportActionComposerContainer>
                <ComposerImportedState />
            </View>
        </View>
    );
}

export default ReportActionComposeLayout;
