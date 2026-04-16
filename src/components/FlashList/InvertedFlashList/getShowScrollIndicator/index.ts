import type GetShowScrollIndicator from './types';

const getShowScrollIndicator: GetShowScrollIndicator = (shouldScrollToEndAfterLayout) => !shouldScrollToEndAfterLayout;

export default getShowScrollIndicator;
