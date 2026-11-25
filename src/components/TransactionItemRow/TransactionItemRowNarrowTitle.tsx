/** Title line of an expense on the narrow layout: its merchant, or description without one, with its amount on the right. */
import useThemeStyles from '@hooks/useThemeStyles';

import {isScanning} from '@libs/TransactionUtils';

import type {Policy, Report} from '@src/types/onyx';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import type {TransactionWithOptionalSearchFields} from './types';

import MerchantOrDescriptionCell from './DataCells/MerchantCell';
import TotalCell from './DataCells/TotalCell';

type TransactionItemRowNarrowTitleProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    report: Report | undefined;
    policy: Policy | undefined;
    merchant: string;
    merchantOrDescription: string;
    shouldShowTooltip: boolean;

    /** Shown before the amount */
    children?: ReactNode;
};

function TransactionItemRowNarrowTitle({transactionItem, report, policy, merchant, merchantOrDescription, shouldShowTooltip, children}: TransactionItemRowNarrowTitleProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
            {!!merchantOrDescription && (
                <MerchantOrDescriptionCell
                    merchantOrDescription={merchantOrDescription}
                    shouldShowTooltip={shouldShowTooltip}
                    shouldUseNarrowLayout
                    isDescription={!merchant}
                />
            )}
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, !merchantOrDescription && styles.mlAuto]}>
                {children}
                {/* While scanning the merchant already says "Scanning...", so the amount would only repeat it */}
                {!isScanning(transactionItem) && (
                    <TotalCell
                        transactionItem={transactionItem}
                        shouldShowTooltip={shouldShowTooltip}
                        report={report}
                        policy={policy}
                        shouldUseNarrowLayout
                    />
                )}
            </View>
        </View>
    );
}

export default TransactionItemRowNarrowTitle;
