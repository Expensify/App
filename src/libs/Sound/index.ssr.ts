/**
 * Sounds are a no-op in SSR.
 */
import {SOUNDS} from './BaseSound';

const playSound = () => {};
const clearSoundAssetsCache = () => {};

export {SOUNDS, clearSoundAssetsCache};
export default playSound;
