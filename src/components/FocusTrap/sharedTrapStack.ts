import type {FocusTrap as FocusTrapHandler} from 'focus-trap';

// focus-trap is capable of managing many traps. It's necessary for RHP and modals
const trapStack: FocusTrapHandler[] = [];

export default trapStack;
