import {createContext, use} from 'react';

/** Nearest enclosing `<Submenu>`'s id; descendant `<Option>`s scope to it. */
const SubmenuParentContext = createContext<string | undefined>(undefined);
SubmenuParentContext.displayName = 'ButtonWithDropdownMenuV2.SubmenuParentContext';

function useSubmenuParentID(): string | undefined {
    return use(SubmenuParentContext);
}

export {SubmenuParentContext, useSubmenuParentID};
