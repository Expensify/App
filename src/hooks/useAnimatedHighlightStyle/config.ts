import {isMobile} from '@libs/Browser';

// It takes varying amount of time to navigate to a new page on mobile and desktop
// This variable takes that into account
const DELAY_FACTOR = isMobile() ? 1 : 0.2;
export default {};

export {DELAY_FACTOR};
