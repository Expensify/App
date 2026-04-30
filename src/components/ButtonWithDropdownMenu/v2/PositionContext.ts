import {createContext, use} from 'react';

/** Render-order index so the registry sorts deterministically across conditional remounts. */
const PositionContext = createContext<number | undefined>(undefined);
PositionContext.displayName = 'ButtonWithDropdownMenuV2.PositionContext';

function useChildPosition(consumerName: string): number {
    const value = use(PositionContext);
    if (value === undefined) {
        throw new Error(`<${consumerName}> must be rendered as a direct child of <ButtonWithDropdownMenuV2.Menu> or <ButtonWithDropdownMenuV2.Submenu>`);
    }
    return value;
}

export {PositionContext, useChildPosition};
