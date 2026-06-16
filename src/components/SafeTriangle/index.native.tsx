import type SafeTriangleProps from './types';

/**
 * A component that provides a "safe triangle" wrapper.
 * On native platforms, hover interactions are not applicable, so this is a no-op wrapper.
 */
function SafeTriangle({children}: SafeTriangleProps) {
    return children;
}

export default SafeTriangle;
