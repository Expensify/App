import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Unit} from '@src/types/onyx/Policy';
import ClassificationFields from './fieldGroups/ClassificationFields';
import computeFieldVisibility, {hasBelowShowMore} from './fieldGroups/fieldVisibility';
import SettingsFields from './fieldGroups/SettingsFields';
import TransactionDetailsFields from './fieldGroups/TransactionDetailsFields';

type TagVisibilityEntry = {
    /** Whether this tag list should be displayed */
    shouldShow: boolean;
    /** Whether the tag for this list is required to submit */
    isTagRequired: boolean;
};

type ConfirmationFieldListProps = {
    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action, when editing */
    reportActionID: string | undefined;

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Resolved policy used when moving an expense off track-expense (drives tax fallback) */
    policyForMovingExpenses: OnyxEntry<OnyxTypes.Policy> | undefined;

    /** Tag lists configured on the policy */
    policyTagLists: Array<ValueOf<OnyxTypes.PolicyTagLists>>;

    /** Per-tag-list visibility (parallel to `policyTagLists` order) */
    tagVisibility: TagVisibilityEntry[];

    /** Previous render's per-tag-list `shouldShow` projection (drives `TagFields` transitions) */
    previousTagsVisibility: boolean[];

    /** Selected participants (drives ReportField presentation) */
    selectedParticipants: Participant[];

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm: boolean;

    /** Whether the new manual expense flow beta is enabled */
    isNewManualExpenseFlowEnabled: boolean;

    /** Whether to show smart-scan-driven fields (amount, merchant, date) */
    shouldShowSmartScanFields: boolean;

    /** Whether the amount field should be displayed when smart-scan fields are shown */
    shouldShowAmountField: boolean;

    /** Whether the merchant field should be displayed */
    shouldShowMerchant: boolean;

    /** Whether the categories field should be displayed */
    shouldShowCategories: boolean;

    /** Whether the date field should be displayed (smart-scan or distance) */
    shouldShowDate: boolean;

    /** Whether the tax field should be displayed */
    shouldShowTax: boolean;

    /** Whether the attendees field should be displayed */
    shouldShowAttendees: boolean;

    /** Whether the time-request fields should be displayed */
    shouldShowTimeRequestFields: boolean;

    /** Whether the billable toggle should be displayed */
    shouldShowBillable: boolean;

    /** Whether the reimbursable toggle should be displayed */
    shouldShowReimbursable: boolean;

    /** Whether navigating to upgrade is required to proceed past blocked workspaces */
    shouldNavigateToUpgradePath: boolean;

    /** Whether the user must select a policy before submitting */
    shouldSelectPolicy: boolean;

    /** Whether tax field modifications are allowed */
    canModifyTaxFields: boolean;

    /** Whether the active transaction is a distance request */
    isDistanceRequest: boolean;

    /** Whether the active transaction is a manual distance request */
    isManualDistanceRequest: boolean;

    /** Whether the active transaction is an odometer distance request */
    isOdometerDistanceRequest: boolean;

    /** Whether the active transaction is a GPS distance request */
    isGPSDistanceRequest: boolean;

    /** Whether the merchant is required to submit */
    isMerchantRequired: boolean | undefined;

    /** Whether the description is required to submit */
    isDescriptionRequired: boolean;

    /** Whether the categories field is required */
    isCategoryRequired: boolean;

    /** Whether the surface is in a policy-expense chat */
    isPolicyExpenseChat: boolean;

    /** Whether we're editing an existing split expense */
    isEditingSplitBill: boolean;

    /** Whether the active transaction is a per-diem request */
    isPerDiemRequest: boolean;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Form-level error message */
    formError: string;

    /** ISO currency code for the transaction */
    iouCurrencyCode: string;

    /** Total amount, in the smallest currency unit */
    amount: number;

    /** Pre-formatted amount string for display */
    formattedAmount: string;

    /** Pre-formatted amount-per-attendee string for display */
    formattedAmountPerAttendee: string;

    /** Distance value (drives `DistanceField`) */
    distance: number;

    /** Whether a route is available for distance requests */
    hasRoute: boolean;

    /** Distance unit */
    unit: Unit | undefined;

    /** Distance rate (per-unit cost) */
    rate: number | undefined;

    /** Display name of the active distance rate */
    distanceRateName: string | undefined;

    /** Currency of the active distance rate */
    distanceRateCurrency: string;

    /** Callback when reimbursable is toggled */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Callback when billable is toggled */
    onToggleBillable?: (isOn: boolean) => void;

    /** Setter that expands the optional fields when the user taps "Show more" */
    setShowMoreFields: (showMoreFields: boolean) => void;

    /** Whether the receipt area is using compact mode (drives the show-more split) */
    isCompactMode: boolean;
};

