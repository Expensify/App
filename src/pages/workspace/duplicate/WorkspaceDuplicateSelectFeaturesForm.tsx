import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {PressableWithFeedback} from '@components/Pressable';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ConfirmButtonOptions, ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import {getDistanceRateCustomUnit, getMemberAccountIDsForWorkspace, getPerDiemCustomUnit, isCollectPolicy} from '@libs/PolicyUtils';
import {getReportFieldsByPolicyID} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import {duplicateWorkspace as duplicateWorkspaceAction, openDuplicatePolicyPage} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Rate} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllValidConnectedIntegration, getWorkflowRules, getWorkspaceRules} from './utils';

type WorkspaceDuplicateFormProps = {
    policyID?: string;
};

function WorkspaceDuplicateSelectFeaturesForm({policyID}: WorkspaceDuplicateFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const isCollect = isCollectPolicy(policy);
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE, {canBeMissing: true});
    const [duplicatedWorkspaceAvatar, setDuplicatedWorkspaceAvatar] = useState<File | undefined>();
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const allIds = getMemberAccountIDsForWorkspace(policy?.employeeList);
    const totalMembers = Object.keys(allIds).length;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const taxesLength = Object.keys(policy?.taxRates?.taxes ?? {}).length ?? 0;
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const categoriesCount = Object.keys(policyCategories ?? {}).length;
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const reportFields = Object.keys(getReportFieldsByPolicyID(policyID)).length ?? 0;
    const customUnits = getPerDiemCustomUnit(policy);
    const customUnitRates: Record<string, Rate> = customUnits?.rates ?? {};
    const allRates = Object.values(customUnitRates)?.length;
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectedIntegration = getAllValidConnectedIntegration(policy, accountingIntegrations);

    const customUnit = getDistanceRateCustomUnit(policy);
    const ratesCount = Object.keys(customUnit?.rates ?? {}).length;
    const invoiceCompany =
        policy?.invoice?.companyName && policy?.invoice?.companyWebsite
            ? `${policy?.invoice?.companyName}, ${policy?.invoice?.companyWebsite}`
            : (policy?.invoice?.companyName ?? policy?.invoice?.companyWebsite ?? '');

    const totalTags = useMemo(() => {
        if (!policyTags) {
            return 0;
        }
        return Object.values(policyTags).reduce((sum, tagGroup) => sum + Number(Object.values(tagGroup.tags)?.length ?? 0), 0);
    }, [policyTags]);

    const [street1, street2] = (policy?.address?.addressStreet ?? '').split('\n');
    const formattedAddress =
        !isEmptyObject(policy) && !isEmptyObject(policy.address)
            ? `${street1?.trim()}, ${street2 ? `${street2.trim()}, ` : ''}${policy.address.city}, ${policy.address.state} ${policy.address.zipCode ?? ''}`
            : '';

    const items = useMemo(() => {
        const rules = getWorkspaceRules(policy, translate);
        const workflows = getWorkflowRules(policy, translate);

        const result = [
            {
                translation: translate('workspace.common.profile'),
                value: 'overview',
                alternateText: `${policy?.outputCurrency} ${translate('common.currency')}, ${formattedAddress}`,
            },
            totalMembers > 1
                ? {
                      translation: translate('workspace.common.members'),
                      value: 'members',
                      alternateText: totalMembers ? `${totalMembers} ${translate('workspace.common.members').toLowerCase()}` : undefined,
                  }
                : undefined,
            reportFields > 0
                ? {
                      translation: translate('workspace.common.reports'),
                      value: 'reports',
                      alternateText: reportFields ? `${reportFields} ${translate('workspace.common.reportFields').toLowerCase()}` : undefined,
                  }
                : undefined,
            connectedIntegration && connectedIntegration?.length > 0
                ? {
                      translation: translate('workspace.common.accounting'),
                      value: 'accounting',
                      alternateText: connectedIntegration.map((connectionName) => CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]).join(', '),
                  }
                : undefined,
            totalTags > 0
                ? {
                      translation: translate('workspace.common.tags'),
                      value: 'tags',
                      alternateText: totalTags ? `${totalTags} ${translate('workspace.common.tags').toLowerCase()}` : undefined,
                  }
                : undefined,
            categoriesCount > 0
                ? {
                      translation: translate('workspace.common.categories'),
                      value: 'categories',
                      alternateText: categoriesCount ? `${categoriesCount} ${translate('workspace.duplicateWorkspace.categories').toLowerCase()}` : undefined,
                  }
                : undefined,
            taxesLength > 0
                ? {
                      translation: translate('workspace.common.taxes'),
                      value: 'taxes',
                      alternateText: taxesLength ? `${taxesLength} ${translate('workspace.common.taxes').toLowerCase()}` : undefined,
                  }
                : undefined,
            workflows && workflows?.length > 0
                ? {
                      translation: translate('workspace.common.workflows'),
                      value: 'workflows',
                      alternateText: workflows?.join(', '),
                  }
                : undefined,
            rules && rules.length > 0 && !isCollect
                ? {
                      translation: translate('workspace.common.rules'),
                      value: 'rules',
                      alternateText: rules.length
                          ? `${rules.length} ${translate('workspace.common.workspace').toLowerCase()} ${translate('workspace.common.rules').toLowerCase()}: ${rules.join(', ')}`
                          : undefined,
                  }
                : undefined,
            ratesCount > 0 && policy?.areDistanceRatesEnabled
                ? {
                      translation: translate('workspace.common.distanceRates'),
                      value: 'distanceRates',
                      alternateText: ratesCount ? `${ratesCount} ${translate('iou.rates').toLowerCase()}` : undefined,
                  }
                : undefined,
            allRates > 0
                ? {
                      translation: translate('workspace.common.perDiem'),
                      value: 'perDiem',
                      alternateText: allRates ? `${allRates} ${translate('workspace.common.perDiem').toLowerCase()}` : undefined,
                  }
                : undefined,
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            policy?.areInvoicesEnabled && ((bankAccountList && Object.keys(bankAccountList).length) || !!invoiceCompany)
                ? {
                      translation: translate('workspace.common.invoices'),
                      value: 'invoices',
                      alternateText: bankAccountList ? `${Object.keys(bankAccountList).length} ${translate('common.bankAccounts').toLowerCase()}, ${invoiceCompany}` : invoiceCompany,
                  }
                : undefined,
            policy?.isTravelEnabled
                ? {
                      translation: translate('workspace.common.travel'),
                      value: 'travel',
                  }
                : undefined,
        ];

        return result.filter((item): item is NonNullable<typeof item> => !!item);
    }, [
        policy,
        translate,
        formattedAddress,
        totalMembers,
        reportFields,
        connectedIntegration,
        totalTags,
        categoriesCount,
        taxesLength,
        ratesCount,
        isCollect,
        allRates,
        bankAccountList,
        invoiceCompany,
    ]);

    const featuresToCopy: ListItem[] = useMemo(() => {
        return items.map((option) => {
            const alternateText = option?.alternateText ? option.alternateText.trim().replaceAll(/,$/g, '') : undefined;
            return {
                text: option.translation,
                keyForList: option.value,
                isSelected: selectedItems.includes(option.value),
                alternateText,
            };
        });
    }, [items, selectedItems]);

    const fetchWorkspaceRelatedData = useCallback(() => {
        if (!policyID) {
            return;
        }
        openDuplicatePolicyPage(policyID);
    }, [policyID]);

    const confirmDuplicate = useCallback(() => {
        if (!policy || !duplicateWorkspace?.name || !duplicateWorkspace?.policyID) {
            return;
        }

        duplicateWorkspaceAction(policy, {
            policyName: duplicateWorkspace.name,
            policyID: policy.id,
            targetPolicyID: duplicateWorkspace.policyID,
            welcomeNote: `${translate('workspace.duplicateWorkspace.welcomeNote')} ${duplicateWorkspace.name}`,
            policyCategories: selectedItems.includes('categories') ? policyCategories : undefined,
            parts: {
                people: selectedItems.includes('members'),
                reports: selectedItems.includes('reports'),
                connections: selectedItems.includes('accounting'),
                categories: selectedItems.includes('categories'),
                tags: selectedItems.includes('tags'),
                taxes: selectedItems.includes('taxes'),
                perDiem: selectedItems.includes('perDiem'),
                reimbursements: selectedItems.includes('invoices'),
                expenses: selectedItems.includes('rules'),
                distance: selectedItems.includes('distanceRates'),
                invoices: selectedItems.includes('invoices'),
                exportLayouts: selectedItems.includes('workflows'),
                overview: selectedItems.includes('overview'),
                travel: selectedItems.includes('travel'),
            },
            file: duplicatedWorkspaceAvatar,
            localCurrency: currentUserPersonalDetails?.localCurrencyCode ?? '',
        });
        Navigation.closeRHPFlow();
    }, [
        duplicateWorkspace?.name,
        duplicateWorkspace?.policyID,
        policy,
        policyCategories,
        selectedItems,
        translate,
        duplicatedWorkspaceAvatar,
        currentUserPersonalDetails?.localCurrencyCode,
    ]);

    const confirmDuplicateAndHideModal = useCallback(() => {
        setIsDuplicateModalOpen(false);
        if (!policy || !duplicateWorkspace?.name || !duplicateWorkspace?.policyID) {
            return;
        }
        confirmDuplicate();
    }, [confirmDuplicate, duplicateWorkspace?.name, duplicateWorkspace?.policyID, policy]);

    const onConfirmSelectList = useCallback(() => {
        if (!totalMembers || totalMembers < 2 || !selectedItems.includes('members')) {
            confirmDuplicate();
            return;
        }
        setIsDuplicateModalOpen(true);
    }, [confirmDuplicate, selectedItems, totalMembers]);

    const toggleAllItems = useCallback(() => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map((i) => i.value));
        }
    }, [items, selectedItems.length]);

    const updateSelectedItems = useCallback(
        (listItem: ListItem) => {
            if (listItem.isSelected) {
                setSelectedItems(selectedItems.filter((i) => i !== listItem.keyForList));
                return;
            }

            const newItem = items.find((i) => i.value === listItem.keyForList)?.value;

            if (newItem) {
                setSelectedItems([...selectedItems, newItem]);
            }
        },
        [items, selectedItems],
    );

    // When the component mounts, if there is a new avatar, see if the image can be read from the disk. If not, redirect the user to the starting step of the flow.
    // This is because until the request is saved, the avatar file is only stored in the browsers memory as a blob:// and if the browser is refreshed, then
    // the image ceases to exist. The best way for the user to recover from this is to start over from the start of the duplication process.
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

    useEffect(() => {
        if (!items.length) {
            return;
        }
        setSelectedItems(items.map((i) => i.value));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length]);

    useEffect(() => {
        fetchWorkspaceRelatedData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isSelectAllChecked = selectedItems.length > 0 && selectedItems.length === items.length;

    const confirmButtonOptions: ConfirmButtonOptions<ListItem> = useMemo(
        () => ({
            showButton: true,
            text: translate('common.continue'),
            onConfirm: onConfirmSelectList,
        }),
        [translate, onConfirmSelectList],
    );

    return (
        <>
            <HeaderWithBackButton
                onBackButtonPress={policyID ? () => Navigation.goBack(ROUTES.WORKSPACE_DUPLICATE.getRoute(policyID)) : undefined}
                title={translate('workspace.common.duplicateWorkspace')}
            />
            <>
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.duplicateWorkspace.selectFeatures')}</Text>
                    <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.duplicateWorkspace.whichFeatures')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <View style={[styles.searchListHeaderContainerStyle, styles.pv3, styles.ph5]}>
                        <Checkbox
                            accessibilityLabel={translate('accessibilityLabels.selectAllFeatures')}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={selectedItems.length > 0 && selectedItems.length !== items.length}
                            onPress={toggleAllItems}
                            disabled={items.length === 0}
                        />
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={toggleAllItems}
                            accessibilityLabel={translate('accessibilityLabels.selectAllFeatures')}
                            role="button"
                            accessibilityState={{checked: isSelectAllChecked}}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
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
                    />
                </View>
            </>
            <ConfirmModal
                title={translate('workspace.common.duplicateWorkspace')}
                isVisible={isDuplicateModalOpen}
                onConfirm={confirmDuplicateAndHideModal}
                onCancel={() => setIsDuplicateModalOpen(false)}
                prompt={
                    <Text>
                        <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting, styles.mb3]}>
                            {translate('workspace.duplicateWorkspace.confirmTitle', {
                                newWorkspaceName: duplicateWorkspace?.name,
                                totalMembers,
                            })}
                        </Text>
                        <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.duplicateWorkspace.confirmDuplicate')}</Text>
                    </Text>
                }
                confirmText={translate('common.proceed')}
                cancelText={translate('common.cancel')}
                success
            />
        </>
    );
}

export default WorkspaceDuplicateSelectFeaturesForm;
