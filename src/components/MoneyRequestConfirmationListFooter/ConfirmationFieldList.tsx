import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTagLists} from '@libs/PolicyUtils';
import variables from '@styles/variables';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import ClassificationFields from './fieldGroups/ClassificationFields';
import computeFieldVisibility, {hasBelowShowMore} from './fieldGroups/fieldVisibility';
import SettingsFields from './fieldGroups/SettingsFields';
import TransactionDetailsFields from './fieldGroups/TransactionDetailsFields';
import type {AmountDisplay, CompactState, DistanceData, DistanceFlags, ErrorState, ExpenseMode, RequiredFlags, ToggleHandlers, VisibilityFlags} from './fieldGroupTypes';
import useFooterDerivedFlags from './hooks/useFooterDerivedFlags';
import useFooterTagVisibility from './hooks/useFooterTagVisibility';

type ConfirmationFieldListProps = {
    /** Active policy (resolved by the caller; passed in to avoid a duplicate Onyx subscription) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists (resolved by the caller; passed in to avoid a duplicate Onyx subscription) */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Selected participants (drives ReportField presentation) */
    selectedParticipants: Participant[];

    /** What kind of expense the surface is confirming */
    expenseMode: ExpenseMode;

    /** Distance-mode discriminators (only meaningful when expenseMode.isDistance) */
    distanceFlags: DistanceFlags;

    /** Distance-rate metadata */
    distanceData: DistanceData;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Per-field "required" flags */
    requiredFlags: RequiredFlags;

    /** Caller-supplied visibility decisions */
    visibilityFlags: VisibilityFlags;

    /** Error state */
    errorState: ErrorState;

    /** Toggle handlers */
    toggleHandlers: ToggleHandlers;

    /** Compact-mode bookkeeping */
    compactState: CompactState;

    /** Triggers submit from inline inputs */
    onSubmitForm?: () => void;
};

function ConfirmationFieldList({
    policy,
    policyTags,
    selectedParticipants,
    expenseMode,
    distanceFlags,
    distanceData,
    amountDisplay,
    requiredFlags,
    visibilityFlags,
    errorState,
    toggleHandlers,
    compactState,
    onSubmitForm,
}: ConfirmationFieldListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'DownArrow']);
    const {action, iouType, transactionID, isReadOnly, isPolicyExpenseChat} = useConfirmationFields();
    const policyTagLists = getTagLists(policyTags);

    const flags = useFooterDerivedFlags({
        action,
        iouType,
        transactionID,
        policy,
        policyTagLists,
        isPolicyExpenseChat,
        isReadOnly,
        isDistanceRequest: expenseMode.isDistance,
        isPerDiemRequest: expenseMode.isPerDiem,
        isTimeRequest: expenseMode.isTime,
        isTypeInvoice: expenseMode.isInvoice,
        shouldShowSmartScanFields: visibilityFlags.shouldShowSmartScanFields,
    });

    const {tagVisibility, previousTagsVisibility} = useFooterTagVisibility({
        shouldShowTags: flags.shouldShowTags,
        policy,
        policyTags,
        transactionID,
    });

    const fieldVisibility = computeFieldVisibility({
        shouldShowSmartScanFields: visibilityFlags.shouldShowSmartScanFields,
        shouldShowAmountField: visibilityFlags.shouldShowAmountField,
        isDistanceRequest: expenseMode.isDistance,
        shouldShowMerchant: visibilityFlags.shouldShowMerchant,
        shouldShowTimeRequestFields: flags.shouldShowTimeRequestFields,
        shouldShowCategories: visibilityFlags.shouldShowCategories,
        isCategoryRequired: requiredFlags.isCategoryRequired,
        shouldShowDate: flags.shouldShowDate,
        tagVisibility,
        policyTagLists,
        shouldShowTax: visibilityFlags.shouldShowTax,
        shouldShowAttendees: flags.shouldShowAttendees,
        shouldShowReimbursable: flags.shouldShowReimbursable,
        shouldShowBillable: flags.shouldShowBillable,
        isPolicyExpenseChat,
    });
    const shouldShowMoreButton = hasBelowShowMore(fieldVisibility);

    return (
        <View style={[styles.mb5, styles.mt2]}>
            {compactState.isCompactMode && (
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
                policy={policy}
                distanceFlags={distanceFlags}
                amountDisplay={amountDisplay}
                distanceData={distanceData}
                requiredFlags={requiredFlags}
                errorState={errorState}
                shouldNavigateToUpgradePath={flags.shouldNavigateToUpgradePath}
                shouldSelectPolicy={flags.shouldSelectPolicy}
                iouCurrencyCode={flags.iouCurrencyCode}
                isCompactMode={compactState.isCompactMode}
                fieldVisibility={fieldVisibility}
                onSubmitForm={onSubmitForm}
                isParticipantPickerVisible={visibilityFlags.isParticipantPickerVisible}
            />

            <ClassificationFields
                policy={policy}
                policyForMovingExpenses={flags.policyForMovingExpenses}
                policyTagLists={policyTagLists}
                previousTagsVisibility={previousTagsVisibility}
                isCategoryRequired={requiredFlags.isCategoryRequired}
                canModifyTaxFields={flags.canModifyTaxFields}
                errorState={errorState}
                shouldNavigateToUpgradePath={flags.shouldNavigateToUpgradePath}
                shouldSelectPolicy={flags.shouldSelectPolicy}
                iouCurrencyCode={flags.iouCurrencyCode}
                formattedAmountPerAttendee={amountDisplay.formattedAmountPerAttendee}
                isCompactMode={compactState.isCompactMode}
                fieldVisibility={fieldVisibility}
            />

            <SettingsFields
                selectedParticipants={selectedParticipants}
                shouldShowBillable={flags.shouldShowBillable}
                shouldShowReimbursable={flags.shouldShowReimbursable}
                isPerDiemRequest={expenseMode.isPerDiem}
                toggleHandlers={toggleHandlers}
                isCompactMode={compactState.isCompactMode}
                fieldVisibility={fieldVisibility}
            />

            {compactState.isCompactMode && shouldShowMoreButton && (
                <View style={[styles.mt3, styles.alignItemsCenter, styles.pRelative, styles.mh5]}>
                    <View style={[styles.dividerLine, styles.pAbsolute, styles.w100, styles.justifyContentCenter, {transform: [{translateY: -0.5}]}]} />
                    <Button
                        text={translate('common.showMore')}
                        onPress={() => compactState.setShowMoreFields(true)}
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
