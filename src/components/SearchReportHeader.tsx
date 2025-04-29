import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {DisplayNameWithTooltips} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import DisplayNames from './DisplayNames';
import type {TransactionListItemType} from './SelectionList/types';

type SearchReportHeaderProps = {
    report: OnyxEntry<Report>;
    title: string;
    displayNamesWithTooltips: DisplayNameWithTooltips;
    shouldUseFullTitle: boolean;
    transactions: TransactionListItemType[];
};

function SearchReportHeader({report, title, displayNamesWithTooltips, shouldUseFullTitle, transactions}: SearchReportHeaderProps) {
    const styles = useThemeStyles();
    const reportName = report?.reportName ?? CONST.REPORT.DEFAULT_REPORT_NAME;

    if (transactions.length === 0) {
        return (
            <DisplayNames
                tooltipEnabled
                numberOfLines={1}
                textStyles={[styles.headerText, styles.pre]}
                shouldUseFullTitle={shouldUseFullTitle}
                fullTitle={reportName}
                displayNamesWithTooltips={displayNamesWithTooltips}
            />
        );
    }
    if (report?.type === CONST.REPORT.TYPE.IOU || report?.type === CONST.REPORT.TYPE.INVOICE) {
        return (
            <DisplayNames
                fullTitle={title}
                displayNamesWithTooltips={displayNamesWithTooltips}
                tooltipEnabled
                numberOfLines={1}
                textStyles={[styles.headerText, styles.pre]}
                shouldUseFullTitle
            />
        );
    }

    return (
        <DisplayNames
            tooltipEnabled
            numberOfLines={1}
            textStyles={[styles.headerText, styles.pre]}
            shouldUseFullTitle={shouldUseFullTitle}
            fullTitle={reportName}
            displayNamesWithTooltips={displayNamesWithTooltips}
        />
    );
}

export default SearchReportHeader;
