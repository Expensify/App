import type {OnyxEntry} from 'react-native-onyx';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {Option, SearchOptionData} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

type ResolveInitialSelectedOptionsParams = {
    initialAccountIDs: string[];
    currentUserOption: Option | null | undefined;
    recentReports: Option[];
    personalDetailsOptions: Option[];
    userToInvite: Option | null | undefined;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    recentAttendees: Attendee[] | undefined;
    shouldAllowNameOnlyOptions: boolean;
};

type ResolveInitialSelectedAccountOptionsParams = Omit<ResolveInitialSelectedOptionsParams, 'recentAttendees' | 'shouldAllowNameOnlyOptions'>;

type SelectedPersonalDetail = {
    accountID?: number;
    login?: string;
    displayName?: string;
    avatar?: string | null;
};

type SelectionIdentityInput = {
    accountID?: number | null;
    keyForList?: string | number | null;
    login?: string | null;
    reportID?: string | null;
    text?: string | null;
    displayName?: string | null;
};

function hasValidAccountID(option?: SelectionIdentityInput) {
    return !!option?.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID;
}

function getNormalizedLogin(option?: SelectionIdentityInput) {
    return option?.login?.trim().toLowerCase() ?? '';
}

function getNormalizedText(option?: SelectionIdentityInput) {
    return (option?.text ?? option?.displayName)?.trim().toLowerCase() ?? '';
}

function getResolvedKeyForList(option: SelectionIdentityInput) {
    return (
        option.keyForList?.toString() ?? (hasValidAccountID(option) ? option.accountID?.toString() : undefined) ?? option.reportID ?? option.login ?? option.text ?? option.displayName ?? ''
    );
}

function toSelectedSearchOption(option: Partial<SearchOptionData> & SelectionIdentityInput): SearchOptionData {
    return {
        ...option,
        accountID: option.accountID ?? undefined,
        login: option.login ?? undefined,
        // eslint-disable-next-line rulesdir/no-default-id-values -- SearchOptionData requires a structural reportID for unresolved non-report rows.
        reportID: option.reportID ?? '',
        keyForList: getResolvedKeyForList(option),
        selected: true,
        isSelected: true,
    };
}

function getSelectedOptionData(option: Option): SearchOptionData {
    return toSelectedSearchOption(option);
}

function getOptionSelectionKey(option?: SelectionIdentityInput) {
    if (!option) {
        return '';
    }

    if (hasValidAccountID(option)) {
        return `accountID:${option.accountID}`;
    }

    if (option.keyForList) {
        return `key:${option.keyForList.toString()}`;
    }

    const login = getNormalizedLogin(option);
    if (login) {
        return `login:${login}`;
    }

    if (option.reportID) {
        return `reportID:${option.reportID}`;
    }

    const text = getNormalizedText(option);
    if (text) {
        return `text:${text}`;
    }

    return '';
}

function areOptionSelectionsEqual(left: SearchOptionData[], right: SearchOptionData[]) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((option, index) => getOptionSelectionKey(option) === getOptionSelectionKey(right.at(index)));
}

function createSelectedOptionFromPersonalDetail(personalDetail: SelectedPersonalDetail, personalDetails: OnyxEntry<PersonalDetailsList>): SearchOptionData {
    const participant: Participant = {
        accountID: personalDetail.accountID,
        login: personalDetail.login ?? '',
        displayName: personalDetail.displayName ?? personalDetail.login ?? '',
        text: personalDetail.displayName ?? personalDetail.login ?? '',
        selected: true,
        isSelected: true,
    };
    const participantOption = getParticipantsOption(participant, personalDetails);

    return toSelectedSearchOption({
        ...participantOption,
        displayName: personalDetail.displayName ?? participantOption.text ?? personalDetail.login ?? '',
        text: participantOption.text ?? personalDetail.displayName ?? personalDetail.login ?? '',
        alternateText: participantOption.alternateText ?? personalDetail.login ?? personalDetail.displayName ?? '',
        searchText: participantOption.searchText ?? personalDetail.displayName ?? personalDetail.login ?? '',
        avatar: personalDetail.avatar ?? undefined,
        keyForList: participantOption.keyForList ?? personalDetail.accountID?.toString() ?? personalDetail.login ?? personalDetail.displayName ?? '',
    });
}

function createSelectedOptionFromAttendee(attendee: Attendee): SearchOptionData {
    const login = attendee.email ?? attendee.login ?? attendee.displayName;
    const keyForList = login ?? attendee.displayName;

    return toSelectedSearchOption({
        text: attendee.displayName ?? login,
        alternateText: login ?? attendee.displayName,
        login: login ?? undefined,
        displayName: attendee.displayName ?? login,
        accountID: attendee.accountID ?? CONST.DEFAULT_NUMBER_ID,
        keyForList,
        icons: attendee.avatarUrl
            ? [
                  {
                      source: attendee.avatarUrl,
                      type: CONST.ICON_TYPE_AVATAR,
                      name: attendee.displayName ?? login,
                  },
              ]
            : [],
        searchText: attendee.searchText ?? attendee.displayName ?? login ?? '',
    });
}

