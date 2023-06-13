import * as Composer from '../actions/Composer';

export default (reportActionID) => {
    Composer.setShouldShowComposeInput(reportActionID, true);
};
