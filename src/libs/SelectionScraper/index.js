import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import _ from 'lodash';
import BaseSelectionScraper from './BaseSelectionScraper';

/**
 * Resolves the selection to values for the platform.
 * @param {Object} selectedHtml html to parse
 * @returns {Object} selection for web
 */
const getCustomSelection = (selectedHtml) => {
    if (!selectedHtml) {
        return null;
    }
    const html = BaseSelectionScraper.getCustomSelectionAsHtml(selectedHtml);
    const parser = new ExpensiMark();

    // If rich types are supported on web, produce them.
    if (_.get(navigator, 'clipboard.write')) {
        const text = parser.htmlToText(html);
        return {text, html};
    }

    // Otherwise, produce MD.
    const text = parser.htmlToMarkdown(html);
    return {text};
};

/**
 * Resolves the selection to values for the platform.
 * @returns {Object} selection for web
 */
const getCurrentSelection = () => {
    const newHtml = BaseSelectionScraper.getCurrentSelectionAsHtml();
    if (!newHtml) {
        return null;
    }
    return getCustomSelection(newHtml);
};

export default {
    getCurrentSelection,
    getCustomSelection,
};
