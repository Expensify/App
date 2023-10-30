/**
 * Native platforms don't support the "addOutlineWidth" property, so this
 * function is a no-op
 */

import AddOutlineWidth from './types';

const addOutlineWidth: AddOutlineWidth = (obj) => obj;

export default addOutlineWidth;
