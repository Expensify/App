import type LightboxConcurrencyLimit from './types';

// On iOS we can allow multiple lightboxes to be rendered at the same time.
// This enables faster time to interaction when swiping between pages in the carousel.
// When the lightbox is pre-rendered, we don't need to wait for the gestures to initialize.
const NUMBER_OF_CONCURRENT_LIGHTBOXES: LightboxConcurrencyLimit = 3;

export default NUMBER_OF_CONCURRENT_LIGHTBOXES;
