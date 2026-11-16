import {createContext} from 'react';

/**
 * Whether the fields render inside a modal, such as the list entry editor. A dropdown's container draws below every
 * modal, so a dropdown inside one opens its list on a full page over the modal instead.
 */
const DynamicFormModalContext = createContext(false);

export default DynamicFormModalContext;
