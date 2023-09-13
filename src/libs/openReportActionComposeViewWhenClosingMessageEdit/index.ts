import * as Composer from '../actions/Composer';
import OpenReportActionComposeViewWhenClosingMessageEdit from './types';

const openReportActionComposeViewWhenClosingVMessageEdit: OpenReportActionComposeViewWhenClosingMessageEdit = () => {
    Composer.setShouldShowComposeInput(true);
};

export default openReportActionComposeViewWhenClosingVMessageEdit;
