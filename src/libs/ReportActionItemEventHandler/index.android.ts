import {InteractionManager} from 'react-native';
import type ReportActionItemEventHandler from './types';

const reportActionItemEventHandler: ReportActionItemEventHandler = {
    handleComposerLayoutChange: (reportScrollManager, index) => () => {
        InteractionManager.runAfterInteractions(() => {
            requestAnimationFrame(() => {
                reportScrollManager.scrollToIndex(index, true);
            });
        });
    },
};

export default reportActionItemEventHandler;
