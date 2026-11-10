import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

/** The label of an option in a group named after a question. Native drops the group's name, since the group is not one element, so each option carries the question. */
function getGroupItemAccessibilityLabel(label: string, groupLabel: string | undefined): string {
    if (!groupLabel || getPlatform() === CONST.PLATFORM.WEB) {
        return label;
    }
    return `${label}, ${groupLabel}`;
}

export default getGroupItemAccessibilityLabel;
