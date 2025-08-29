import {Str} from 'expensify-common';
import deburr from 'lodash/deburr';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, PersonalDetails, PersonalDetailsList, Report, ReportAttributesDerivedValue, ReportNameValuePairs} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import type {Errors, Icon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Timing from './actions/Timing';
import {formatPhoneNumber} from './LocalePhoneNumber';
import {appendCountryCode, getPhoneNumberWithoutSpecialChars} from './LoginUtils';
import {MaxHeap} from './MaxHeap';
import {MinHeap} from './MinHeap';
import {addSMSDomainIfPhoneNumber, parsePhoneNumber} from './PhoneNumber';
import {getDisplayNameForParticipant} from './ReportUtils';
import {generateAccountID} from './UserUtils';

type OptionData = {
    text: string;
    alternateText?: string;
    allReportErrors?: Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | '' | null;
    tooltipText?: string | null;
    login?: string;
    accountID: number;
    phoneNumber?: string;
    keyForList?: string;
    searchText?: string;
    isOptimisticPersonalDetail?: boolean;
    selected?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean | null;
    reportID?: string;
    icons?: Icon[];
    private_isArchived?: string;
    lastVisibleActionCreated?: string;
};

type PreviewConfig = {
    isDisabled?: boolean | null;
    selected?: boolean;
    isSelected?: boolean;
};

type GetOptionsConfig = {
    excludeLogins?: Record<string, boolean>;
    includeCurrentUser?: boolean;
    includeRecentReports?: boolean;
    includeSelectedOptions?: boolean;
    recentAttendees?: number[];
    searchString?: string;
    maxElements?: number;
    recentMaxElements?: number;
    includeUserToInvite?: boolean;
    includeDomainEmail?: boolean;
    /** Note - This is a temporary optimization measure */
    removeRecentsDuplicates?: boolean;
    extraOptions?: OptionData[];
};

type GetUserToInviteConfig = {
    searchValue: string;
    loginsToExclude?: Record<string, boolean>;
    shouldAcceptName?: boolean;
    canInviteUser?: boolean;
};

type Options = {
    selectedOptions: OptionData[];
    recentOptions: OptionData[];
    personalDetails: OptionData[];
    userToInvite: OptionData | null;
};

/**
 * Creates a personal details list option
 */
function createOption(
    personalDetail: PersonalDetails,
    report: OnyxInputOrEntry<Report>,
    config?: PreviewConfig,
    reportAttributesDerived?: ReportAttributes,
    isReportArchived?: string,
): OptionData {
    const {selected, isSelected, isDisabled} = config ?? {};
    const result: OptionData = {
        text: '',
        alternateText: undefined,
        // pendingAction: undefined,
        allReportErrors: undefined,
        brickRoadIndicator: null,
        icons: undefined,
        tooltipText: null,
        accountID: 0,
        login: undefined,
        reportID: undefined,
        phoneNumber: undefined,
        keyForList: undefined,
        isOptimisticPersonalDetail: false,
        private_isArchived: undefined,
        lastVisibleActionCreated: undefined,
        selected,
        isSelected,
        isDisabled,
    };

    result.isOptimisticPersonalDetail = personalDetail.isOptimisticPersonalDetail;
    if (report) {
        result.private_isArchived = isReportArchived;
        result.allReportErrors = reportAttributesDerived?.reportErrors ?? {};
        result.brickRoadIndicator = !isEmptyObject(result.allReportErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        // result.pendingAction = report.pendingFields ? report.pendingFields.createChat : undefined;
        result.reportID = report.reportID;

        result.tooltipText = String(personalDetail.accountID);
        result.lastVisibleActionCreated = report.lastVisibleActionCreated;
    }

    result.login = personalDetail.login;
    result.accountID = personalDetail.accountID;
    result.phoneNumber = personalDetail.phoneNumber;

    result.keyForList = String(personalDetail.accountID);
    result.alternateText = formatPhoneNumber(personalDetail.login ?? '');

    result.text = getDisplayNameForParticipant({accountID: personalDetail.accountID}) || formatPhoneNumber(personalDetail.login ?? '');
    result.icons = [
        {
            id: personalDetail.accountID,
            source: personalDetail.avatar ?? FallbackAvatar,
            type: CONST.ICON_TYPE_AVATAR,
            name: result.text,
            fallbackIcon: personalDetail.fallbackIcon,
        },
    ];

    return result;
}

/**
 * We create a new user option if the following conditions are satisfied:
 * - There's no matching recent report and personal detail option
 * - The searchValue is a valid email or phone number
 * - If prop shouldAcceptName = true, the searchValue can be also a normal string
 * - The searchValue isn't the current personal detail login
 */
function getUserToInviteOption({searchValue, loginsToExclude = {}, shouldAcceptName = false}: GetUserToInviteConfig): OptionData | null {
    if (!searchValue) {
        return null;
    }

    const parsedPhoneNumber = parsePhoneNumber(appendCountryCode(Str.removeSMSDomain(searchValue)));
    const isValidEmail = Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN);
    const isValidPhoneNumber = parsedPhoneNumber.possible && Str.isValidE164Phone(getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number?.input ?? ''));
    const isInOptionToExclude = loginsToExclude[addSMSDomainIfPhoneNumber(searchValue).toLowerCase()];

    if ((!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude) {
        return null;
    }

    // Generates an optimistic account ID for new users not yet saved in Onyx
    const optimisticAccountID = generateAccountID(searchValue);
    return createOption(
        {
            accountID: optimisticAccountID,
            login: searchValue,
            isOptimisticPersonalDetail: true,
        },
        undefined,
    );
}

/**
 * Sort personal details by displayName or login in alphabetical order
 */
const personalDetailsComparator = (personalDetail: OptionData) => {
    const name = personalDetail.text ?? personalDetail.alternateText ?? personalDetail.login ?? '';
    return name.toLowerCase();
};

/**
 * Sort reports by archived status and last visible action
 */
const recentReportComparator = (option: OptionData) => {
    return `${option.private_isArchived ? 0 : 1}_${option.lastVisibleActionCreated ?? ''}`;
};

/**
 * Sort options by a given comparator and return first sorted options.
 * Function uses a min heap to efficiently get the first sorted options.
 */
function optionsOrderBy<T = OptionData>(options: T[], comparator: (option: T) => number | string, limit?: number, filter?: (option: T) => boolean | undefined, reversed = false): T[] {
    Timing.start(CONST.TIMING.SEARCH_MOST_RECENT_OPTIONS);
    const heap = reversed ? new MaxHeap<T>(comparator) : new MinHeap<T>(comparator);
    options.forEach((option) => {
        if (filter && !filter(option)) {
            return;
        }
        if (limit && heap.size() >= limit) {
            const peekedValue = heap.peek();
            if (!peekedValue) {
                throw new Error('Heap is empty, cannot peek value');
            }
            if (comparator(option) > comparator(peekedValue)) {
                heap.pop();
                heap.push(option);
            }
        } else {
            heap.push(option);
        }
    });
    Timing.end(CONST.TIMING.SEARCH_MOST_RECENT_OPTIONS);
    return [...heap].reverse();
}

function getPersonalDetailSearchTerms(item: Partial<OptionData>) {
    return [item.text ?? '', item.login ?? '', item.login?.replace(CONST.EMAIL_SEARCH_REGEX, '') ?? ''];
}

/**
 * Remove the personal details for the DMs that are already in the recent reports so that we don't show duplicates.
 */
function filteredPersonalDetailsOfRecentReports(recentReports: OptionData[], personalDetails: OptionData[]) {
    const excludedLogins = new Set(recentReports.map((report) => report.login));
    return personalDetails.filter((personalDetail) => !excludedLogins.has(personalDetail.login));
}

/**
 * Process a search string into normalized search terms
 * @param searchString - The raw search string to process
 * @returns Array of normalized search terms
 */
function processSearchString(searchString: string | undefined): string[] {
    return deburr(searchString ?? '')
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);
}

