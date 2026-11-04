import Badge from '@components/Badge';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDestinationForDisplay, getSubratesFields, getSubratesForDisplay, getTimeDifferenceIntervals, getTimeForDisplay} from '@libs/PerDiemRequestUtils';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {CustomUnit} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import ExpenseFieldRow from './ExpenseFieldRow';

type PerDiemFieldsProps = {
    perDiemCustomUnit: CustomUnit | undefined;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    isReadOnly: boolean;
    didConfirm: boolean;
    transactionID: string | undefined;
    shouldDisplayFieldError: boolean;
    formError: string;
};

function PerDiemFields({perDiemCustomUnit, transaction, isReadOnly, didConfirm, transactionID, shouldDisplayFieldError, formError}: PerDiemFieldsProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Stopwatch', 'CalendarSolid']);

    const subRates = getSubratesFields(perDiemCustomUnit, transaction);
    const shouldDisplaySubrateError = (shouldDisplayFieldError || formError === 'iou.error.invalidSubrateLength') && (subRates.length === 0 || (subRates.length === 1 && !subRates.at(0)));

    const subRateFields = subRates.map((field, index) => (
        <ExpenseFieldRow
            key={`${translate('common.subrate')}${field?.key ?? index}`}
            name={translate('common.subrate')}
            value={getSubratesForDisplay(field, translate('iou.qty'))}
            errorText={index === 0 && shouldDisplaySubrateError ? translate('common.error.fieldRequired') : ''}
            onPress={() => {
                if (!transactionID) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SUBRATE_EDIT.getRoute(index)));
            }}
            isDisabled={didConfirm}
            isInteractive={!isReadOnly}
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
            <ExpenseFieldRow
                name={translate('common.destination')}
                value={getDestinationForDisplay(perDiemCustomUnit, transaction)}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION_EDIT.path));
                }}
                isDisabled={didConfirm}
                isInteractive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.DESTINATION_FIELD}
            />
            <ExpenseFieldRow
                name={translate('iou.time')}
                value={getTimeForDisplay(transaction, dateFnsLocale)}
                numberOfLinesValue={2}
                onPress={() => {
                    if (!transactionID) {
                        return;
                    }
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_TIME_EDIT.path));
                }}
                isDisabled={didConfirm}
                isInteractive={!isReadOnly}
                sentryLabel={CONST.SENTRY_LABEL.REQUEST_CONFIRMATION_LIST.TIME_FIELD}
            />

            {badgeElements.length > 0 && <View style={[styles.flexRow, styles.gap1, styles.justifyContentStart, styles.mh4, styles.flexWrap]}>{badgeElements}</View>}

            {subRateFields}
        </>
    );
}

export default PerDiemFields;
