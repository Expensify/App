import {formatMemberForList} from '@libs/OptionsListUtils';
import type {MemberForList, SearchOptionData} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';

function areSameRoomInviteOption(left?: Partial<OptionData>, right?: Partial<OptionData>) {
    if (!left || !right) {
        return false;
    }

    if (left.accountID && left.accountID === right.accountID) {
        return true;
    }

    if (left.reportID && left.reportID === right.reportID) {
        return true;
    }

    if (left.login && left.login === right.login) {
        return true;
    }

    return false;
}

function areRoomInviteSelectionsEqual(left: OptionData[], right: OptionData[]) {
    if (left === right) {
        return true;
    }

    if (left.length !== right.length) {
        return false;
    }

    return left.every((option, index) => areSameRoomInviteOption(option, right.at(index)));
}

function rehydrateRoomInviteSelectedOptions(selectedOptions: OptionData[], invitePersonalDetails: SearchOptionData[]) {
    if (selectedOptions.length === 0) {
        return selectedOptions;
    }

    const detailsMap = new Map<string, MemberForList>();
    for (const detail of invitePersonalDetails) {
        if (!detail.login) {
            continue;
        }

        detailsMap.set(detail.login, formatMemberForList(detail));
    }

    let hasChanges = false;
    const hydratedOptions = selectedOptions.map((option) => {
        if (!option.login) {
            return option;
        }

        const latestMemberDetails = detailsMap.get(option.login);
        if (!latestMemberDetails) {
            return option;
        }

        const nextOption = {
            ...option,
            ...latestMemberDetails,
            isSelected: true,
            selected: true,
        };

        if (
            option.keyForList !== nextOption.keyForList ||
            option.text !== nextOption.text ||
            option.alternateText !== nextOption.alternateText ||
            option.accountID !== nextOption.accountID ||
            option.login !== nextOption.login ||
            option.isSelected !== nextOption.isSelected ||
            option.selected !== nextOption.selected
        ) {
            hasChanges = true;
        }

        return nextOption;
    });

    return hasChanges ? hydratedOptions : selectedOptions;
}

export {areRoomInviteSelectionsEqual, areSameRoomInviteOption, rehydrateRoomInviteSelectedOptions};
