/**
 * This is a no-op component for native devices because they wouldn't be able to support Selection API like
 * a website.
 */
const SelectionParser = {
    getAsMarkdown: () => '',
};

export default SelectionParser;
