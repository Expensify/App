import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type ReportActionItemEventHandler from './types';

const reportActionItemEventHandler: ReportActionItemEventHandler = {
    handleComposerLayoutChange: (reportScrollManager, index) => () => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                requestAnimationFrame(() => {
                    reportScrollManager.scrollToIndex(index, true);
                });
            },
        });
    },
};

export default reportActionItemEventHandler;
