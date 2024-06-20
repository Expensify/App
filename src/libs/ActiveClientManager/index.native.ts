/**
 * For native devices, there will never be more than one
 * client running at a time, so this lib is a big no-op
 */
import type {Init, IsClientTheLeader, IsReady} from './types';

const init: Init = () => {};

const isClientTheLeader: IsClientTheLeader = () => true;

const isReady: IsReady = () => Promise.resolve();

export {init, isClientTheLeader, isReady};
