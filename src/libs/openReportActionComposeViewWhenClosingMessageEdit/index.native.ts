import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';
import OpenReportActionComposeViewWhenClosingMessageEdit from './types';

const openReportActionComposeViewWhenClosingVMessageEdit: OpenReportActionComposeViewWhenClosingMessageEdit = () => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Composer.setShouldShowComposeInput(true);
        keyboardDidHideListener.remove();
    });
};

export default openReportActionComposeViewWhenClosingVMessageEdit;
