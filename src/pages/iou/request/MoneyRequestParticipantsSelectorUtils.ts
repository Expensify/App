import type {OnyxEntry} from 'react-native-onyx';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {SearchOptionData} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

type ResolveInitialSelectedParticipantOptionsParams = {
    initialSelectedParticipants: Participant[];
    workspaceChats?: SearchOptionData[];
    selfDMChat?: SearchOptionData | null;
    recentReports?: SearchOptionData[];
    personalDetailsOptions?: SearchOptionData[];
    userToInvite?: SearchOptionData | null;
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type FilterLowerParticipantSectionOptionsParams = {
    selectedSectionData: Array<Partial<SearchOptionData | Participant>>;
    workspaceChats?: SearchOptionData[];
    selfDMChat?: SearchOptionData | null;
    recentReports?: SearchOptionData[];
    personalDetailsOptions?: SearchOptionData[];
    userToInvite?: SearchOptionData | null;
};

type ParticipantSelectionIdentity = {
    accountID?: number | null;
    keyForList?: string | number | null;
    login?: string | null;
    reportID?: string | null;
    policyID?: string | null;
    text?: string | null;
    displayName?: string | null;
    searchText?: string | null;
};

function hasRealAccountID<TOption extends ParticipantSelectionIdentity>(option?: TOption | null): option is TOption & {accountID: number} {
    return !!option?.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID;
}

function getNormalizedParticipantLogin(option?: ParticipantSelectionIdentity | null) {
    return option?.login?.trim().toLowerCase() ?? '';
}

function getResolvedKeyForList(option: ParticipantSelectionIdentity) {
    return (
        option.keyForList?.toString() ??
        option.reportID ??
        (hasRealAccountID(option) ? option.accountID.toString() : undefined) ??
        option.login ??
        option.policyID ??
        option.text ??
        option.displayName ??
        ''
    );
}

function toSelectedParticipantOption(option: Partial<SearchOptionData> & ParticipantSelectionIdentity): SearchOptionData {
    return {
        ...option,
        // eslint-disable-next-line rulesdir/no-default-id-values -- SearchOptionData requires a structural reportID for unresolved non-report rows.
        reportID: option.reportID ?? '',
        keyForList: getResolvedKeyForList(option),
        selected: true,
        isSelected: true,
    };
}

function getMoneyRequestParticipantSelectionKey(option?: ParticipantSelectionIdentity | null) {
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

function getSelectedOptionData(option: SearchOptionData): SearchOptionData {
    return toSelectedParticipantOption(option);
}

function areSameMoneyRequestParticipant(left?: ParticipantSelectionIdentity | null, right?: ParticipantSelectionIdentity | null) {
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

function createFallbackSelectedParticipantOption(participant: Participant, personalDetails: OnyxEntry<PersonalDetailsList>): SearchOptionData {
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

        return toSelectedParticipantOption({
            ...participantOption,
            reportID: participant.reportID ?? participantOption.reportID,
            policyID: participant.policyID ?? participantOption.policyID,
            isPolicyExpenseChat: participant.isPolicyExpenseChat ?? participantOption.isPolicyExpenseChat,
            isSelfDM: participant.isSelfDM ?? participantOption.isSelfDM,
            displayName: participant.displayName ?? participantOption.text ?? participant.login ?? participant.text ?? '',
            searchText: participant.searchText ?? participantOption.searchText,
        });
    }

    const fallbackIdentifier = participant.policyID ?? participant.reportID;
    const fallbackText = participant.text ?? participant.displayName ?? participant.login ?? fallbackIdentifier;

    return toSelectedParticipantOption({
        ...participant,
        // eslint-disable-next-line rulesdir/no-default-id-values -- SearchOptionData requires a structural reportID for participant rows without reports.
        reportID: participant.reportID ?? '',
        text: fallbackText ?? '',
        displayName: participant.displayName ?? fallbackText ?? '',
        alternateText: participant.alternateText ?? participant.login ?? fallbackIdentifier ?? fallbackText ?? '',
        keyForList: participant.keyForList ?? fallbackIdentifier ?? participant.login ?? fallbackText ?? '',
        icons: participant.icons ?? [],
        searchText: participant.searchText ?? fallbackText ?? '',
    });
}

function resolveInitialSelectedParticipantOptions({
    initialSelectedParticipants,
    workspaceChats,
    selfDMChat,
    recentReports,
    personalDetailsOptions,
    userToInvite,
    personalDetails,
}: ResolveInitialSelectedParticipantOptionsParams): SearchOptionData[] {
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
        .filter((option): option is SearchOptionData => !!option);
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
    const shouldKeepOption = (option?: Partial<SearchOptionData | Participant>) => {
        const selectionKey = getMoneyRequestParticipantSelectionKey(option);
        return !selectionKey || !selectedOptionKeys.has(selectionKey);
    };

    return {
        workspaceChats: (workspaceChats ?? []).filter(shouldKeepOption),
        selfDMChat: shouldKeepOption(selfDMChat ?? undefined) ? (selfDMChat ?? null) : null,
        recentReports: (recentReports ?? []).filter(shouldKeepOption),
        personalDetails: (personalDetailsOptions ?? []).filter(shouldKeepOption),
        userToInvite: shouldKeepOption(userToInvite ?? undefined) ? (userToInvite ?? null) : null,
    };
}

export {filterLowerParticipantSectionOptions, getMoneyRequestParticipantSelectionKey, resolveInitialSelectedParticipantOptions};
