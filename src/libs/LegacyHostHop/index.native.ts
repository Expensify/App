/**
 * Native apps don't run on a web host, so there is nothing to move.
 */
import type {HopToSharedHost, ShouldHopToSharedHost} from './types';

const shouldHopToSharedHost: ShouldHopToSharedHost = () => false;

const hopToSharedHost: HopToSharedHost = () => Promise.resolve(false);

export {shouldHopToSharedHost, hopToSharedHost};
