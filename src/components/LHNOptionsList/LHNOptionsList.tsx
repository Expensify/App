import {ContentStyle, FlashList} from '@shopify/flash-list';
import React, {useCallback} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import withCurrentReportID, {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import compose from '@libs/compose';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {PersonalDetails, Policy, Report, ReportActions, Transaction} from '@src/types/onyx';
import OptionRowLHNData from './OptionRowLHNData';

const keyExtractor = (item) => `report_${item}`;

type LHNOptionsListProps = {
    /** Wrapper style for the section list */
    style?: StyleProp<ViewStyle>;

    /** Extra styles for the section list container */
    contentContainerStyles?: ContentStyle;

    /** Sections for the section list */
    data: string[];

    /** Callback to fire when a row is selected */
    onSelectRow: (reportID: string) => void;

    /** Toggle between compact and default view of the option */
    optionMode: ValueOf<typeof CONST.OPTION_MODE>;

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions?: boolean;

    /** The policy which the user has access to and which the report could be tied to */
    policy: OnyxEntry<Record<string, Policy>>;

    /** All reports shared with the user */
    reports: OnyxEntry<Record<string, Report>>;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<Record<string, ReportActions>>;

    /** Indicates which locale the user currently has selected */
    preferredLocale: OnyxEntry<ValueOf<typeof CONST.LOCALES>>;

    /** List of users' personal details */
    personalDetails: OnyxEntry<Record<string, PersonalDetails>>;

    /** The transaction from the parent report action */
    transactions: OnyxEntry<Record<string, Transaction>>;

    /** List of draft comments */
    draftComments: OnyxEntry<Record<string, string>>;
} & CurrentReportIDContextValue;

function LHNOptionsList({
    style,
    contentContainerStyles,
    data,
    onSelectRow,
    optionMode,
    shouldDisableFocusOptions = false,
    reports = {},
    reportActions = {},
    policy = {},
    preferredLocale = CONST.LOCALES.DEFAULT,
    personalDetails = {},
    transactions = {},
    draftComments = {},
    currentReportID = '',
}: LHNOptionsListProps) {
    const styles = useThemeStyles();
    /**
     * Function which renders a row in the list
     */
    const renderItem = useCallback(
        ({item: reportID}: {item: string}) => {
            const itemFullReport: Report | undefined = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const itemReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
            const itemParentReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${itemFullReport?.parentReportID}`];
            const itemParentReportAction = itemParentReportActions?.[itemFullReport?.parentReportActionID ?? ''];
            const itemPolicy = policy?.[`${ONYXKEYS.COLLECTION.POLICY}${itemFullReport?.policyID}`];
            const transactionID = itemParentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? itemParentReportAction.originalMessage.IOUTransactionID : '';
            const itemTransaction = transactionID ? transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] : {};
            const itemComment = draftComments?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`] ?? '';
            const participantsPersonalDetails = OptionsListUtils.getPersonalDetailsForAccountIDs(itemFullReport?.participantAccountIDs ?? [], personalDetails);

            return (
                <OptionRowLHNData
                    reportID={reportID}
                    fullReport={itemFullReport}
                    reportActions={itemReportActions}
                    parentReportAction={itemParentReportAction}
                    policy={itemPolicy}
                    personalDetails={participantsPersonalDetails}
                    transaction={itemTransaction}
                    receiptTransactions={transactions}
                    viewMode={optionMode}
                    isFocused={!shouldDisableFocusOptions && reportID === currentReportID}
                    onSelectRow={onSelectRow}
                    preferredLocale={preferredLocale}
                    comment={itemComment}
                />
            );
        },
        [currentReportID, draftComments, onSelectRow, optionMode, personalDetails, policy, preferredLocale, reportActions, reports, shouldDisableFocusOptions, transactions],
    );

    return (
        <View style={style ?? styles.flex1}>
            <FlashList
                indicatorStyle="white"
                keyboardShouldPersistTaps="always"
                contentContainerStyle={contentContainerStyles}
                data={data}
                testID="lhn-options-list"
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                estimatedItemSize={optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight}
                extraData={[currentReportID]}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

LHNOptionsList.displayName = 'LHNOptionsList';

export default compose(
    withCurrentReportID,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        reportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
        },
        policy: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        transactions: {
            key: ONYXKEYS.COLLECTION.TRANSACTION,
        },
        draftComments: {
            key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        },
    }),
)(LHNOptionsList);

export type {LHNOptionsListProps};
