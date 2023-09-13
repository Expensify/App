import * as Composer from '../actions/Composer';
import OpenReportActionComposeViewWhenClosingMessageEdit from './types';

const openReportActionComposeViewWhenClosingMessageEdit: OpenReportActionComposeViewWhenClosingMessageEdit = () => {
    Composer.setShouldShowComposeInput(true);
};

export default openReportActionComposeViewWhenClosingMessageEdit;
