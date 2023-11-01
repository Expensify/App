import GetNumberOfLines from './types';

/**
 * Get the current number of lines in the composer
 */
const getNumberOfLines: GetNumberOfLines = (lineHeight, paddingTopAndBottom, scrollHeight) => Math.ceil((scrollHeight - paddingTopAndBottom) / lineHeight);

export default getNumberOfLines;
