/** Keeps the billable switch and its validation messages together. */
import ViolationMessages from '@components/ViolationMessages';
import type {ViolationMessagesProps} from '@components/ViolationMessages';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type {ToggleFieldProps} from './ToggleField';

import ToggleField from './ToggleField';

type BillableFieldProps = Pick<ToggleFieldProps, 'pendingAction' | 'isOn' | 'onToggle'> &
    Pick<
        ViolationMessagesProps,
        'violations' | 'canEdit' | 'isMarkAsCash' | 'companyCardPageURL' | 'connectionLink' | 'routeDistanceMeters' | 'distanceUnit' | 'policyVendors' | 'transactionCurrency'
    >;

function BillableField({
    pendingAction,
    isOn,
    onToggle,
    violations,
    canEdit,
    isMarkAsCash,
    companyCardPageURL,
    connectionLink,
    routeDistanceMeters,
    distanceUnit,
    policyVendors,
    transactionCurrency,
}: BillableFieldProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ToggleField
            pendingAction={pendingAction}
            accessibilityLabel={translate('common.billable')}
            isOn={isOn}
            onToggle={onToggle}
            disabled={!canEdit}
        >
            {violations.length > 0 && (
                <View dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}>
                    <ViolationMessages
                        violations={violations}
                        containerStyle={[styles.mt1, styles.userSelectNone]}
                        textStyle={[styles.ph0]}
                        isLast
                        isMarkAsCash={isMarkAsCash}
                        canEdit={canEdit}
                        companyCardPageURL={companyCardPageURL}
                        connectionLink={connectionLink}
                        routeDistanceMeters={routeDistanceMeters}
                        distanceUnit={distanceUnit}
                        policyVendors={policyVendors}
                        transactionCurrency={transactionCurrency}
                    />
                </View>
            )}
        </ToggleField>
    );
}

export default BillableField;
