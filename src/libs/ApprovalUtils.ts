import * as Expensicons from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type IconAsset from '@src/types/utils/IconAsset';

type ApprovalOption = {
    value: string;
    text: string;
    icon: IconAsset;
    onSelected: () => void;
};

type ApprovalDropdownOptions = {
    options: ApprovalOption[];
    menuHeaderText: string;
    shouldShowDropdown: boolean;
};

/**
 * Generates dropdown options for approve button when there are held expenses
 */
function getApprovalDropdownOptions(
    nonHeldAmount: string | undefined,
    fullAmount: string,
    hasValidNonHeldAmount: boolean,
    hasOnlyHeldExpenses: boolean,
    onApprovePartial: () => void,
    onApproveFull: () => void,
    translate: LocaleContextProps['translate'],
): ApprovalDropdownOptions {
    const options: ApprovalOption[] = [];

    if (nonHeldAmount && hasValidNonHeldAmount && !hasOnlyHeldExpenses) {
        options.push({
            value: 'approve_partial',
            text: `${translate('iou.approveOnly')} ${nonHeldAmount}`,
            icon: Expensicons.ThumbsUp,
            onSelected: onApprovePartial,
        });
    }

    options.push({
        value: 'approve_full',
        text: `${translate('iou.approve')} ${fullAmount}`,
        icon: Expensicons.DocumentCheck,
        onSelected: onApproveFull,
    });

    const shouldShowDropdown = options.length > 1;

    return {
        options,
        menuHeaderText: translate('iou.confirmApprovalWithHeldAmount'),
        shouldShowDropdown,
    };
}

export default getApprovalDropdownOptions;
export type {ApprovalOption, ApprovalDropdownOptions};
