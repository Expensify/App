import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {Options} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

function areSameDelegateOption(left?: Partial<OptionData>, right?: Partial<OptionData>) {
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

function buildInitialDelegateOption(selectedLogin?: string, personalDetails?: PersonalDetailsList): OptionData[] {
    if (!selectedLogin) {
        return [];
    }

    const option = getParticipantsOption(
        {
            login: selectedLogin,
            accountID: generateAccountID(selectedLogin),
            selected: true,
        },
        personalDetails ?? {},
    ) as OptionData;

    return [option];
}

type BuildAddDelegateSectionsParams = {
    searchTerm: string;
    searchOptions: Options;
    selectedOptions: OptionData[];
    initialSelectedOptions: OptionData[];
    areOptionsInitialized: boolean;
    translate: (path: 'common.recents' | 'common.contacts') => string;
};

function buildAddDelegateSections({
    searchTerm,
    searchOptions,
    selectedOptions,
    initialSelectedOptions,
    areOptionsInitialized,
    translate,
}: BuildAddDelegateSectionsParams): Array<Section<OptionData>> {
    if (!areOptionsInitialized) {
        return [];
    }

    const trimmedSearchTerm = searchTerm.trim();
    const candidateCount = searchOptions.recentReports.length + searchOptions.personalDetails.length + (searchOptions.userToInvite ? 1 : 0);
    const baseOptions = [...searchOptions.recentReports, ...searchOptions.personalDetails, ...(searchOptions.userToInvite ? [searchOptions.userToInvite] : [])];
    const hasInitialSelectionsOutsideBaseResults = initialSelectedOptions.some((option) => !baseOptions.some((baseOption) => areSameDelegateOption(baseOption, option)));
    const shouldShowInitialSelectionSection =
        trimmedSearchTerm.length === 0 &&
        initialSelectedOptions.length > 0 &&
        (candidateCount > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD || hasInitialSelectionsOutsideBaseResults);

    const isInitiallySelected = (option?: Partial<OptionData>) => !!option && initialSelectedOptions.some((initialOption) => areSameDelegateOption(initialOption, option));
    const sections: Array<Section<OptionData>> = [];

    if (shouldShowInitialSelectionSection) {
        const selectedSectionData = initialSelectedOptions.map((option) => {
            const isSelected = selectedOptions.some((selectedOption) => areSameDelegateOption(selectedOption, option));
            return {
                ...option,
                isSelected,
                selected: isSelected,
            };
        });

        if (selectedSectionData.length > 0) {
            sections.push({
                title: undefined,
                data: selectedSectionData,
                sectionIndex: sections.length,
            });
        }
    }

    const recentReports = shouldShowInitialSelectionSection ? searchOptions.recentReports.filter((option) => !isInitiallySelected(option)) : searchOptions.recentReports;
    const recentReportLogins = new Set(recentReports.map((option) => option.login).filter(Boolean));
    const personalDetails = (shouldShowInitialSelectionSection ? searchOptions.personalDetails.filter((option) => !isInitiallySelected(option)) : searchOptions.personalDetails).filter(
        (option) => !recentReportLogins.has(option.login),
    );

    if (recentReports.length > 0) {
        sections.push({
            title: translate('common.recents'),
            data: recentReports,
            sectionIndex: sections.length,
        });
    }

    if (personalDetails.length > 0) {
        sections.push({
            title: translate('common.contacts'),
            data: personalDetails,
            sectionIndex: sections.length,
        });
    }

    const userToInvite =
        shouldShowInitialSelectionSection && searchOptions.userToInvite && isInitiallySelected(searchOptions.userToInvite) ? null : searchOptions.userToInvite;

    if (userToInvite) {
        sections.push({
            title: undefined,
            data: [userToInvite],
            sectionIndex: sections.length,
        });
    }

    return sections;
}

export {areSameDelegateOption, buildAddDelegateSections, buildInitialDelegateOption};
export type {BuildAddDelegateSectionsParams};
