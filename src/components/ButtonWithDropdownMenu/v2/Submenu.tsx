import React from 'react';
import PositionedChildren from './PositionedChildren';
import {SubmenuParentContext} from './SubmenuParentContext';
import type {DropdownSubmenuV2Props} from './types';
import {useRegisterSubmenu} from './useRegisterOption';

function Submenu(props: DropdownSubmenuV2Props): React.ReactElement {
    const id = useRegisterSubmenu(props);
    return (
        <SubmenuParentContext.Provider value={id}>
            <PositionedChildren>{props.children}</PositionedChildren>
        </SubmenuParentContext.Provider>
    );
}

Submenu.displayName = 'ButtonWithDropdownMenuV2.Submenu';

export default Submenu;
