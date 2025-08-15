import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAttributesDerivedValue} from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import {convertToDisplayString} from './CurrencyUtils';

type BrickRoad = ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;

let reportAttributes: ReportAttributesDerivedValue['reports'];
Onyx.connect({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    callback: (value) => {
        if (!value) {
            return;
        }
        reportAttributes = value.reports;
    },
});
/**
 * @param altReportActions Replaces (local) allReportActions used within (local) function getWorkspacesBrickRoads
 * @returns BrickRoad for the policy passed as a param and optionally actionsByReport (if passed)
 */
const getBrickRoadForPolicy = (report: Report): BrickRoad => {
    return reportAttributes?.[report.reportID]?.brickRoadStatus;
};

function getChatTabBrickRoadReport(orderedReports: Array<OnyxEntry<Report>> = []): OnyxEntry<Report> {
    if (!orderedReports.length) {
        return undefined;
    }

    let reportWithGBR: OnyxEntry<Report>;

    const reportWithRBR = orderedReports.find((report) => {
        const brickRoad = report ? getBrickRoadForPolicy(report) : undefined;
        if (!reportWithGBR && brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO) {
            reportWithGBR = report;
            return false;
        }
        return brickRoad === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    });

    if (reportWithRBR) {
        return reportWithRBR;
    }

    if (reportWithGBR) {
        return reportWithGBR;
    }

    return undefined;
}

function getChatTabBrickRoad(orderedReports: Array<OnyxEntry<Report>>): BrickRoad | undefined {
    const report = getChatTabBrickRoadReport(orderedReports);
    return report ? getBrickRoadForPolicy(report) : undefined;
}

/**
 * @param unit Unit
 * @returns translation key for the unit
 */
function getUnitTranslationKey(unit: Unit): TranslationPaths {
    const unitTranslationKeysStrategy: Record<Unit, TranslationPaths> = {
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: 'common.kilometers',
        [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: 'common.miles',
    };

    return unitTranslationKeysStrategy[unit];
}

/**
 * @param error workspace change owner error
 * @param translate translation function
 * @param policy policy object
 * @param accountLogin account login/email
 * @returns ownership change checks page display text's
 */
function getOwnershipChecksDisplayText(
    error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>,
    translate: LocaleContextProps['translate'],
    policy: OnyxEntry<Policy>,
    accountLogin: string | undefined,
) {
    let title;
    let text;
    let buttonText;

    const changeOwner = policy?.errorFields?.changeOwner;
    const subscription = changeOwner?.subscription as unknown as {ownerUserCount: number; totalUserCount: number};
    const ownerOwesAmount = changeOwner?.ownerOwesAmount as unknown as {ownerEmail: string; amount: number; currency: string};

    switch (error) {
        case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
            title = translate('workspace.changeOwner.amountOwedTitle');
            text = translate('workspace.changeOwner.amountOwedText');
            buttonText = translate('workspace.changeOwner.amountOwedButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
            title = translate('workspace.changeOwner.ownerOwesAmountTitle');
            text = translate('workspace.changeOwner.ownerOwesAmountText', {
                email: ownerOwesAmount?.ownerEmail,
                amount: convertToDisplayString(ownerOwesAmount?.amount, ownerOwesAmount?.currency),
            });
            buttonText = translate('workspace.changeOwner.ownerOwesAmountButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
            title = translate('workspace.changeOwner.subscriptionTitle');
            text = translate('workspace.changeOwner.subscriptionText', {
                usersCount: subscription?.ownerUserCount,
                finalCount: subscription?.totalUserCount,
            });
            buttonText = translate('workspace.changeOwner.subscriptionButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
            title = translate('workspace.changeOwner.duplicateSubscriptionTitle');
            text = translate('workspace.changeOwner.duplicateSubscriptionText', {
                email: changeOwner?.duplicateSubscription ?? '',
                workspaceName: policy?.name ?? '',
            });
            buttonText = translate('workspace.changeOwner.duplicateSubscriptionButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
            title = translate('workspace.changeOwner.hasFailedSettlementsTitle');
            text = translate('workspace.changeOwner.hasFailedSettlementsText', {email: accountLogin ?? ''});
            buttonText = translate('workspace.changeOwner.hasFailedSettlementsButtonText');
            break;
        case CONST.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE:
            title = translate('workspace.changeOwner.failedToClearBalanceTitle');
            text = translate('workspace.changeOwner.failedToClearBalanceText');
            buttonText = translate('workspace.changeOwner.failedToClearBalanceButtonText');
            break;
        default:
            title = '';
            text = '';
            buttonText = '';
            break;
    }

    return {title, text, buttonText};
}

export {getChatTabBrickRoadReport, getBrickRoadForPolicy, getChatTabBrickRoad, getUnitTranslationKey, getOwnershipChecksDisplayText};
export type {BrickRoad};
