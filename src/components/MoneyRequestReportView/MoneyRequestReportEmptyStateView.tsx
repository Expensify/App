import ScrollView from '@components/ScrollView';

import useThemeStyles from '@hooks/useThemeStyles';

import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import MoneyRequestViewReportFields from './MoneyRequestViewReportFields';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';

type MoneyRequestReportEmptyStateViewProps = {
    /** The empty money request report */
    report: OnyxTypes.Report;

    /** The workspace the report belongs to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;
};

/** Rendered instead of the unified list when the report has no transactions and no comments. */
function MoneyRequestReportEmptyStateView({report, policy, onLayout}: MoneyRequestReportEmptyStateViewProps) {
    const styles = useThemeStyles();

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <MoneyRequestViewReportFields
                report={report}
                policy={policy}
            />
            <SearchMoneyRequestReportEmptyState
                report={report}
                onLayout={onLayout}
                policy={policy}
            />
        </ScrollView>
    );
}

export default MoneyRequestReportEmptyStateView;
