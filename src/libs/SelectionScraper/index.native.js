import BaseSelectionScraper from './base';

const SelectionParser = {
    // This is a no-op function for native devices because they wouldn't be able to support Selection API like a website.
    getAsTypes: () => {},
    getCustomAsTypes: BaseSelectionScraper.getCustomAsTypes,
};

export default SelectionParser;
