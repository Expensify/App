/**
 * Native platforms don't support the "addOutlineWidth" property, so this
 * function is a no-op
 */
import type AddOutlineWidth from './types';

const addOutlineWidth: AddOutlineWidth = (_theme, obj) => obj;

export default addOutlineWidth;
