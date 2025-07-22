import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {getStatusOptions} from '@libs/SearchUIUtils';
import {openWorkspaceMembersPage} from '@userActions/Policy/Member';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceDuplicateFormProps = {
    policyID?: string;
};

function WorkspaceDuplicateSelectFeaturesForm({policyID}: WorkspaceDuplicateFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const [duplicateWorkspace] = useOnyx(ONYXKEYS.DUPLICATE_WORKSPACE, {canBeMissing: false});
    const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
    const allIds = getMemberAccountIDsForWorkspace(policy?.employeeList);
    const totalMembers = allIds.length;
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const [street1, street2] = (policy?.address?.addressStreet ?? '').split('\n');
    const formattedAddress =
        !isEmptyObject(policy) && !isEmptyObject(policy.address)
            ? `${street1?.trim()}, ${street2 ? `${street2.trim()}, ` : ''}${policy.address.city}, ${policy.address.state} ${policy.address.zipCode ?? ''}`
            : '';

    const items = useMemo(() => {
        const result = [
            {
                translation: translate('workspace.common.profile'),
                value: 'overview',
                alternateText: `${policy?.name}, ${policy?.outputCurrency} ${translate('common.currency')}, ${formattedAddress}`,
            },
            {
                translation: translate('workspace.common.members'),
                value: 'members',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.members'),
                value: 'members',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.accounting'),
                value: 'accounting',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.tags'),
                value: 'tags',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.taxes'),
                value: 'taxes',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.workflows'),
                value: 'workflows',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.rules'),
                value: 'rules',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.distanceRates'),
                value: 'distanceRates',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.expensifyCard'),
                value: 'expensifyCard',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.companyCards'),
                value: 'companyCards',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.perDiem'),
                value: 'perDiem',
                alternateText: 'eqwewq',
            },
            {
                translation: translate('workspace.common.invoices'),
                value: 'invoices',
                alternateText: 'eqwewq',
            },
        ];

        return result;
    }, [formattedAddress, policy?.name, policy?.outputCurrency, translate]);

    const listData: ListItem[] = useMemo(() => {
        return items.map((option) => ({
            text: option.translation,
            keyForList: option.value,
            isSelected: selectedItems.includes(option.value),
            alternateText: option.alternateText,
        }));
    }, [items, selectedItems]);

    const getWorkspaceMembers = useCallback(() => {
        if (!policyID) {
            return;
        }
        openWorkspaceMembersPage(policyID, Object.keys(getMemberAccountIDsForWorkspace(policy?.employeeList)));
    }, [policyID, policy?.employeeList]);

    const confirmDuplicateAndHideModal = useCallback(() => {
        setIsDuplicateModalOpen(false);
    }, []);

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

    useEffect(() => {
        getWorkspaceMembers();
    }, [getWorkspaceMembers]);

    return (
        <>
            <HeaderWithBackButton title={translate('workspace.common.duplicateWorkspace')} />
            <ScrollView
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="always"
            >
                <View style={[styles.ph5, styles.pv3]}>
                    <Text style={[styles.textHeadline]}>{translate('workspace.duplicateWorkspace.selectFeatures')}</Text>
                    <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.duplicateWorkspace.whichFeatures')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <SelectionList
                        shouldSingleExecuteRowSelect
                        sections={[{data: listData}]}
                        ListItem={MultiSelectListItem}
                        onSelectRow={updateSelectedItems}
                        isAlternateTextMultilineSupported
                    />
                </View>
            </ScrollView>
            <ConfirmModal
                title={translate('workspace.common.delete')}
                isVisible={isDuplicateModalOpen}
                onConfirm={confirmDuplicateAndHideModal}
                onCancel={() => setIsDuplicateModalOpen(false)}
                prompt={
                    <View>
                        <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting, styles.mb3]}>
                            {translate('workspace.duplicateWorkspace.confirmTitle', {newWorkspaceName: duplicateWorkspace?.name, oldWorkspaceName: policy?.name, totalMembers})}
                        </Text>
                        <Text style={[styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.duplicateWorkspace.confirmDuplicate')}</Text>
                    </View>
                }
                confirmText={translate('common.proceed')}
                cancelText={translate('common.cancel')}
                success
            />
        </>
    );
}

WorkspaceDuplicateSelectFeaturesForm.displayName = 'WorkspaceDuplicateSelectFeaturesForm';

export default WorkspaceDuplicateSelectFeaturesForm;
