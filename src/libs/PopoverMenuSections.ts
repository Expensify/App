import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';

import CONST from '@src/CONST';

const REPORT_SECONDARY_ACTIONS = CONST.REPORT.SECONDARY_ACTIONS;
const TRANSACTION_SECONDARY_ACTIONS = CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS;
const UNRECOGNIZED_SECTION = Number.MAX_SAFE_INTEGER;

const REPORT_MORE_MENU_SECTIONS = [
    [
        REPORT_SECONDARY_ACTIONS.PAY,
        REPORT_SECONDARY_ACTIONS.ADD_EXPENSE,
        REPORT_SECONDARY_ACTIONS.HOLD,
        REPORT_SECONDARY_ACTIONS.REMOVE_HOLD,
        REPORT_SECONDARY_ACTIONS.SUBMIT,
        REPORT_SECONDARY_ACTIONS.RETRACT,
        REPORT_SECONDARY_ACTIONS.REOPEN,
        REPORT_SECONDARY_ACTIONS.REJECT,
        REPORT_SECONDARY_ACTIONS.APPROVE,
        REPORT_SECONDARY_ACTIONS.UNAPPROVE,
        REPORT_SECONDARY_ACTIONS.CANCEL_PAYMENT,
    ],
    [REPORT_SECONDARY_ACTIONS.SPLIT, REPORT_SECONDARY_ACTIONS.MERGE, REPORT_SECONDARY_ACTIONS.DUPLICATE_EXPENSE, REPORT_SECONDARY_ACTIONS.MOVE_EXPENSE],
    [REPORT_SECONDARY_ACTIONS.DUPLICATE_REPORT, REPORT_SECONDARY_ACTIONS.CHANGE_WORKSPACE, REPORT_SECONDARY_ACTIONS.CHANGE_APPROVER],
    [REPORT_SECONDARY_ACTIONS.EXPORT, REPORT_SECONDARY_ACTIONS.DOWNLOAD_PDF, REPORT_SECONDARY_ACTIONS.PRINT],
    [REPORT_SECONDARY_ACTIONS.VIEW_DETAILS, REPORT_SECONDARY_ACTIONS.DELETE],
];

const TRANSACTION_MORE_MENU_SECTIONS = [
    [
        TRANSACTION_SECONDARY_ACTIONS.HOLD,
        TRANSACTION_SECONDARY_ACTIONS.REMOVE_HOLD,
        TRANSACTION_SECONDARY_ACTIONS.REJECT,
        TRANSACTION_SECONDARY_ACTIONS.SPLIT,
        TRANSACTION_SECONDARY_ACTIONS.MERGE,
    ],
    [TRANSACTION_SECONDARY_ACTIONS.DUPLICATE, TRANSACTION_SECONDARY_ACTIONS.MOVE_EXPENSE],
    [TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS, TRANSACTION_SECONDARY_ACTIONS.DELETE],
];

function buildSectionOrder(sectionDefinitions: ReadonlyArray<readonly string[]>) {
    return new Map(sectionDefinitions.flatMap((section, sectionIndex) => section.map((action) => [action, sectionIndex])));
}

function sortAndSectionPopoverMenuItems<TValue extends string, TItem extends DropdownOption<TValue>>(items: TItem[], sectionDefinitions: ReadonlyArray<readonly string[]>): TItem[] {
    const sectionOrder = buildSectionOrder(sectionDefinitions);
    const sortedItems = items
        .map((item, originalIndex) => ({item, originalIndex, sectionIndex: sectionOrder.get(item.value) ?? UNRECOGNIZED_SECTION}))
        .sort((firstItem, secondItem) => firstItem.sectionIndex - secondItem.sectionIndex || firstItem.originalIndex - secondItem.originalIndex);

    let lastSectionIndex: number | undefined;
    return sortedItems.map(({item, sectionIndex}) => {
        const shouldAddSeparator = lastSectionIndex !== undefined && sectionIndex !== lastSectionIndex;

        lastSectionIndex = sectionIndex;

        if (!shouldAddSeparator) {
            return item;
        }

        return {...item, addSeparatorBefore: true};
    });
}

export {REPORT_MORE_MENU_SECTIONS, TRANSACTION_MORE_MENU_SECTIONS, sortAndSectionPopoverMenuItems};
