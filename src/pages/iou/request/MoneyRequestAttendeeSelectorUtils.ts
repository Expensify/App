import type {OnyxEntry} from 'react-native-onyx';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import {getParticipantsOption} from '@libs/OptionsListUtils';
import type {SearchOptionData} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import type {Attendee} from '@src/types/onyx/IOU';
import type {PersonalDetailsList} from '@src/types/onyx/PersonalDetails';

type BuildMoneyRequestAttendeeSectionsParams = {
    searchTerm: string;
    recentReports: SearchOptionData[];
    personalDetails: SearchOptionData[];
    userToInvite: SearchOptionData | null;
    selectedOptions: SearchOptionData[];
    initialSelectedOptions: SearchOptionData[];
    areOptionsInitialized: boolean;
    translate: (path: 'common.recents' | 'common.contacts') => string;
};

type AttendeeIdentitySets = {
    accountIDs: Set<number>;
    logins: Set<string>;
    displayValues: Set<string>;
};

type AttendeeSelectionIdentity = {
    accountID?: number | null;
    keyForList?: string | number | null;
    login?: string | null;
    reportID?: string | null;
    text?: string | null;
    displayName?: string | null;
    searchText?: string | null;
};

function hasRealAccountID<TOption extends AttendeeSelectionIdentity>(option?: TOption | null): option is TOption & {accountID: number} {
    return !!option?.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID;
}

function getNormalizedAttendeeLogin(option?: AttendeeSelectionIdentity | null) {
    return option?.login?.trim().toLowerCase() ?? '';
}

function getNormalizedAttendeeDisplayValue(option?: AttendeeSelectionIdentity | null) {
    return (option?.displayName ?? option?.text ?? option?.searchText)?.trim().toLowerCase() ?? '';
}

function getResolvedKeyForList(option: AttendeeSelectionIdentity) {
    return (
        option.keyForList?.toString() ?? (hasRealAccountID(option) ? option.accountID.toString() : undefined) ?? option.reportID ?? option.login ?? option.text ?? option.displayName ?? ''
    );
}

function toSelectedAttendeeOption(option: Partial<SearchOptionData> & AttendeeSelectionIdentity): SearchOptionData {
    return {
        ...option,
        // eslint-disable-next-line rulesdir/no-default-id-values -- SearchOptionData requires a structural reportID for attendee rows without reports.
        reportID: option.reportID ?? '',
        keyForList: getResolvedKeyForList(option),
        selected: true,
        isSelected: true,
    };
}

function buildAttendeeIdentitySets(options: SearchOptionData[]): AttendeeIdentitySets {
    const accountIDs = new Set<number>();
    const logins = new Set<string>();
    const displayValues = new Set<string>();

    for (const option of options) {
        if (hasRealAccountID(option)) {
            accountIDs.add(option.accountID);
        }

        const login = getNormalizedAttendeeLogin(option);
        if (login) {
            logins.add(login);
            continue;
        }

        const displayValue = getNormalizedAttendeeDisplayValue(option);
        if (displayValue) {
            displayValues.add(displayValue);
        }
    }

    return {
        accountIDs,
        logins,
        displayValues,
    };
}

function isOptionInAttendeeIdentitySets(option: SearchOptionData | null | undefined, identitySets: AttendeeIdentitySets) {
    if (!option) {
        return false;
    }

    if (hasRealAccountID(option) && identitySets.accountIDs.has(option.accountID)) {
        return true;
    }

    const login = getNormalizedAttendeeLogin(option);
    if (login && identitySets.logins.has(login)) {
        return true;
    }

    const displayValue = getNormalizedAttendeeDisplayValue(option);
    return !!displayValue && identitySets.displayValues.has(displayValue);
}

function getUniqueAttendeeOptions(options: SearchOptionData[]) {
    const uniqueOptions: SearchOptionData[] = [];
    const identitySets = buildAttendeeIdentitySets([]);

    for (const option of options) {
        if (isOptionInAttendeeIdentitySets(option, identitySets)) {
            continue;
        }

        uniqueOptions.push(option);

        if (hasRealAccountID(option)) {
            identitySets.accountIDs.add(option.accountID);
        }

        const login = getNormalizedAttendeeLogin(option);
        if (login) {
            identitySets.logins.add(login);
            continue;
        }

        const displayValue = getNormalizedAttendeeDisplayValue(option);
        if (displayValue) {
            identitySets.displayValues.add(displayValue);
        }
    }

    return uniqueOptions;
}

function normalizeAttendeeToOption(attendee: Attendee, personalDetails: OnyxEntry<PersonalDetailsList>): SearchOptionData {
    // Use || so empty email/login values still fall back to displayName for name-only attendees.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const normalizedLogin = attendee.email || attendee.login || attendee.displayName;
    const participantOption = getParticipantsOption(
        {
            ...attendee,
            login: normalizedLogin,
            avatar: attendee.avatarUrl,
            displayName: attendee.displayName,
            text: attendee.displayName,
            searchText: attendee.searchText ?? attendee.displayName,
            selected: true,
            isSelected: true,
        },
        personalDetails,
    );

    return toSelectedAttendeeOption({
        ...participantOption,
        // Use || so empty login/text fall back to the best attendee identifier for name-only attendees.
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        login: participantOption.login || normalizedLogin,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        displayName: attendee.displayName || participantOption.text || normalizedLogin,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        text: participantOption.text || attendee.displayName || normalizedLogin,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        alternateText: participantOption.alternateText || normalizedLogin,
        searchText: attendee.searchText ?? participantOption.searchText ?? attendee.displayName ?? normalizedLogin,
        accountID: participantOption.accountID ?? attendee.accountID,
        selected: true,
        isSelected: true,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        keyForList: participantOption.keyForList || normalizedLogin || attendee.displayName,
    });
}

