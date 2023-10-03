import GetNumberOfLines from './types';

/**
 * Get the current number of lines in the composer
 */
const getNumberOfLines: GetNumberOfLines = (lineHeight, paddingTopAndBottom, scrollHeight, maxLines = 0) => {
    let newNumberOfLines = Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);
    newNumberOfLines = maxLines <= 0 ? newNumberOfLines : Math.min(newNumberOfLines, maxLines);
    return newNumberOfLines;
};

export default getNumberOfLines;
