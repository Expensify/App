import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Badge from '@components/Badge';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getDestinationForDisplay, getSubratesFields, getSubratesForDisplay, getTimeDifferenceIntervals, getTimeForDisplay} from '@libs/PerDiemRequestUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {CustomUnit} from '@src/types/onyx/Policy';

type PerDiemFieldsProps = {
    perDiemCustomUnit: CustomUnit | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    isReadOnly: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    reportID: string;
    shouldDisplayFieldError: boolean;
    formError: string;
};

function PerDiemFields({perDiemCustomUnit, transaction, isReadOnly, didConfirm, transactionID, action, iouType, reportID, shouldDisplayFieldError, formError}: PerDiemFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch', 'CalendarSolid']);

    const subRates = getSubratesFields(perDiemCustomUnit, transaction);
    const shouldDisplaySubrateError = (shouldDisplayFieldError || formError === 'iou.error.invalidSubrateLength') && (subRates.length === 0 || (subRates.length === 1 && !subRates.at(0)));

    const subRateFields = subRates.map((field, index) => (
        <MenuItemWithTopDescription
            key={`${translate('common.subrate')}${field?.key ?? index}`}
            shouldShowRightIcon={!isReadOnly}
            title={getSubratesForDisplay(field, translate('iou.qty'))}
            description={translate('common.subrate')}
            style={[styles.moneyRequestMenuItem]}
            titleStyle={styles.flex1}
            onPress={() => {
                if (!transactionID) {
                    return;
                }
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SUBRATE_EDIT.getRoute(action, iouType, transactionID, reportID, index, Navigation.getActiveRoute()));
            }}
            disabled={didConfirm}
            interactive={!isReadOnly}
            brickRoadIndicator={index === 0 && shouldDisplaySubrateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
            errorText={index === 0 && shouldDisplaySubrateError ? translate('common.error.fieldRequired') : ''}
            sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.SUBRATE_FIELD}
        />
    ));

    const {firstDay, tripDays, lastDay} = getTimeDifferenceIntervals(transaction);

    const badgeElements = (() => {
        const badges: React.JSX.Element[] = [];
        if (firstDay) {
            badges.push(
                <Badge
                    key="firstDay"
                    icon={icons.Stopwatch}
                    text={translate('iou.firstDayText', {count: firstDay})}
                />,
            );
        }
        if (tripDays) {
            badges.push(
                <Badge
                    key="tripDays"
                    icon={icons.CalendarSolid}
                    text={translate('iou.tripLengthText', {count: tripDays})}
                />,
            );
        }
        if (lastDay) {
            badges.push(
                <Badge
                    key="lastDay"
                    icon={icons.Stopwatch}
                    text={translate('iou.lastDayText', {count: lastDay})}
                />,
            );
        }
        return badges;
    })();

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon={!isReadOnly}
                title={getDestinationForDisplay(perDiemCustomUnit, transaction)}
                description={translate('common.destination')}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_DESTINATION_EDIT.getRoute(action, iouType, transactionID, reportID, Navigation.getActiveRoute()));
                }}
                disabled={didConfirm}
                interactive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DESTINATION_FIELD}
            />
            <View style={styles.dividerLine} />
            <MenuItemWithTopDescription
                shouldShowRightIcon={!isReadOnly}
                title={getTimeForDisplay(transaction)}
                description={translate('iou.time')}
                style={[styles.moneyRequestMenuItem]}
                titleStyle={styles.flex1}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_TIME_EDIT.getRoute(action, iouType, transactionID, reportID));
                }}
                disabled={didConfirm}
                interactive={!isReadOnly}
                numberOfLinesTitle={2}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_FIELD}
            />
            <View style={[styles.flexRow, styles.gap1, styles.justifyContentStart, styles.mh3, styles.flexWrap, styles.pt1]}>{badgeElements}</View>
            <View style={styles.dividerLine} />
            {subRateFields}
            <View style={styles.dividerLine} />
        </>
    );
}

export default PerDiemFields;
