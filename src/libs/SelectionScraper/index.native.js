import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import BaseSelectionScraper from './BaseSelectionScraper';

/**
 * Resolves the selection to values for the platform.
 * @param {Object} selectedHtml html to parse
 * @returns {Object} selection for native
 */
const getCustomSelection = (selectedHtml) => {
    if (!selectedHtml) {
        return null;
    }
    const newHtml = BaseSelectionScraper.getCustomSelectionAsHtml(selectedHtml);
    const parser = new ExpensiMark();
    const text = parser.htmlToMarkdown(newHtml);
    return {text};
};

export default {
    // This is a no-op function for native devices because they wouldn't be able to support Selection API like a website.
    getCurrentSelection: () => {},
    getCustomSelection,
};
