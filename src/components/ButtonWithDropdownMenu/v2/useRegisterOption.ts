import {useId, useLayoutEffect} from 'react';
import {useChildPosition, useMenuRegistryActions, useSubmenuParentId} from './MenuContext';
import type {DropdownOptionV2Props, DropdownSubmenuV2Props} from './types';

function useRegisterOption(props: DropdownOptionV2Props): void {
    const id = useId();
    const actions = useMenuRegistryActions('ButtonWithDropdownMenuV2.Option');
    const parentSubmenuId = useSubmenuParentId();
    const position = useChildPosition('ButtonWithDropdownMenuV2.Option');

    useLayoutEffect(() => {
        actions.registerItem({id, kind: 'option', parentSubmenuId, position, props});
        return () => actions.unregisterItem(id);
    }, [id, parentSubmenuId, position, actions, props]);
}

function useRegisterSubmenu(props: DropdownSubmenuV2Props): string {
    const id = useId();
    const actions = useMenuRegistryActions('ButtonWithDropdownMenuV2.Submenu');
    const enclosingSubmenuId = useSubmenuParentId();
    const position = useChildPosition('ButtonWithDropdownMenuV2.Submenu');

    if (enclosingSubmenuId !== undefined && process.env.NODE_ENV !== 'production') {
        throw new Error('<ButtonWithDropdownMenuV2.Submenu> cannot be nested inside another <Submenu>. Only one level of nesting is supported.');
    }

    useLayoutEffect(() => {
        actions.registerItem({id, kind: 'submenu', parentSubmenuId: undefined, position, props});
        return () => actions.unregisterItem(id);
    }, [id, position, actions, props]);

    return id;
}

export {useRegisterOption, useRegisterSubmenu};