function ConfirmationFieldList({
    action,
    iouType,
    transactionID,
    reportID,
    reportActionID,
    transaction,
    policy,
    policyForMovingExpenses,
    policyTagLists,
    tagVisibility,
    previousTagsVisibility,
    selectedParticipants,
    isReadOnly,
    didConfirm,
    isNewManualExpenseFlowEnabled,
    shouldShowSmartScanFields,
    shouldShowAmountField,
    shouldShowMerchant,
    shouldShowCategories,
    shouldShowDate,
    shouldShowTax,
    shouldShowAttendees,
    shouldShowTimeRequestFields,
    shouldShowBillable,
    shouldShowReimbursable,
    shouldNavigateToUpgradePath,
    shouldSelectPolicy,
    canModifyTaxFields,
    isDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isGPSDistanceRequest,
    isMerchantRequired,
    isDescriptionRequired,
    isCategoryRequired,
    isPolicyExpenseChat,
    isEditingSplitBill,
    isPerDiemRequest,
    shouldDisplayFieldError,
    formError,
    iouCurrencyCode,
    amount,
    formattedAmount,
    formattedAmountPerAttendee,
    distance,
    hasRoute,
    unit,
    rate,
    distanceRateName,
    distanceRateCurrency,
    onToggleReimbursable,
    onToggleBillable,
    setShowMoreFields,
    isCompactMode,
}: ConfirmationFieldListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'DownArrow']);

    const fieldVisibility = computeFieldVisibility({
        shouldShowSmartScanFields,
        shouldShowAmountField,
        isDistanceRequest,
        shouldShowMerchant,
        shouldShowTimeRequestFields,
        shouldShowCategories,
        isCategoryRequired,
        shouldShowDate,
        tagVisibility,
        policyTagLists,
        shouldShowTax,
        shouldShowAttendees,
        shouldShowReimbursable,
        shouldShowBillable,
        isPolicyExpenseChat,
    });
    const shouldShowMoreButton = hasBelowShowMore(fieldVisibility);

    return (
        <View style={[styles.mb5, styles.mt2]}>
            {isCompactMode && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.pl5, styles.gap2, styles.mb2, styles.pr10]}>
                    <Icon
                        src={icons.Sparkles}
                        fill={theme.icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                    />
                    <Text style={styles.rightLabelMenuItem}>{translate('iou.automaticallyEnterExpenseDetails')}</Text>
                </View>
            )}

            <TransactionDetailsFields
                action={action}
                iouType={iouType}
                transactionID={transactionID}
                reportID={reportID}
                reportActionID={reportActionID}
                transaction={transaction}
                policy={policy}
                isReadOnly={isReadOnly}
                didConfirm={didConfirm}
                isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
                isEditingSplitBill={isEditingSplitBill}
                isPolicyExpenseChat={isPolicyExpenseChat}
                isManualDistanceRequest={isManualDistanceRequest}
                isOdometerDistanceRequest={isOdometerDistanceRequest}
                isGPSDistanceRequest={isGPSDistanceRequest}
                isMerchantRequired={isMerchantRequired}
                isDescriptionRequired={isDescriptionRequired}
                shouldDisplayFieldError={shouldDisplayFieldError}
                formError={formError}
                shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                shouldSelectPolicy={shouldSelectPolicy}
                iouCurrencyCode={iouCurrencyCode}
                amount={amount}
                formattedAmount={formattedAmount}
                distance={distance}
                hasRoute={hasRoute}
                unit={unit}
                rate={rate}
                distanceRateName={distanceRateName}
                distanceRateCurrency={distanceRateCurrency}
                isCompactMode={isCompactMode}
                fieldVisibility={fieldVisibility}
            />

            <ClassificationFields
                action={action}
                iouType={iouType}
                transactionID={transactionID}
                reportID={reportID}
                reportActionID={reportActionID}
                transaction={transaction}
                policy={policy}
                policyForMovingExpenses={policyForMovingExpenses}
                policyTagLists={policyTagLists}
                previousTagsVisibility={previousTagsVisibility}
                isReadOnly={isReadOnly}
                didConfirm={didConfirm}
                isCategoryRequired={isCategoryRequired}
                canModifyTaxFields={canModifyTaxFields}
                shouldDisplayFieldError={shouldDisplayFieldError}
                shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                shouldSelectPolicy={shouldSelectPolicy}
                iouCurrencyCode={iouCurrencyCode}
                formattedAmountPerAttendee={formattedAmountPerAttendee}
                formError={formError}
                isCompactMode={isCompactMode}
                fieldVisibility={fieldVisibility}
            />

            <SettingsFields
                action={action}
                iouType={iouType}
                transactionID={transactionID}
                reportID={reportID}
                reportActionID={reportActionID}
                transaction={transaction}
                selectedParticipants={selectedParticipants}
                isReadOnly={isReadOnly}
                shouldShowBillable={shouldShowBillable}
                shouldShowReimbursable={shouldShowReimbursable}
                isPolicyExpenseChat={isPolicyExpenseChat}
                isPerDiemRequest={isPerDiemRequest}
                onToggleReimbursable={onToggleReimbursable}
                onToggleBillable={onToggleBillable}
                isCompactMode={isCompactMode}
                fieldVisibility={fieldVisibility}
            />

            {isCompactMode && shouldShowMoreButton && (
                <View style={[styles.mt3, styles.alignItemsCenter, styles.pRelative, styles.mh5]}>
                    <View style={[styles.dividerLine, styles.pAbsolute, styles.w100, styles.justifyContentCenter, {transform: [{translateY: -0.5}]}]} />
                    <Button
                        text={translate('common.showMore')}
                        onPress={() => setShowMoreFields(true)}
                        small
                        shouldShowRightIcon
                        iconRight={icons.DownArrow}
                        innerStyles={[styles.hoveredComponentBG, styles.ph4, styles.pv2]}
                        textStyles={styles.buttonSmallText}
                    />
                </View>
            )}
        </View>
    );
}

export default ConfirmationFieldList;
