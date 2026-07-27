/**
 * Lazy contact SearchOptions: filter/rank shells hydrated after getValidOptions selects top-N survivors.
 */
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from '@libs/LocalePhoneNumber';
import {translateLocal} from '@libs/Localize';
import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import type {PersonalDetails, PersonalDetailsList, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {SearchOption} from './types';

type CreateLazyContactOptionParams = {
    personalDetail: PersonalDetails | null;
    accountID: number;
    report: Report | undefined;
    /** Already normalized via getPersonalDetailsForAccountIDs (mutates accountID in place). */
    detail: PersonalDetails | undefined;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    buildFullOption: () => SearchOption<PersonalDetails | null>;
};

/**
 * Minimal contact option: only fields getValidOptions needs for filtering/ranking.
 * Full createOption work is deferred to buildFullOption for contacts that survive the top-N heap.
 */
function createLazyContactOption({personalDetail, accountID, report, detail, personalDetails, buildFullOption}: CreateLazyContactOptionParams): SearchOption<PersonalDetails | null> {
    const formattedLogin = formatPhoneNumberPhoneUtils(detail?.login ?? '');
    // Match createOption's showPersonalDetails reportName (translateLocal — same default createOption uses when translate is omitted).
    const text =
        getDisplayNameForParticipant({
            accountID,
            personalDetailsData: report ? undefined : (personalDetails ?? undefined),
            formatPhoneNumber: formatPhoneNumberPhoneUtils,
            translate: translateLocal,
        }) || formattedLogin;

    return {
        item: personalDetail,
        // eslint-disable-next-line rulesdir/no-default-id-values
        reportID: report?.reportID ?? '',
        keyForList: report ? String(report.reportID) : String(accountID),
        text,
        // Comparator fallback only; hydrated option recomputes the real alternateText.
        alternateText: report && detail?.login ? detail.login : formattedLogin,
        login: detail?.login,
        accountID: Number(detail?.accountID),
        participantsList: detail ? [detail] : [],
        isSelected: false,
        selected: false,
        brickRoadIndicator: null,
        buildFullOption,
    };
}

/** Hydrate lazily-built contacts after filtering/ranking has selected the top-N survivors. */
function hydrateLazyContactOptions<T>(options: Array<SearchOption<T>>): Array<SearchOption<T>> {
    return options.map((option) => option.buildFullOption?.() ?? option);
}

export {createLazyContactOption, hydrateLazyContactOptions};
