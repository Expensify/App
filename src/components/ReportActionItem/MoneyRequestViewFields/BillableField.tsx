// Keeps billable policy violations next to the expense's billable control.
import ViolationMessages from '@components/ViolationMessages';
import type {ViolationMessagesProps} from '@components/ViolationMessages';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {ToggleFieldProps} from './ToggleField';

import ToggleField from './ToggleField';

type BillableFieldProps = Pick<ToggleFieldProps, 'pendingAction' | 'isOn' | 'onToggle'> &
    Pick<ViolationMessagesProps, 'violations' | 'canEdit' | 'isMarkAsCash' | 'companyCardPageURL' | 'connectionLink' | 'routeDistanceMeters' | 'distanceUnit'>;

function BillableField({pendingAction, isOn, onToggle, violations, canEdit, isMarkAsCash, companyCardPageURL, connectionLink, routeDistanceMeters, distanceUnit}: BillableFieldProps) {
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
                <ViolationMessages
                    violations={violations}
                    containerStyle={[styles.mt1]}
                    textStyle={[styles.ph0]}
                    isLast
                    isMarkAsCash={isMarkAsCash}
                    canEdit={canEdit}
                    companyCardPageURL={companyCardPageURL}
                    connectionLink={connectionLink}
                    routeDistanceMeters={routeDistanceMeters}
                    distanceUnit={distanceUnit}
                />
            )}
        </ToggleField>
    );
}

export default BillableField;
