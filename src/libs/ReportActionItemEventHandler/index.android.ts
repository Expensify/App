import {InteractionManager} from 'react-native';
import type ReportActionItemEventHandler from './types';

const reportActionItemEventHandler: ReportActionItemEventHandler = {
    handleComposerLayoutChange: (reportScrollManager, index) => () => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                reportScrollManager.scrollToIndex(index, true);
            });
        });
    },
};

export default reportActionItemEventHandler;
