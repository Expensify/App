import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {ListItem} from '@components/SelectionList/types';

type TravelMemberOption = ListItem & {
    /** Whether choosing this option lets the member book travel. */
    value: boolean;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

/** The label for whether a member can book travel. */
function getTravelMemberAccessName(translate: LocalizedTranslate, canUseTravel: boolean): string {
    return canUseTravel ? translate('common.yes') : translate('common.no');
}

/** The options for whether a member can book travel. */
function getTravelMemberAccessOptions(translate: LocalizedTranslate, canUseTravel: boolean): TravelMemberOption[] {
    return [
        {
            value: true,
            text: getTravelMemberAccessName(translate, true),
            alternateText: translate('workspace.moreFeatures.travel.members.onDescription'),
            isSelected: canUseTravel,
            keyForList: 'yes',
        },
        {
            value: false,
            text: getTravelMemberAccessName(translate, false),
            alternateText: translate('workspace.moreFeatures.travel.members.offDescription'),
            isSelected: !canUseTravel,
            keyForList: 'no',
        },
    ];
}

export {getTravelMemberAccessName, getTravelMemberAccessOptions};
export type {TravelMemberOption};
