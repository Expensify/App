import type {RHPWidth} from '..';

// Wide/Super-Wide RHP is not displayed on native platforms.
const useRHPWidth: (width: RHPWidth) => void = () => {};

export default useRHPWidth;
