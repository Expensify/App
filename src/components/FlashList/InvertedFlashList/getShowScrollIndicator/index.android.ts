import type GetShowScrollIndicator from './types';

// On Android, the scroll indicator appears on the left side due to a known FlashList issue with inverted lists.
// See: https://shopify.github.io/flash-list/docs/usage#inverted
// So we hide it.
const getShowScrollIndicator: GetShowScrollIndicator = () => false;

export default getShowScrollIndicator;