function canCreateOptimisticPersonalDetailOption({
    recentOptions,
    personalDetailsOptions,
    currentUserLogin,
    searchValue,
}: {
    recentOptions: OptionData[];
    personalDetailsOptions: OptionData[];
    currentUserLogin: string;
    searchValue: string;
}) {
    if (recentOptions.length + personalDetailsOptions.length > 0) {
        return false;
    }
    return currentUserLogin !== addSMSDomainIfPhoneNumber(searchValue ?? '').toLowerCase() && currentUserLogin !== searchValue?.toLowerCase();
}

function filterUserToInvite(options: Omit<Options, 'userToInvite' | 'selectedOptions'>, currentUserLogin: string, config: GetUserToInviteConfig): OptionData | null {
    const {searchValue, canInviteUser = true, loginsToExclude = {}} = config ?? {};
    if (!canInviteUser) {
        return null;
    }

    const canCreateOptimisticDetail = canCreateOptimisticPersonalDetailOption({
        recentOptions: options.recentOptions,
        personalDetailsOptions: options.personalDetails,
        currentUserLogin,
        searchValue,
    });

    if (!canCreateOptimisticDetail) {
        return null;
    }

    const excludeLogins: Record<string, boolean> = {
        [CONST.EMAIL.NOTIFICATIONS]: true,
        ...loginsToExclude,
    };
    return getUserToInviteOption({
        loginsToExclude: excludeLogins,
        ...config,
    });
}

