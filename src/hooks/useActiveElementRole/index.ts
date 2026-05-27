import {useContext} from 'react';
import {ActiveElementRoleContext} from '@components/ActiveElementRoleProvider';
import type UseActiveElementRole from './types';

/**
 * Returns the focused element's role, or null if the focus is programmatic (a11y restore).
 * Role-based consumers (e.g., `Button` enter-shortcut suppression) want to react to user-driven focus only.
 */
const useActiveElementRole: UseActiveElementRole = () => {
    const {role, isProgrammatic} = useContext(ActiveElementRoleContext);
    return isProgrammatic ? null : role;
};

export default useActiveElementRole;
