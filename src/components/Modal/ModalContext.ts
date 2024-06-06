import {createContext} from 'react';
import type ModalType from '@src/types/utils/ModalType';

type ModalContextType = {
    // The type of the currently displayed modal, or undefined if there is no currently displayed modal.
    // Note that React Native can only display one modal at a time.
    activeModalType?: ModalType;
};

// This context is meant to inform modal children that they are rendering in a modal (and what type of modal they are rendering in)
// Note that this is different than ONYXKEYS.MODAL.isVisible data point in that that is a global variable for whether a modal is visible or not,
// whereas this context is provided by the BaseModal component, and thus is only available to components rendered inside a modal.
const ModalContext = createContext<ModalContextType>({});

export default ModalContext;