function filterCurrentUserOption(option: OptionData | undefined, searchValue: string) {
    if (!option) {
        return null;
    }

    const searchTerms = processSearchString(searchValue);
    const searchText = deburr(`${option.text ?? ''} ${option.login ?? ''}`.toLocaleLowerCase());

    const isMatchingSearch = searchTerms.every((term) => searchText.includes(term));

    if (isMatchingSearch) {
        return option;
    }

    return null;
}

/**
 * Options are reports and personal details. This function filters out the options that are not valid to be displayed.
 */
function getValidOptions(
    options: OptionData[],
    currentUserLogin: string,
    {
        excludeLogins = {},
        includeSelectedOptions = false,
        includeRecentReports = true,
        recentAttendees,
        searchString,
        maxElements,
        recentMaxElements = CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        includeUserToInvite = false,
        includeCurrentUser = false,
        includeDomainEmail = false,
        removeRecentsDuplicates = true,
        extraOptions = [],
    }: GetOptionsConfig = {},
) {
    // Gather shared configs:
    const loginsToExclude: Record<string, boolean> = {
        [CONST.EMAIL.NOTIFICATIONS]: true,
        [CONST.EMAIL.MANAGER_MCTEST]: true,
        ...excludeLogins,
        [currentUserLogin]: !includeCurrentUser,
    };

    let extendedOptions = options;
    if (extraOptions.length > 0) {
        const existingLogins = new Set(extendedOptions.map((option) => option.login));
        const filteredExtraOptions = extraOptions.filter((option) => option.login && !existingLogins.has(option.login));
        extendedOptions = [...options, ...filteredExtraOptions];
    }

    const searchTerms = processSearchString(searchString);
    const selectedFilteringFunction = (personalDetail: OptionData) => {
        if (
            !personalDetail.isSelected ||
            !personalDetail.login ||
            !personalDetail.accountID ||
            (!includeDomainEmail && Str.isDomainEmail(personalDetail.login)) ||
            // Exclude the setup specialist from the list of personal details as it's a fallback if guide is not assigned
            personalDetail.login === CONST.SETUP_SPECIALIST_LOGIN
        ) {
            return false;
        }
        if (loginsToExclude[personalDetail.login]) {
            return false;
        }
        const searchText = deburr(`${personalDetail.text ?? ''} ${personalDetail.login ?? ''}`.toLocaleLowerCase());

        return searchTerms.every((term) => searchText.includes(term));
    };

    const selectedOptions = optionsOrderBy(extendedOptions, personalDetailsComparator, maxElements, selectedFilteringFunction, true);
    // If we're including selected options from the search results, we only want to exclude them if the search input is empty
    // This is because on certain pages, we show the selected options at the top when the search input is empty
    // This prevents the issue of seeing the selected option twice if you have them as a recent chat and select them
    if (!includeSelectedOptions) {
        selectedOptions.forEach((option) => {
            if (!option.login) {
                return;
            }
            loginsToExclude[option.login] = true;
        });
    }

    // Get valid recent reports:
    let recentOptions: OptionData[] = [];

    if (recentAttendees && recentAttendees?.length > 0) {
        const recentAttendeesSet = new Set(recentAttendees);
        recentOptions = options.filter((option) => {
            if (option.login && loginsToExclude[option.login]) {
                return false;
            }
            return recentAttendeesSet.has(option.accountID);
        });
        if (recentMaxElements && recentOptions.length > recentMaxElements) {
            recentOptions = recentOptions.slice(0, recentMaxElements);
        }
    }

    if (includeRecentReports && (!recentMaxElements || recentOptions.length < recentMaxElements)) {
        // if maxElements is passed, filter the recent reports by searchString and return only most recent reports (@see recentReportsComparator)
        const recentAttendeesSet = new Set(recentAttendees);

        const filteringFunction = (option: OptionData) => {
            let searchText = `${option.text ?? ''}${option.login ?? ''}`;

            searchText = deburr(searchText.toLocaleLowerCase());
            const searchTermsFound = searchTerms.every((term) => searchText.includes(term));

            if (!searchTermsFound || !option.reportID) {
                return false;
            }

            if (recentAttendeesSet.has(option.accountID)) {
                return false;
            }

            if (!!option.login && loginsToExclude[option.login]) {
                return false;
            }

            return true;
        };

        recentOptions = optionsOrderBy(options, recentReportComparator, recentMaxElements ? recentMaxElements - recentOptions.length : recentMaxElements, filteringFunction);
    }

    // Get valid personal details and check if we can find the current user:
    let personalDetailsOptions: OptionData[] = [];

    const recentOptionsByAccountID = new Set(recentOptions.map((option) => option.accountID).filter(Boolean));

    const filteringFunction = (personalDetail: OptionData) => {
        if (
            !personalDetail.login ||
            !personalDetail.accountID ||
            !!personalDetail.isOptimisticPersonalDetail ||
            (!includeDomainEmail && Str.isDomainEmail(personalDetail.login)) ||
            // Exclude the setup specialist from the list of personal details as it's a fallback if guide is not assigned
            personalDetail.login === CONST.SETUP_SPECIALIST_LOGIN ||
            // Exclude any recent options from the personal details
            (removeRecentsDuplicates && recentOptionsByAccountID.has(personalDetail.accountID))
        ) {
            return false;
        }
        if (loginsToExclude[personalDetail.login]) {
            return false;
        }
        const searchText = deburr(`${personalDetail.text ?? ''} ${personalDetail.login ?? ''}`.toLocaleLowerCase());

        return searchTerms.every((term) => searchText.includes(term));
    };

    personalDetailsOptions = optionsOrderBy(options, personalDetailsComparator, maxElements, filteringFunction, true);

    let userToInvite: OptionData | null = null;
    if (includeUserToInvite) {
        userToInvite = filterUserToInvite({recentOptions, personalDetails: personalDetailsOptions}, currentUserLogin, {searchValue: searchString ?? '', loginsToExclude});
    }

    return {
        selectedOptions,
        personalDetails: personalDetailsOptions,
        recentOptions,
        userToInvite,
    };
}

