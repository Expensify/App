// iOS strategy: convert the multi-select sequentially so at most one heavy HEIC decode is alive at a time.
import processAssets from './sequential';

export default processAssets;
