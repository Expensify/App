import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getReportOfflinePendingActionAndErrors} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {PropsWithChildren} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import {useComposerState} from './ComposerContext';

function ComposerContainer({children}: PropsWithChildren) {
    const {reportID} = useComposerState();
    const styles = useThemeStyles();
    const [pendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: reportPendingActionSelector});
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    return (
        <OfflineWithFeedback
            shouldDisableOpacity
            pendingAction={pendingAction}
            style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
            contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
        >
            {children}
        </OfflineWithFeedback>
    );
}

/** The composer only shows whether the report itself is pending, so other report writes don't re-render it. */
function reportPendingActionSelector(report: OnyxEntry<Report>) {
    return getReportOfflinePendingActionAndErrors(report).reportPendingAction;
}

export default ComposerContainer;
