import type {OnyxEntry} from 'react-native-onyx';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

type ResolveInitialSelectedParticipantOptionsParams = {
    initialSelectedParticipants: Participant[];
    workspaceChats?: OptionData[];
    selfDMChat?: OptionData | null;
    recentReports?: OptionData[];
    personalDetailsOptions?: OptionData[];
    userToInvite?: OptionData | null;
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type FilterLowerParticipantSectionOptionsParams = {
    selectedSectionData: Array<Partial<OptionData | Participant>>;
    workspaceChats?: OptionData[];
    selfDMChat?: OptionData | null;
    recentReports?: OptionData[];
    personalDetailsOptions?: OptionData[];
    userToInvite?: OptionData | null;
};

function hasRealAccountID(option?: Partial<OptionData | Participant>) {
    return !!option?.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID;
}

function getNormalizedParticipantLogin(option?: Partial<OptionData | Participant>) {
    return option?.login?.trim().toLowerCase() ?? '';
}

function getMoneyRequestParticipantSelectionKey(option?: Partial<OptionData | Participant>) {
    if (!option) {
        return '';
    }

    if (option.reportID) {
        return `reportID:${option.reportID}`;
    }

    if (hasRealAccountID(option)) {
        return `accountID:${option.accountID}`;
    }

    const login = getNormalizedParticipantLogin(option);
    if (login) {
        return `login:${login}`;
    }

    if (option.policyID) {
        return `policyID:${option.policyID}`;
    }

    if (option.keyForList) {
        return `key:${option.keyForList.toString()}`;
    }

    const text = (option.text ?? option.displayName ?? option.searchText)?.trim().toLowerCase();
    if (text) {
        return `text:${text}`;
    }

    return '';
}

function getSelectedOptionData(option: OptionData): OptionData {
    const keyForList =
        option.keyForList?.toString() ?? option.reportID ?? (hasRealAccountID(option) ? option.accountID?.toString() : undefined) ?? option.login ?? option.policyID ?? option.text ?? '';

    return {
        ...option,
        keyForList,
        isSelected: true,
        selected: true,
    };
}

function areSameMoneyRequestParticipant(left?: Partial<OptionData | Participant>, right?: Partial<OptionData | Participant>) {
    if (!left || !right) {
        return false;
    }

    if (left.reportID && right.reportID && left.reportID === right.reportID) {
        return true;
    }

    if (hasRealAccountID(left) && hasRealAccountID(right) && left.accountID === right.accountID) {
        return true;
    }

    const leftLogin = getNormalizedParticipantLogin(left);
    const rightLogin = getNormalizedParticipantLogin(right);
    if (leftLogin && rightLogin && leftLogin === rightLogin) {
        return true;
    }

    const leftHasOnlyPolicyID = !!left.policyID && !left.reportID && !hasRealAccountID(left) && !leftLogin;
    const rightHasOnlyPolicyID = !!right.policyID && !right.reportID && !hasRealAccountID(right) && !rightLogin;

    if (left.policyID && right.policyID && left.policyID === right.policyID && (leftHasOnlyPolicyID || rightHasOnlyPolicyID)) {
        return true;
    }

    if (
        left.policyID &&
        right.policyID &&
        left.policyID === right.policyID &&
        !left.reportID &&
        !right.reportID &&
        !leftLogin &&
        !rightLogin &&
        !hasRealAccountID(left) &&
        !hasRealAccountID(right)
    ) {
        return true;
    }

    return false;
}

function createFallbackSelectedParticipantOption(participant: Participant, personalDetails: OnyxEntry<PersonalDetailsList>): OptionData {
    const canHydrateAsParticipant =
        !participant.isPolicyExpenseChat && (!!participant.accountID || !!participant.login || !!participant.displayName || !!participant.text || !!participant.phoneNumber);

    if (canHydrateAsParticipant) {
        const participantOption = getParticipantsOption(
            {
                ...participant,
                selected: true,
                isSelected: true,
            },
            personalDetails,
        );

        return {
            ...participantOption,
            reportID: participant.reportID,
            policyID: participant.policyID,
            isPolicyExpenseChat: participant.isPolicyExpenseChat,
            isSelfDM: participant.isSelfDM,
            displayName: participant.displayName ?? participantOption.text ?? participant.login ?? participant.text ?? '',
            searchText: participant.searchText ?? participantOption.searchText,
            selected: true,
            isSelected: true,
        };
    }

    const fallbackText = participant.text ?? participant.displayName ?? participant.login ?? participant.policyID ?? participant.reportID ?? '';

    return {
        ...participant,
        text: fallbackText,
        displayName: participant.displayName ?? fallbackText,
        alternateText: participant.alternateText ?? participant.login ?? participant.policyID ?? participant.reportID ?? fallbackText,
        keyForList: participant.keyForList ?? participant.reportID ?? participant.policyID ?? participant.login ?? fallbackText,
        icons: participant.icons ?? [],
        searchText: participant.searchText ?? fallbackText,
        selected: true,
        isSelected: true,
    };
}

function resolveInitialSelectedParticipantOptions({
    initialSelectedParticipants,
    workspaceChats,
    selfDMChat,
    recentReports,
    personalDetailsOptions,
    userToInvite,
    personalDetails,
}: ResolveInitialSelectedParticipantOptionsParams): OptionData[] {
    const normalizedWorkspaceChats = workspaceChats ?? [];
    const normalizedRecentReports = recentReports ?? [];
    const normalizedPersonalDetailsOptions = personalDetailsOptions ?? [];
    const normalizedSelfDMChat = selfDMChat ?? null;
    const normalizedUserToInvite = userToInvite ?? null;
    const candidateOptions = [
        ...normalizedWorkspaceChats,
        ...(normalizedSelfDMChat ? [normalizedSelfDMChat] : []),
        ...normalizedRecentReports,
        ...normalizedPersonalDetailsOptions,
        ...(normalizedUserToInvite ? [normalizedUserToInvite] : []),
    ];
    const renderedSelectionKeys = new Set<string>();

    return initialSelectedParticipants
        .map((participant) => {
            const matchingOption = candidateOptions.find((option) => areSameMoneyRequestParticipant(option, participant));
            const selectedOption = matchingOption ? getSelectedOptionData(matchingOption) : createFallbackSelectedParticipantOption(participant, personalDetails);
            const selectionKey = getMoneyRequestParticipantSelectionKey(selectedOption);

            if (!selectionKey || renderedSelectionKeys.has(selectionKey)) {
                return null;
            }

            renderedSelectionKeys.add(selectionKey);
            return selectedOption;
        })
        .filter((option): option is OptionData => !!option);
}

function filterLowerParticipantSectionOptions({
    selectedSectionData,
    workspaceChats,
    selfDMChat,
    recentReports,
    personalDetailsOptions,
    userToInvite,
}: FilterLowerParticipantSectionOptionsParams) {
    const selectedOptionKeys = new Set(selectedSectionData.map(getMoneyRequestParticipantSelectionKey).filter(Boolean));
    const shouldKeepOption = (option?: Partial<OptionData | Participant> | null) => {
        const selectionKey = getMoneyRequestParticipantSelectionKey(option);
        return !selectionKey || !selectedOptionKeys.has(selectionKey);
    };

    return {
        workspaceChats: (workspaceChats ?? []).filter(shouldKeepOption),
        selfDMChat: shouldKeepOption(selfDMChat) ? (selfDMChat ?? null) : null,
        recentReports: (recentReports ?? []).filter(shouldKeepOption),
        personalDetails: (personalDetailsOptions ?? []).filter(shouldKeepOption),
        userToInvite: shouldKeepOption(userToInvite) ? (userToInvite ?? null) : null,
    };
}

export {filterLowerParticipantSectionOptions, getMoneyRequestParticipantSelectionKey, resolveInitialSelectedParticipantOptions};
