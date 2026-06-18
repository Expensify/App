import React, {useMemo} from 'react';
import DistanceWithCommuterExclusion from '@components/DistanceWithCommuterExclusion';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {CommuterExclusionData} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Unit} from '@src/types/onyx/Policy';

type DistanceFieldProps = {
    hasRoute: boolean;
    distance: number;
    unit: Unit | undefined;
    rate: number | undefined;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isGPSDistanceRequest: boolean;
    isReadOnly: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    reportActionID: string | undefined;
    commuterExclusionData?: CommuterExclusionData;
};

function formatDistance(distanceValue: number, distanceUnit: Unit): string {
    return `${distanceValue.toFixed(2)} ${distanceUnit}`;
}

function DistanceField({
    hasRoute,
    distance,
    unit,
    rate,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isGPSDistanceRequest,
    isReadOnly,
    didConfirm,
    transactionID,
    action,
    iouType,
    reportID,
    reportActionID,
    commuterExclusionData,
}: DistanceFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // When commuter exclusion applies, compute the original distance and format the description/title
    const {descriptionLabel, displayTitle, furtherDetailsComponent} = useMemo(() => {
        const baseDescription = translate('common.distance');
        const baseTitle = DistanceRequestUtils.getDistanceForDisplay(hasRoute, distance, unit, rate, translate, undefined, isManualDistanceRequest);

        if (!commuterExclusionData || !unit) {
            return {
                descriptionLabel: baseDescription,
                displayTitle: baseTitle,
                furtherDetailsComponent: undefined,
            };
        }

        // Calculate original distance (reimbursable + commuter exclusion)
        const originalDistance = commuterExclusionData.reimbursableDistance + commuterExclusionData.commuterExclusion;
        const originalDistanceFormatted = formatDistance(originalDistance, commuterExclusionData.distanceUnit);
        const reimbursableFormatted = formatDistance(commuterExclusionData.reimbursableDistance, commuterExclusionData.distanceUnit);

        return {
            descriptionLabel: `${baseDescription} ${CONST.DOT_SEPARATOR} ${translate('distance.commuterExclusion.original')}: ${originalDistanceFormatted}`,
            displayTitle: reimbursableFormatted,
            furtherDetailsComponent: (
                <DistanceWithCommuterExclusion
                    commuterExclusion={commuterExclusionData.commuterExclusion}
                    distanceUnit={commuterExclusionData.distanceUnit}
                />
            ),
        };
    }, [translate, hasRoute, distance, unit, rate, isManualDistanceRequest, commuterExclusionData]);

    return (
        <MenuItemWithTopDescription
            shouldShowRightIcon={!isReadOnly && !isGPSDistanceRequest}
            title={displayTitle}
            description={descriptionLabel}
            furtherDetailsComponent={furtherDetailsComponent}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }

                if (isManualDistanceRequest) {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_MANUAL.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
                    return;
                }

                if (isOdometerDistanceRequest) {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE_ODOMETER.getRoute(action, iouType, transactionID, reportID));
                    return;
                }

                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DISTANCE.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute(), reportActionID));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly && !isGPSDistanceRequest}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DISTANCE_FIELD}
        />
    );
}

export default DistanceField;
