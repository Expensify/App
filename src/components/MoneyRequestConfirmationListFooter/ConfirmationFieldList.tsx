import Button from '@components/ButtonComposed';
import Icon from '@components/Icon';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getTagLists} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import type {AmountDisplay, CompactState, ErrorState, RequiredFlags, ToggleHandlers, VisibilityFlags} from './fieldGroupTypes';

import DetailsFieldsContext from './DetailsFieldsContext';
import ClassificationFields from './fieldGroups/ClassificationFields';
import computeFieldVisibility, {hasBelowShowMore} from './fieldGroups/fieldVisibility';
import SettingsFields from './fieldGroups/SettingsFields';
import useFooterDerivedFlags from './hooks/useFooterDerivedFlags';
import useFooterTagVisibility from './hooks/useFooterTagVisibility';

type ConfirmationFieldListProps = {
    /** Active policy (resolved by the caller; passed in to avoid a duplicate Onyx subscription) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists (resolved by the caller; passed in to avoid a duplicate Onyx subscription) */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Selected participants (drives ReportField presentation) */
    selectedParticipants: Participant[];

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Per-field "required" flags */
    requiredFlags: RequiredFlags;

    /** The expense-type-driven fields, supplied by the footer variant. Rendered above the classification
     *  fields, and reads what this component derives from `DetailsFieldsContext`. */
    children: React.ReactNode;

    /** Caller-supplied visibility decisions */
    visibilityFlags: VisibilityFlags;

    /** Error state */
    errorState: ErrorState;

    /** Toggle handlers */
    toggleHandlers: ToggleHandlers;

    /** Compact-mode bookkeeping */
    compactState?: CompactState;
};

function ConfirmationFieldList({
    policy,
    policyTags,
    selectedParticipants,
    amountDisplay,
    requiredFlags,
    children,
    visibilityFlags,
    errorState,
    toggleHandlers,
    compactState = {isCompactMode: false, setShowMoreFields: () => {}},
}: ConfirmationFieldListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles', 'DownArrow']);
    const {action, iouType, transactionID, isReadOnly, isPolicyExpenseChat, isDistanceRequest, isPerDiemRequest, isTimeRequest, isTypeInvoice} = useConfirmationFields();
    const policyTagLists = getTagLists(policyTags);

    const flags = useFooterDerivedFlags({
        action,
        iouType,
        transactionID,
        policy,
        policyTagLists,
        isPolicyExpenseChat,
        isReadOnly,
        isDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isTypeInvoice,
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
        isDistanceRequest,
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

    const detailsFields = {
        fieldVisibility,
        isCompactMode: compactState.isCompactMode,
        iouCurrencyCode: flags.iouCurrencyCode,
        shouldNavigateToUpgradePath: flags.shouldNavigateToUpgradePath,
        shouldSelectPolicy: flags.shouldSelectPolicy,
    };

    return (
        <DetailsFieldsContext.Provider value={detailsFields}>
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

                {children}

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
                    toggleHandlers={toggleHandlers}
                    isCompactMode={compactState.isCompactMode}
                    fieldVisibility={fieldVisibility}
                />

                {compactState.isCompactMode && shouldShowMoreButton && (
                    <View style={[styles.mt3, styles.alignItemsCenter, styles.pRelative, styles.mh5]}>
                        <View style={[styles.dividerLine, styles.pAbsolute, styles.w100, styles.justifyContentCenter, {transform: [{translateY: -0.5}]}]} />
                        <Button
                            onPress={() => compactState.setShowMoreFields(true)}
                            size={CONST.BUTTON_SIZE.SMALL}
                            // pl3 + Button.Text's built-in ph1 = 16; right stays 8 from the SMALL default, as legacy Button
                            innerStyles={[styles.hoveredComponentBG, styles.pv2, styles.pl3]}
                        >
                            <Button.Text>{translate('common.showMore')}</Button.Text>
                            <Button.Icon src={icons.DownArrow} />
                        </Button>
                    </View>
                )}
            </View>
        </DetailsFieldsContext.Provider>
    );
}

export default ConfirmationFieldList;
