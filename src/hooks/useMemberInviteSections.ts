import {useMemo} from 'react';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {Options} from '@libs/OptionsListUtils/types';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';

type BuildMemberInviteSectionsParams = {
    searchTerm: string;
    searchOptions: Options;
    selectedOptions: OptionData[];
    initialSelectedOptions: OptionData[];
    areOptionsInitialized: boolean;
    translate: (path: 'common.contacts') => string;
};

function areSameMemberInviteOption(left?: Partial<OptionData>, right?: Partial<OptionData>) {
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

function buildMemberInviteSections({
    searchTerm,
    searchOptions,
    selectedOptions,
    initialSelectedOptions,
    areOptionsInitialized,
    translate,
}: BuildMemberInviteSectionsParams): Array<Section<OptionData>> {
    if (!areOptionsInitialized) {
        return [];
    }

    const trimmedSearchTerm = searchTerm.trim();
    const candidateCount = searchOptions.personalDetails.length + (searchOptions.userToInvite ? 1 : 0);
    const baseOptions = [...searchOptions.personalDetails, ...(searchOptions.userToInvite ? [searchOptions.userToInvite] : [])];
    const hasInitialSelectionsOutsideBaseResults = initialSelectedOptions.some((option) => !baseOptions.some((baseOption) => areSameMemberInviteOption(baseOption, option)));
    const shouldShowInitialSelectionSection =
        trimmedSearchTerm.length === 0 &&
        initialSelectedOptions.length > 0 &&
        (candidateCount > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD || hasInitialSelectionsOutsideBaseResults);
    const sections: Array<Section<OptionData>> = [];

    if (shouldShowInitialSelectionSection) {
        const selectedSectionData = initialSelectedOptions.map((option) => {
            const isSelected = selectedOptions.some((selectedOption) => areSameMemberInviteOption(selectedOption, option));

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

    const contactsSectionData = shouldShowInitialSelectionSection
        ? searchOptions.personalDetails.filter((option) => !initialSelectedOptions.some((initialOption) => areSameMemberInviteOption(option, initialOption)))
        : searchOptions.personalDetails;

    if (contactsSectionData.length > 0) {
        sections.push({
            title: translate('common.contacts'),
            data: contactsSectionData,
            sectionIndex: sections.length,
        });
    }

    const userToInvite =
        shouldShowInitialSelectionSection && searchOptions.userToInvite && initialSelectedOptions.some((option) => areSameMemberInviteOption(searchOptions.userToInvite, option))
            ? null
            : searchOptions.userToInvite;

    if (userToInvite) {
        sections.push({
            title: undefined,
            data: [userToInvite],
            sectionIndex: sections.length,
        });
    }

    return sections;
}

function useMemberInviteSections({searchTerm, searchOptions, selectedOptions, initialSelectedOptions, areOptionsInitialized, translate}: BuildMemberInviteSectionsParams) {
    return useMemo(
        () =>
            buildMemberInviteSections({
                searchTerm,
                searchOptions,
                selectedOptions,
                initialSelectedOptions,
                areOptionsInitialized,
                translate,
            }),
        [areOptionsInitialized, initialSelectedOptions, searchOptions, searchTerm, selectedOptions, translate],
    );
}

export default useMemberInviteSections;
export {areSameMemberInviteOption, buildMemberInviteSections};
export type {BuildMemberInviteSectionsParams};
