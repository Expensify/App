import {addDays, differenceInDays, differenceInMinutes, format, startOfDay} from 'date-fns';
import lodashSortBy from 'lodash/sortBy';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';
import * as Localize from './Localize';
import type {OptionTree, SectionBase} from './OptionsListUtils';
import * as PolicyUtils from './PolicyUtils';
import * as ReportUtils from './ReportUtils';

let allReports: OnyxCollection<Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

/**
 * Returns custom unit ID for the per diem transaction
 */
function getCustomUnitID(reportID: string) {
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const policy = PolicyUtils.getPolicy(report?.policyID ?? parentReport?.policyID);
    let customUnitID: string = CONST.CUSTOM_UNITS.FAKE_P2P_ID;
    let category: string | undefined;

    if (ReportUtils.isPolicyExpenseChat(report) || ReportUtils.isPolicyExpenseChat(parentReport)) {
        const perDiemUnit = Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL);
        if (perDiemUnit) {
            customUnitID = perDiemUnit.customUnitID;
            category = perDiemUnit.defaultCategory;
        }
    }
    return {customUnitID, category};
}

type ModifiedOptionTree = OptionTree & {
    currency: string;
};

type DestinationTreeSection = SectionBase & {
    data: ModifiedOptionTree[];
    indexOffset?: number;
};

type Destination = {
    name: string;
    rateID: string;
    currency: string;
    isSelected?: boolean;
};

/**
 * Builds the options for the category tree hierarchy via indents
 *
 * @param options - an initial object array
 * @param options[].enabled - a flag to enable/disable option in a list
 * @param options[].name - a name of an option
 * @param options[].rateID - a rateID of an option
 */
function getDestinationOptionTree(options: Destination[]): ModifiedOptionTree[] {
    const optionCollection = new Map<string, ModifiedOptionTree>();
    Object.values(options).forEach((option) => {
        if (optionCollection.has(option.rateID)) {
            return;
        }

        optionCollection.set(option.rateID, {
            text: option.name,
            keyForList: option.rateID,
            searchText: option.name,
            tooltipText: option.name,
            isDisabled: false,
            isSelected: !!option.isSelected,
            currency: option.currency,
        });
    });

    return Array.from(optionCollection.values());
}

/**
 * Builds the section list for destinations
 */
function getDestinationListSections({
    destinations,
    searchValue,
    selectedOptions = [],
    recentlyUsedDestinations = [],
    maxRecentReportsToShow = CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
}: {
    destinations: Rate[];
    selectedOptions?: Destination[];
    searchValue?: string;
    recentlyUsedDestinations?: string[];
    maxRecentReportsToShow?: number;
}): DestinationTreeSection[] {
    const sortedDestinations: Destination[] = lodashSortBy(destinations, 'name').map((rate) => ({
        name: rate.name ?? '',
        rateID: rate.customUnitRateID,
        currency: rate.currency ?? CONST.CURRENCY.USD,
    }));
    const destinationSections: DestinationTreeSection[] = [];

    if (searchValue) {
        const searchDestinations: Destination[] = [];

        sortedDestinations.forEach((destination) => {
            if (!destination.name.toLowerCase().includes(searchValue.toLowerCase())) {
                return;
            }
            searchDestinations.push({
                ...destination,
                isSelected: selectedOptions.some((selectedOption) => selectedOption.rateID === destination.rateID),
            });
        });

        const data = getDestinationOptionTree(searchDestinations);
        destinationSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data,
            indexOffset: data.length,
        });

        return destinationSections;
    }

    if (selectedOptions.length > 0) {
        const data = getDestinationOptionTree(selectedOptions);
        destinationSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
        });
    }

    const selectedOptionRateID = selectedOptions.map((selectedOption) => selectedOption.rateID);

    if (sortedDestinations.length < CONST.STANDARD_LIST_ITEM_LIMIT) {
        const data = getDestinationOptionTree(sortedDestinations);
        destinationSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data,
            indexOffset: data.length,
        });

        return destinationSections;
    }

    const filteredRecentlyUsedDestinations = sortedDestinations.filter(({rateID}) => recentlyUsedDestinations.includes(rateID) && !selectedOptionRateID.includes(rateID));

    if (filteredRecentlyUsedDestinations.length > 0) {
        const cutRecentlyUsedDestinations = filteredRecentlyUsedDestinations.slice(0, maxRecentReportsToShow);

        const data = getDestinationOptionTree(cutRecentlyUsedDestinations);
        destinationSections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            data,
            indexOffset: data.length,
        });
    }

    const data = getDestinationOptionTree(sortedDestinations);
    destinationSections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        data,
        indexOffset: data.length,
    });

    return destinationSections;
}

