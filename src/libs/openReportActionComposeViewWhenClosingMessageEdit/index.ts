import * as Composer from '../actions/Composer';
import OpenReportActionComposeViewWhenClosingVMessageEdit from './types';

const openReportActionComposeViewWhenClosingVMessageEdit: OpenReportActionComposeViewWhenClosingVMessageEdit = () => {
    Composer.setShouldShowComposeInput(true);
};

export default openReportActionComposeViewWhenClosingVMessageEdit;
