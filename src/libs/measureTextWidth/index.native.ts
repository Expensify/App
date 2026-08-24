import type {CanMeasureText, MeasureTextWidth} from './types';

/**
 * Native has no synchronous text measurement API, so nothing is measured here and callers keep their
 * content-independent layout. This deliberately leaves native layouts untouched.
 */
const measureTextWidth: MeasureTextWidth = () => null;

const canMeasureText: CanMeasureText = () => false;

export default measureTextWidth;
export {canMeasureText};
