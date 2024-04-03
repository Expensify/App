import {isMobile} from '@libs/Browser';

const DELAY_FACTOR = isMobile() ? 1 : 0.2;
export default {};

export {DELAY_FACTOR};
