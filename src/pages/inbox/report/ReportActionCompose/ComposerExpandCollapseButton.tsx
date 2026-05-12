import React from 'react';
import type {ViewProps} from 'react-native';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useOnyx from '@hooks/useOnyx';
import {setIsComposerFullSize} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import {useComposerSendState, useComposerState} from './ComposerContext';
import ExpandCollapseButton from './ExpandCollapseButton';

type ComposerExpandCollapseButtonProps = ViewProps & {
    /** The report ID */
    reportID: string;
};

function ComposerExpandCollapseButton({reportID, ...restProps}: ComposerExpandCollapseButtonProps) {
    const {isBlockedFromConcierge} = useComposerSendState();
    const {raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {isFullComposerAvailable} = useComposerState();

    return (
        <ExpandCollapseButton
            isFullComposerAvailable={isFullComposerAvailable}
            isComposerFullSize={isComposerFullSize}
            reportID={reportID}
            raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLayoutTriggered}
            setIsComposerFullSize={setIsComposerFullSize}
            disabled={isBlockedFromConcierge}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
        />
    );
}

export default ComposerExpandCollapseButton;
