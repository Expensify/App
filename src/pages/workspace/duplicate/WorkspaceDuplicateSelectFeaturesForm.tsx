import Button from '@components/Button';
import Checkbox from '@components/Checkbox';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import PolicyCopyTravelTerms from '@components/PolicyCopyTravelTerms';
import {PressableWithFeedback} from '@components/Pressable';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyCopySettingsSelection from '@hooks/usePolicyCopySettingsSelection';
import useThemeStyles from '@hooks/useThemeStyles';

import {isSourceProvisionedForTravel} from '@libs/CopyPolicySettingsUtils';
import {readFileAsync} from '@libs/fileDownload/FileUtils';

import Navigation from '@navigation/Navigation';

import {duplicateWorkspace as duplicateWorkspaceAction} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

type WorkspaceDuplicateFormProps = {
    policyID?: string;
};

function WorkspaceDuplicateSelectFeaturesForm({policyID}: WorkspaceDuplicateFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const {showConfirmModal} = useConfirmModal();
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE);
    const [allRules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [duplicatedWorkspaceAvatar, setDuplicatedWorkspaceAvatar] = useState<File | undefined>();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const localCurrency = currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD;
    const targetPolicies = policy ? [{...policy, outputCurrency: localCurrency, address: undefined, achAccount: undefined, connections: undefined, travelSettings: undefined}] : [];
    const {
        listItems: featuresToCopy,
        effectiveSelectedFeatures: effectiveSelectedItems,
        selectableFeatures,
        toggleFeature: updateSelectedItems,
        toggleAll: toggleAllItems,
        policyCategories,
        policyTags,
        memberCount: totalMembers,
        sourceEmployeePersonalDetails: employeePersonalDetails,
    } = usePolicyCopySettingsSelection(policy, targetPolicies, undefined, true);
    const requiresTravelTermsConsent = effectiveSelectedItems.includes('travel') && isSourceProvisionedForTravel(policy);
    const [hasAcceptedTravelTerms, setHasAcceptedTravelTerms] = useState(false);

    const confirmDuplicate = () => {
        if (!policy || !duplicateWorkspace?.name || !duplicateWorkspace?.policyID || (requiresTravelTermsConsent && !hasAcceptedTravelTerms)) {
            return;
        }

        duplicateWorkspaceAction(policy, {
            currentUserAccountID: currentUserPersonalDetails.accountID,
            currentUserEmail: currentUserPersonalDetails.email,
            policyName: duplicateWorkspace.name,
            policyID: policy.id,
            targetPolicyID: duplicateWorkspace.policyID,
            welcomeNote: `${translate('workspace.duplicateWorkspace.welcomeNote')} ${duplicateWorkspace.name}`,
            policyCategories,
            policyTags,
            hasAcceptedTravelTerms,
            personalDetailsByLogins: employeePersonalDetails,
            parts: effectiveSelectedItems,
            file: duplicatedWorkspaceAvatar,
            localCurrency,
            rules: allRules,
        });
        Navigation.closeRHPFlow();
    };

    const duplicateWorkspaceName = duplicateWorkspace?.name;
    const duplicateWorkspacePolicyID = duplicateWorkspace?.policyID;
    const confirmSelectedFeatures = () => {
        // Without Members, copied workflows cannot keep their original approvers.
        if (effectiveSelectedItems.includes('workflows') && !effectiveSelectedItems.includes('members') && totalMembers > 1) {
            showConfirmModal({
                title: translate('common.headsUp'),
                prompt: translate('workspace.copyPolicySettings.confirmWorkflows.description'),
                confirmText: translate('workspace.copyPolicySettings.confirmWorkflows.continue'),
                cancelText: translate('common.cancel'),
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                confirmDuplicate();
            });
            return;
        }
        if (!totalMembers || totalMembers < 2 || !effectiveSelectedItems.includes('members')) {
            confirmDuplicate();
            return;
        }

        showConfirmModal({
            title: translate('workspace.common.duplicateWorkspace'),
            prompt: (
                <Text>
                    <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting, styles.mb3]}>
                        {translate('workspace.duplicateWorkspace.confirmTitle', {
                            newWorkspaceName: duplicateWorkspaceName,
                            totalMembers,
                        })}
                    </Text>
                    <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.duplicateWorkspace.confirmDuplicate')}</Text>
                </Text>
            ),
            confirmText: translate('common.proceed'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
        }).then((result) => {
            if (!policy || !duplicateWorkspaceName || !duplicateWorkspacePolicyID || result.action !== ModalActions.CONFIRM) {
                return;
            }
            confirmDuplicate();
        });
    };

    // Refreshing loses the avatar blob, so restart the flow if it cannot be read.
    useEffect(() => {
        if (!duplicateWorkspace?.fileURI || !policyID) {
            return;
        }
        readFileAsync(
            duplicateWorkspace.fileURI,
            'tmpFile',
            (file) => {
                setDuplicatedWorkspaceAvatar(file);
            },
            () => {
                Navigation.goBack(ROUTES.WORKSPACE_DUPLICATE.getRoute(policyID));
            },
        );
    }, [duplicateWorkspace?.fileURI, policyID]);

    const isSelectAllChecked = selectableFeatures.length > 0 && selectableFeatures.every((part) => effectiveSelectedItems.includes(part));

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = {
        showButton: true,
        text: translate('common.continue'),
        onConfirm: confirmSelectedFeatures,
        isDisabled: requiresTravelTermsConsent && !hasAcceptedTravelTerms,
    };

    return (
        <>
            <HeaderWithBackButton
                onBackButtonPress={policyID ? () => Navigation.goBack(ROUTES.WORKSPACE_DUPLICATE.getRoute(policyID)) : undefined}
                title={translate('workspace.common.duplicateWorkspace')}
            />
            <>
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.copyPolicySettings.selectSettings.title')}</Text>
                    <Text style={[styles.textSupporting]}>{translate('workspace.duplicateWorkspace.whichFeatures')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <View style={[styles.searchListHeaderContainerStyle, styles.pv3, styles.ph5, styles.flexRow, styles.alignItemsCenter]}>
                        <Checkbox
                            accessibilityLabel={translate('accessibilityHints.selectAllFeatures')}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={effectiveSelectedItems.length > 0 && !isSelectAllChecked}
                            onPress={toggleAllItems}
                            disabled={selectableFeatures.length === 0}
                            shouldSelectOnPressEnter
                        />
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={toggleAllItems}
                            accessible={false}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                            tabIndex={-1}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.DUPLICATE_SELECT_FEATURES_SELECT_ALL}
                        >
                            <Text style={[styles.textLabelSupporting, styles.ph3]}>{translate('workspace.common.selectAll')}</Text>
                        </PressableWithFeedback>
                    </View>
                    <SelectionList
                        data={featuresToCopy}
                        shouldSingleExecuteRowSelect
                        ListItem={MultiSelectListItem}
                        onSelectRow={updateSelectedItems}
                        alternateNumberOfSupportedLines={2}
                        addBottomSafeAreaPadding
                        confirmButtonOptions={confirmButtonOptions}
                        footerContent={
                            requiresTravelTermsConsent ? (
                                <>
                                    <PolicyCopyTravelTerms
                                        isChecked={hasAcceptedTravelTerms}
                                        onToggle={() => setHasAcceptedTravelTerms((prev) => !prev)}
                                    />
                                    <Button
                                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                                        size={CONST.BUTTON_SIZE.LARGE}
                                        onPress={confirmSelectedFeatures}
                                        isDisabled={!hasAcceptedTravelTerms}
                                    >
                                        <Button.KeyboardShortcut enterKeyEventListenerPriority={1} />
                                        <Button.Text>{translate('common.continue')}</Button.Text>
                                    </Button>
                                </>
                            ) : undefined
                        }
                    />
                </View>
            </>
        </>
    );
}

export default WorkspaceDuplicateSelectFeaturesForm;
