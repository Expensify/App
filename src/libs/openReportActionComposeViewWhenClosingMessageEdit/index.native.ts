import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';
import OpenReportActionComposeViewWhenClosingVMessageEdit from './types';

const openReportActionComposeViewWhenClosingVMessageEdit: OpenReportActionComposeViewWhenClosingVMessageEdit = () => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Composer.setShouldShowComposeInput(true);
        keyboardDidHideListener.remove();
    });
};

export default openReportActionComposeViewWhenClosingVMessageEdit;
