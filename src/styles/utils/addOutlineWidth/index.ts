/**
 * Web and desktop platforms support the "addOutlineWidth" property, so it
 * can be added to the object
 */
import type AddOutlineWidth from './types';

/**
 * Adds the addOutlineWidth property to an object to be used when styling
 */
const addOutlineWidth: AddOutlineWidth = (theme, obj, val, hasError = false) => ({
    ...obj,
    outlineWidth: val,
    outlineStyle: val ? 'auto' : 'none',
    boxShadow: val !== 0 ? `0px 0px 0px ${val}px ${hasError ? theme.danger : theme.borderFocus}` : 'none',
});

export default addOutlineWidth;
