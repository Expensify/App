import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {ListItem} from '@components/SelectionList/types';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type TravelMemberRole = ValueOf<typeof CONST.TRAVEL.MEMBER_ROLE>;

/** A member's travel setting as one value: off when they can't book travel, otherwise their travel role. */
type TravelMemberAccessValue = TravelMemberRole | typeof CONST.TRAVEL.MEMBER_ACCESS_OFF;

type TravelMemberOption = ListItem<TravelMemberAccessValue> & {
    value: TravelMemberAccessValue;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

function isTravelMemberRole(value: TravelMemberAccessValue): value is TravelMemberRole {
    return value !== CONST.TRAVEL.MEMBER_ACCESS_OFF;
}

function getTravelMemberRoleName(translate: LocalizedTranslate, role: TravelMemberRole): string {
    return role === CONST.TRAVEL.MEMBER_ROLE.ADMIN ? translate('workspace.moreFeatures.travel.members.travelAdmin') : translate('workspace.moreFeatures.travel.members.traveler');
}

function getTravelMemberAccessName(translate: LocalizedTranslate, value: TravelMemberAccessValue): string {
    return value === CONST.TRAVEL.MEMBER_ACCESS_OFF ? translate('workspace.moreFeatures.travel.members.off') : getTravelMemberRoleName(translate, value);
}

function getTravelMemberRoleOptions(translate: LocalizedTranslate, selectedRole: TravelMemberRole): TravelMemberOption[] {
    return [
        {
            value: CONST.TRAVEL.MEMBER_ROLE.TRAVELER,
            text: getTravelMemberRoleName(translate, CONST.TRAVEL.MEMBER_ROLE.TRAVELER),
            alternateText: translate('workspace.moreFeatures.travel.members.travelerDescription'),
            isSelected: selectedRole === CONST.TRAVEL.MEMBER_ROLE.TRAVELER,
            keyForList: CONST.TRAVEL.MEMBER_ROLE.TRAVELER,
        },
        {
            value: CONST.TRAVEL.MEMBER_ROLE.ADMIN,
            text: getTravelMemberRoleName(translate, CONST.TRAVEL.MEMBER_ROLE.ADMIN),
            alternateText: translate('workspace.moreFeatures.travel.members.travelAdminDescription'),
            isSelected: selectedRole === CONST.TRAVEL.MEMBER_ROLE.ADMIN,
            keyForList: CONST.TRAVEL.MEMBER_ROLE.ADMIN,
        },
    ];
}

/** The travel roles plus an option that stops the member from booking travel. */
function getTravelMemberAccessOptions(translate: LocalizedTranslate, selectedValue: TravelMemberAccessValue): TravelMemberOption[] {
    const roleOptions = getTravelMemberRoleOptions(translate, CONST.TRAVEL.MEMBER_ROLE.TRAVELER).map((option) => ({
        ...option,
        isSelected: selectedValue === option.value,
    }));
    return [
        {
            value: CONST.TRAVEL.MEMBER_ACCESS_OFF,
            text: getTravelMemberAccessName(translate, CONST.TRAVEL.MEMBER_ACCESS_OFF),
            alternateText: translate('workspace.moreFeatures.travel.members.offDescription'),
            isSelected: selectedValue === CONST.TRAVEL.MEMBER_ACCESS_OFF,
            keyForList: CONST.TRAVEL.MEMBER_ACCESS_OFF,
        },
        ...roleOptions,
    ];
}

export {isTravelMemberRole, getTravelMemberRoleName, getTravelMemberAccessName, getTravelMemberRoleOptions, getTravelMemberAccessOptions};
export type {TravelMemberAccessValue, TravelMemberOption};
