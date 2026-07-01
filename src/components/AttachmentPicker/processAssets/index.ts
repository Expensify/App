// Default (non-iOS) strategy: convert the whole multi-select concurrently. iOS overrides this with
// sequential processing via index.ios.ts to avoid OOMing on simultaneous HEIC decodes.
import processAssets from './concurrent';

export default processAssets;
