import {useId} from 'react';
import CONST from '@src/CONST';

type MenuOrientation = 'vertical' | 'horizontal';

type UseMenuInput = {
    contentID?: string;
    triggerID?: string;
    accessibilityLabel?: string;
    orientation?: MenuOrientation;
};

type UseMenuResult = {
    menuProps: {
        role: typeof CONST.ROLE.MENU;
        nativeID: string;
        accessibilityLabel?: string;
        accessibilityLabelledBy?: string;
        // eslint-disable-next-line @typescript-eslint/naming-convention -- WAI-ARIA attribute name.
        'aria-orientation': MenuOrientation;
    };
};

function useMenu({contentID: contentIDProp, triggerID, accessibilityLabel, orientation = 'vertical'}: UseMenuInput = {}): UseMenuResult {
    const generatedContentID = useId();
    const contentID = contentIDProp ?? generatedContentID;
    return {
        menuProps: {
            role: CONST.ROLE.MENU,
            nativeID: contentID,
            accessibilityLabel,
            accessibilityLabelledBy: triggerID,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- WAI-ARIA attribute name.
            'aria-orientation': orientation,
        },
    };
}

export default useMenu;
export type {MenuOrientation, UseMenuInput, UseMenuResult};
