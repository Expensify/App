/**
 * Utility functions for generating receipt image URLs.
 *
 * The original implementation incorrectly generated URLs for the
 * enlarged view by appending a different query parameter that
 * caused the server to return a cached image with stale mileage
 * data.  The new implementation uses a consistent query string
 * for both preview and enlarged images.
 */

const BASE_URL = 'https://api.expensify.com/receipts';

/**
 * Build the URL for a receipt image.
 *
 * @param {string} receiptId
 * @param {boolean} isLarge - true for the enlarged image
 * @returns {string}
 */
export const getReceiptImageUrl = (receiptId, isLarge) => {
  const size = isLarge ? 'large' : 'preview';
  // The server expects the size parameter to be part of the path.
  return `${BASE_URL}/${receiptId}/${size}.png`;
};
