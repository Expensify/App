import {isMobile} from '@libs/Browser';

const DELAY_FACTOR = isMobile() ? 1 : 0.5;

export default {};

export {DELAY_FACTOR};