function createFallbackSelectedOption(identifier: string): SearchOptionData {
    return toSelectedSearchOption({
        text: identifier,
        alternateText: identifier,
        login: identifier,
        displayName: identifier,
        accountID: CONST.DEFAULT_NUMBER_ID,
        keyForList: identifier,
        icons: [],
        searchText: identifier,
    });
}

function createFallbackSelectedAccountOption(identifier: string): SearchOptionData {
    const parsedAccountID = Number(identifier);
    const accountID =
        /^\d+$/.test(identifier) && Number.isSafeInteger(parsedAccountID) && parsedAccountID > 0 && parsedAccountID !== CONST.DEFAULT_NUMBER_ID ? parsedAccountID : CONST.DEFAULT_NUMBER_ID;

    return toSelectedSearchOption({
        text: identifier,
        alternateText: identifier,
        login: identifier,
        displayName: identifier,
        accountID,
        keyForList: identifier,
        icons: [],
        searchText: identifier,
    });
}

function resolveInitialSelectedAccountOption(
    identifier: string,
    {currentUserOption, recentReports, personalDetailsOptions, userToInvite, personalDetails}: Omit<ResolveInitialSelectedAccountOptionsParams, 'initialAccountIDs'>,
): SearchOptionData | null {
    const candidateOptions = [currentUserOption, ...recentReports, ...personalDetailsOptions, ...(userToInvite ? [userToInvite] : [])].filter((option): option is Option => !!option);
    const matchingOption = candidateOptions.find((option) => hasValidAccountID(option) && option.accountID?.toString() === identifier);

    if (matchingOption) {
        return getSelectedOptionData(matchingOption);
    }

    const personalDetail = personalDetails?.[identifier] as SelectedPersonalDetail | undefined;
    if (personalDetail) {
        return createSelectedOptionFromPersonalDetail(personalDetail, personalDetails);
    }

    return null;
}

function resolveInitialSelectedAccountOptions(params: ResolveInitialSelectedAccountOptionsParams): SearchOptionData[] {
    return params.initialAccountIDs.map((identifier) => resolveInitialSelectedAccountOption(identifier, params) ?? createFallbackSelectedAccountOption(identifier));
}

function matchesIdentifier(option: Option, identifier: string, shouldAllowNameOnlyOptions: boolean) {
    if (hasValidAccountID(option) && option.accountID?.toString() === identifier) {
        return true;
    }

    if (!shouldAllowNameOnlyOptions) {
        return false;
    }

    return option.keyForList?.toString() === identifier || getNormalizedLogin(option) === identifier.toLowerCase() || getNormalizedText(option) === identifier.toLowerCase();
}

function resolveInitialSelectedOptions({
    initialAccountIDs,
    currentUserOption,
    recentReports,
    personalDetailsOptions,
    userToInvite,
    personalDetails,
    recentAttendees,
    shouldAllowNameOnlyOptions,
}: ResolveInitialSelectedOptionsParams): SearchOptionData[] {
    if (!shouldAllowNameOnlyOptions) {
        return resolveInitialSelectedAccountOptions({
            initialAccountIDs,
            currentUserOption,
            recentReports,
            personalDetailsOptions,
            userToInvite,
            personalDetails,
        });
    }

    const candidateOptions = [currentUserOption, ...recentReports, ...personalDetailsOptions, ...(userToInvite ? [userToInvite] : [])].filter((option): option is Option => !!option);

    return initialAccountIDs
        .map((identifier) => {
            const resolvedAccountOption = resolveInitialSelectedAccountOption(identifier, {
                currentUserOption,
                recentReports,
                personalDetailsOptions,
                userToInvite,
                personalDetails,
            });
            if (resolvedAccountOption) {
                return resolvedAccountOption;
            }

            const matchingOption = candidateOptions.find((option) => matchesIdentifier(option, identifier, shouldAllowNameOnlyOptions));
            if (matchingOption) {
                return getSelectedOptionData(matchingOption);
            }

            if (shouldAllowNameOnlyOptions) {
                const attendee = recentAttendees?.find((recentAttendee) => recentAttendee.displayName === identifier || recentAttendee.email === identifier);
                if (attendee) {
                    return createSelectedOptionFromAttendee(attendee);
                }
            }

            return createFallbackSelectedOption(identifier);
        })
        .filter((option): option is SearchOptionData => !!option);
}

export {areOptionSelectionsEqual, getOptionSelectionKey, getSelectedOptionData, resolveInitialSelectedAccountOptions, resolveInitialSelectedOptions};
