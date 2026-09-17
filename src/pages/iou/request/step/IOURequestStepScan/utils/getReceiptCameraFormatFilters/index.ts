/**
 * Builds the filter list that picks which camera format the receipt scanner runs at.
 */
import type GetReceiptCameraFormatFilters from './types';

// Only the native camera reads these, so there is nothing to choose between on web.
const getReceiptCameraFormatFilters: GetReceiptCameraFormatFilters = () => [];

export default getReceiptCameraFormatFilters;
