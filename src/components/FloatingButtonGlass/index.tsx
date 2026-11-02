import type FloatingButtonGlassProps from './types';

/** Liquid glass exists only on iOS 26, so other platforms keep the solid buttons. */
const isFloatingButtonGlassAvailable = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the props only match the iOS signature, since this stub renders nothing
function FloatingButtonGlass(props: FloatingButtonGlassProps) {
    return null;
}

export default FloatingButtonGlass;
export {isFloatingButtonGlassAvailable};
