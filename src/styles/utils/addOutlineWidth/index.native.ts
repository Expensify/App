/**
 * Native platforms don't support the "addOutlineWidth" property, so this
 * function is a no-op
 */
import type AddOutlineWidth from './types';

// eslint-disable-next-line @typescript-eslint/naming-convention
const addOutlineWidth: AddOutlineWidth = (_theme, obj) => obj;

export default addOutlineWidth;
