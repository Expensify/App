import * as Composer from '../actions/Composer';

export default (reportActionID, showComposer) => {
    Composer.setShouldShowComposeInput(reportActionID, showComposer);
};
