import {useId, useLayoutEffect} from 'react';
import {useMenuRegistryActions} from './MenuRegistryActionsContext';
import {useChildPosition} from './PositionContext';
import {useSubmenuParentID} from './SubmenuParentContext';
import type {DropdownOptionV2Props, DropdownSubmenuV2Props} from './types';

function useRegisterOption(props: DropdownOptionV2Props): void {
    const id = useId();
    const actions = useMenuRegistryActions('ButtonWithDropdownMenuV2.Option');
    const parentSubmenuID = useSubmenuParentID();
    const position = useChildPosition('ButtonWithDropdownMenuV2.Option');

    useLayoutEffect(() => {
        actions.registerItem({id, kind: 'option', parentSubmenuID, position, props});
        return () => actions.unregisterItem(id);
    }, [id, parentSubmenuID, position, actions, props]);
}

function useRegisterSubmenu(props: DropdownSubmenuV2Props): string {
    const id = useId();
    const actions = useMenuRegistryActions('ButtonWithDropdownMenuV2.Submenu');
    const enclosingSubmenuID = useSubmenuParentID();
    const position = useChildPosition('ButtonWithDropdownMenuV2.Submenu');

    if (enclosingSubmenuID !== undefined && process.env.NODE_ENV !== 'production') {
        throw new Error('<ButtonWithDropdownMenuV2.Submenu> cannot be nested inside another <Submenu>. Only one level of nesting is supported.');
    }

    useLayoutEffect(() => {
        actions.registerItem({id, kind: 'submenu', parentSubmenuID: undefined, position, props});
        return () => actions.unregisterItem(id);
    }, [id, position, actions, props]);

    return id;
}

export {useRegisterOption, useRegisterSubmenu};