function getDestinationForDisplay(customUnit: CustomUnit | undefined, transaction: OnyxEntry<Transaction>) {
    const customUnitRateID = transaction?.comment?.customUnit?.customUnitRateID;
    if (!customUnitRateID) {
        return '';
    }
    const selectedDestination = customUnit?.rates?.[customUnitRateID];
    return selectedDestination?.name ?? '';
}

function getSubratesFields(customUnit: CustomUnit | undefined, transaction: OnyxEntry<Transaction>) {
    const customUnitRateID = transaction?.comment?.customUnit?.customUnitRateID;
    if (!customUnitRateID) {
        return [];
    }
    const selectedDestination = customUnit?.rates?.[customUnitRateID];
    const countSubrates = selectedDestination?.subRates?.length ?? 0;
    const currentSubrates = transaction?.comment?.customUnit?.subRates ?? [];
    if (currentSubrates.length === countSubrates) {
        return currentSubrates;
    }
    return [...currentSubrates, undefined];
}

type Subrate = {
    /** Key of the sub rate */
    key?: string;

    /** ID of the custom unit sub rate */
    id: string;

    /** Custom unit amount */
    quantity: number;

    /** Custom unit name */
    name: string;

    /** Custom unit rate */
    rate?: number;
};

function getSubratesForDisplay(subrate: Subrate | undefined) {
    if (!subrate) {
        return undefined;
    }
    return `${subrate.name}, Qty: ${subrate.quantity}`;
}

/**
 * param {string} dateTimeString
 * returns {string} example: 2023-05-16 11:10 PM
 */
function formatDateTimeTo12Hour(dateTimeString: string): string {
    if (!dateTimeString) {
        return '';
    }
    const date = new Date(dateTimeString);
    return format(date, 'hh:mm a, yyyy-MM-dd');
}

function getTimeForDisplay(transaction: OnyxEntry<Transaction>) {
    const customUnitRateDate = transaction?.comment?.customUnit?.attributes?.dates ?? {start: '', end: ''};
    return `${formatDateTimeTo12Hour(customUnitRateDate.start)} - ${formatDateTimeTo12Hour(customUnitRateDate.end)}`;
}

function getTimeDifferenceIntervals(transaction: OnyxEntry<Transaction>) {
    const customUnitRateDate = transaction?.comment?.customUnit?.attributes?.dates ?? {start: '', end: ''};
    const startDate = new Date(customUnitRateDate.start);
    const endDate = new Date(customUnitRateDate.end);
    const firstDayDiff = differenceInMinutes(startOfDay(addDays(startDate, 1)), startDate);
    const tripDaysDiff = differenceInDays(startOfDay(endDate), startOfDay(addDays(startDate, 1)));
    const lastDayDiff = differenceInMinutes(endDate, startOfDay(endDate));
    return {
        firstDay: firstDayDiff === 1440 ? undefined : (firstDayDiff / 60).toFixed(2),
        tripDays: firstDayDiff === 1440 ? tripDaysDiff + 1 : tripDaysDiff,
        lastDay: lastDayDiff === 0 ? undefined : (lastDayDiff / 60).toFixed(2),
    };
}

export type {Destination};

export {getCustomUnitID, getDestinationListSections, getDestinationForDisplay, getSubratesFields, getSubratesForDisplay, getTimeForDisplay, getTimeDifferenceIntervals};
