import type {IsCurrentTargetInsideContainerType} from './types';

// The related target check is not required here because in native there is no race condition rendering like on the web
const isCurrentTargetInsideContainer: IsCurrentTargetInsideContainerType = () => false;

export default isCurrentTargetInsideContainer;
