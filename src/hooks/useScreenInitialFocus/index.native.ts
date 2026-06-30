import type UseScreenInitialFocus from './types';

// Native handles back-button focus via TalkBack / VoiceOver's own screen-mount announcement; no JS work needed.
const useScreenInitialFocus: UseScreenInitialFocus = () => {};

export default useScreenInitialFocus;
