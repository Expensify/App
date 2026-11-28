import type UseVerticalBarBackButton from './types';

/** Only iOS has a vertical bar, so elsewhere a header's own back button is the only one. */
const useVerticalBarBackButton: UseVerticalBarBackButton = () => false;

export default useVerticalBarBackButton;