function createOptionList(
    currentUserAccountID: number,
    personalDetails: OnyxEntry<PersonalDetailsList>,
    accountIDToReportIDMap: Record<number, string>,
    reports?: OnyxCollection<Report>,
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'],
    allReportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
) {
    if (isEmptyObject(personalDetails)) {
        return {
            currentUserOption: undefined,
            options: [],
        };
    }
    const currentUserRef = {
        current: undefined as OptionData | undefined,
    };
    const allPersonalDetailsOptions = Object.values(personalDetails).map((personalDetail) => {
        if (!personalDetail) {
            return {} as OptionData;
        }
        const reportID = accountIDToReportIDMap[personalDetail.accountID];
        const report = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const reportAttributes = report?.reportID ? reportAttributesDerived?.[report.reportID] : undefined;
        const isReportArchived = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`]?.private_isArchived;
        const option = createOption(personalDetail, report, undefined, reportAttributes, isReportArchived);
        if (option.accountID === currentUserAccountID) {
            currentUserRef.current = option;
        }
        return option;
    });

    return {
        currentUserOption: currentUserRef.current,
        options: allPersonalDetailsOptions,
    };
}

function shallowOptionsListCompare(a: OptionData[], b: OptionData[]): boolean {
    if (!a || !b) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a.at(i)?.login !== b.at(i)?.login) {
            return false;
        }
    }
    return true;
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(translate: LocaleContextProps['translate'], searchValue: string, hasMatchedParticipant = false): string {
    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (!searchValue) {
        return '';
    }
    const isValidPhone = parsePhoneNumber(appendCountryCode(searchValue)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone) {
        return translate('messages.errorMessageInvalidPhone');
    }
    if (/@/.test(searchValue) && !isValidEmail) {
        return translate('messages.errorMessageInvalidEmail');
    }
    if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
        return '';
    }
    return translate('common.noResultsFound');
}

export {
    createOption,
    getUserToInviteOption,
    personalDetailsComparator,
    recentReportComparator,
    optionsOrderBy,
    getPersonalDetailSearchTerms,
    filteredPersonalDetailsOfRecentReports,
    processSearchString,
    canCreateOptimisticPersonalDetailOption,
    filterCurrentUserOption,
    getValidOptions,
    filterUserToInvite,
    createOptionList,
    shallowOptionsListCompare,
    getHeaderMessage,
};

export type {OptionData, Options};