function getAttendeeOptionIdentifier(option?: AttendeeSelectionIdentity) {
    if (!option) {
        return '';
    }

    if (option.accountID && option.accountID !== CONST.DEFAULT_NUMBER_ID) {
        return `accountID:${option.accountID}`;
    }

    if (option.login) {
        return `login:${option.login.toLowerCase()}`;
    }

    const displayName = option.displayName ?? option.text ?? option.searchText;
    if (displayName) {
        return `displayName:${displayName.toLowerCase()}`;
    }

    return '';
}

function areSameAttendeeOption(left?: AttendeeSelectionIdentity | null, right?: AttendeeSelectionIdentity | null) {
    if (!left || !right) {
        return false;
    }

    const leftHasRealAccountID = hasRealAccountID(left);
    const rightHasRealAccountID = hasRealAccountID(right);

    if (leftHasRealAccountID && rightHasRealAccountID && left.accountID === right.accountID) {
        return true;
    }

    const leftLogin = getNormalizedAttendeeLogin(left);
    const rightLogin = getNormalizedAttendeeLogin(right);
    if (leftLogin && rightLogin && leftLogin === rightLogin) {
        return true;
    }

    if (leftHasRealAccountID || rightHasRealAccountID || leftLogin || rightLogin) {
        return false;
    }

    const leftDisplayValue = getNormalizedAttendeeDisplayValue(left);
    const rightDisplayValue = getNormalizedAttendeeDisplayValue(right);
    if (leftDisplayValue && rightDisplayValue && leftDisplayValue === rightDisplayValue) {
        return true;
    }

    return false;
}

function buildMoneyRequestAttendeeSections({
    searchTerm,
    recentReports,
    personalDetails,
    userToInvite,
    selectedOptions,
    initialSelectedOptions,
    areOptionsInitialized,
    translate,
}: BuildMoneyRequestAttendeeSectionsParams): Array<Section<SearchOptionData>> {
    if (!areOptionsInitialized) {
        return [];
    }

    const trimmedSearchTerm = searchTerm.trim();
    const baseOptions = [...recentReports, ...personalDetails, ...(userToInvite ? [userToInvite] : [])];
    const uniqueInitialSelectedOptions = getUniqueAttendeeOptions(initialSelectedOptions);
    const baseOptionIdentitySets = buildAttendeeIdentitySets(baseOptions);
    const hasInitialSelectionsOutsideBaseResults = uniqueInitialSelectedOptions.some((option) => !isOptionInAttendeeIdentitySets(option, baseOptionIdentitySets));
    const candidateCount = recentReports.length + personalDetails.length + (userToInvite ? 1 : 0);
    const shouldShowInitialSelectionSection =
        trimmedSearchTerm.length === 0 &&
        uniqueInitialSelectedOptions.length > 0 &&
        (candidateCount > CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD || hasInitialSelectionsOutsideBaseResults);
    const renderedSelectedOptions = shouldShowInitialSelectionSection ? uniqueInitialSelectedOptions : [];
    const renderedSelectedIdentitySets = buildAttendeeIdentitySets(renderedSelectedOptions);
    const selectedOptionIdentitySets = buildAttendeeIdentitySets(selectedOptions);

    const sections: Array<Section<SearchOptionData>> = [];

    if (shouldShowInitialSelectionSection) {
        const selectedSectionData = renderedSelectedOptions.map((option) => {
            const isSelected = isOptionInAttendeeIdentitySets(option, selectedOptionIdentitySets);

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

    const recentSectionData = shouldShowInitialSelectionSection ? recentReports.filter((option) => !isOptionInAttendeeIdentitySets(option, renderedSelectedIdentitySets)) : recentReports;

    if (recentSectionData.length > 0) {
        sections.push({
            title: translate('common.recents'),
            data: recentSectionData,
            sectionIndex: sections.length,
        });
    }

    const contactsSectionData = shouldShowInitialSelectionSection
        ? personalDetails.filter((option) => !isOptionInAttendeeIdentitySets(option, renderedSelectedIdentitySets))
        : personalDetails;

    if (contactsSectionData.length > 0) {
        sections.push({
            title: translate('common.contacts'),
            data: contactsSectionData,
            sectionIndex: sections.length,
        });
    }

    const nextUserToInvite = shouldShowInitialSelectionSection && isOptionInAttendeeIdentitySets(userToInvite, renderedSelectedIdentitySets) ? null : userToInvite;

    if (nextUserToInvite) {
        sections.push({
            title: undefined,
            data: [nextUserToInvite],
            sectionIndex: sections.length,
        });
    }

    return sections;
}

export default buildMoneyRequestAttendeeSections;
export {areSameAttendeeOption, buildMoneyRequestAttendeeSections, getAttendeeOptionIdentifier, normalizeAttendeeToOption};
export type {BuildMoneyRequestAttendeeSectionsParams};
