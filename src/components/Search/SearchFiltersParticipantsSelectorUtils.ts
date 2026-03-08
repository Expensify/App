import type {OnyxEntry} from 'react-native-onyx';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {Option} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Attendee} from '@src/types/onyx/IOU';
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

function hasValidAccountID(option?: Partial<OptionData>) {
    return !!option?.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID;
}

function getNormalizedLogin(option?: Partial<OptionData>) {
    return option?.login?.trim().toLowerCase() ?? '';
}

function getNormalizedText(option?: Partial<OptionData>) {
    return (option?.text ?? option?.displayName)?.trim().toLowerCase() ?? '';
}

function getSelectedOptionData(option: Option): OptionData {
    const keyForList = option.keyForList?.toString() ?? (hasValidAccountID(option) ? option.accountID?.toString() : undefined) ?? option.reportID ?? option.login ?? option.text ?? '';

    return {
        ...option,
        keyForList,
        selected: true,
        isSelected: true,
    };
}

function getOptionSelectionKey(option?: Partial<OptionData>) {
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

function areOptionSelectionsEqual(left: OptionData[], right: OptionData[]) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((option, index) => getOptionSelectionKey(option) === getOptionSelectionKey(right.at(index)));
}

function createSelectedOptionFromPersonalDetail(personalDetail: SelectedPersonalDetail, personalDetails: OnyxEntry<PersonalDetailsList>): OptionData {
    const participant = {
        ...personalDetail,
        login: personalDetail.login ?? '',
        displayName: personalDetail.displayName ?? personalDetail.login ?? '',
        text: personalDetail.displayName ?? personalDetail.login ?? '',
        selected: true,
        isSelected: true,
    };
    const participantOption = getParticipantsOption(participant, personalDetails);

    return {
        ...participantOption,
        displayName: personalDetail.displayName ?? participantOption.text ?? personalDetail.login ?? '',
        text: participantOption.text ?? personalDetail.displayName ?? personalDetail.login ?? '',
        alternateText: participantOption.alternateText ?? personalDetail.login ?? personalDetail.displayName ?? '',
        searchText: participantOption.searchText ?? personalDetail.displayName ?? personalDetail.login ?? '',
        keyForList: participantOption.keyForList ?? personalDetail.accountID?.toString() ?? personalDetail.login ?? personalDetail.displayName ?? '',
        selected: true,
        isSelected: true,
    };
}

function createSelectedOptionFromAttendee(attendee: Attendee): OptionData {
    const login = attendee.email ?? attendee.login ?? attendee.displayName;
    const keyForList = login ?? attendee.displayName;

    return {
        text: attendee.displayName ?? login,
        alternateText: login ?? attendee.displayName,
        login,
        displayName: attendee.displayName ?? login,
        accountID: attendee.accountID ?? CONST.DEFAULT_NUMBER_ID,
        keyForList,
        selected: true,
        isSelected: true,
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
    };
}

function createFallbackSelectedOption(identifier: string): OptionData {
    return {
        text: identifier,
        alternateText: identifier,
        login: identifier,
        displayName: identifier,
        accountID: CONST.DEFAULT_NUMBER_ID,
        keyForList: identifier,
        selected: true,
        isSelected: true,
        icons: [],
        searchText: identifier,
    };
}

function createFallbackSelectedAccountOption(identifier: string): OptionData {
    const parsedAccountID = Number(identifier);
    const accountID =
        /^\d+$/.test(identifier) && Number.isSafeInteger(parsedAccountID) && parsedAccountID > 0 && parsedAccountID !== CONST.DEFAULT_NUMBER_ID ? parsedAccountID : CONST.DEFAULT_NUMBER_ID;

    return {
        text: identifier,
        alternateText: identifier,
        login: identifier,
        displayName: identifier,
        accountID,
        keyForList: identifier,
        selected: true,
        isSelected: true,
        icons: [],
        searchText: identifier,
    };
}

function resolveInitialSelectedAccountOption(
    identifier: string,
    {currentUserOption, recentReports, personalDetailsOptions, userToInvite, personalDetails}: Omit<ResolveInitialSelectedAccountOptionsParams, 'initialAccountIDs'>,
): OptionData | null {
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

function resolveInitialSelectedAccountOptions(params: ResolveInitialSelectedAccountOptionsParams): OptionData[] {
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
}: ResolveInitialSelectedOptionsParams): OptionData[] {
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
        .filter((option): option is OptionData => !!option);
}

export {areOptionSelectionsEqual, getOptionSelectionKey, getSelectedOptionData, resolveInitialSelectedAccountOptions, resolveInitialSelectedOptions};
