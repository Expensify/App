/**
 * Shows the "Cannot disable category" modal, which blocks disabling categories that some members can't do without and
 * lists those members by email. Used before disabling categories, and when the backend rejects a disable the App's own
 * check couldn't catch.
 */
import Icon from '@components/Icon';
import Text from '@components/Text';

import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import useConfirmModal from './useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from './useLazyAsset';
import useLocalize from './useLocalize';
import {usePersonalDetailsByLogins} from './usePersonalDetailByLogin';
import usePolicy from './usePolicy';
import useStyleUtils from './useStyleUtils';
import useTheme from './useTheme';
import useThemeStyles from './useThemeStyles';

// Members past this many are summarized as "and N more", so a long list doesn't push the button off screen.
const MAX_LISTED_MEMBERS = 3;

function useMembersNeedCategoryModal(policyID: string | undefined) {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    const employeeLogins = Object.keys(policy?.employeeList ?? {});
    const employeePersonalDetails = usePersonalDetailsByLogins(employeeLogins);

    // Members being removed are left out, since they'll lose access to every category anyway.
    const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, employeePersonalDetails, true, false));

    const showMembersNeedCategoryModal = (accountIDs: number[], categoryCount: number) => {
        const memberLogins = accountIDs
            .map((accountID) => employeeLogins.find((login) => employeePersonalDetails[login]?.accountID === accountID))
            .filter((login): login is string => !!login)
            .slice(0, MAX_LISTED_MEMBERS);
        // Members whose details haven't loaded aren't named, so they're counted here instead.
        const unlistedMemberCount = accountIDs.length - memberLogins.length;
        const listItems = memberLogins.map((login) => formatPhoneNumber(login));
        if (unlistedMemberCount > 0) {
            listItems.push(translate('workspace.categories.cannotDisableCategoryForMembers.andMore', {count: unlistedMemberCount}));
        }

        showConfirmModal({
            title: translate('workspace.categories.cannotDisableCategoryForMembers.title'),
            prompt: (
                <View>
                    <Text>
                        {translate(
                            categoryCount === 1 ? 'workspace.categories.cannotDisableCategoryForMembers.description' : 'workspace.categories.cannotDisableCategoryForMembers.bulkDescription',
                        )}
                    </Text>
                    <View style={styles.mt3}>
                        {listItems.map((item) => (
                            <View
                                key={item}
                                style={[styles.flexRow, styles.alignItemsStart]}
                            >
                                <View style={[StyleUtils.getHeight(variables.fontSizeNormalHeight), styles.justifyContentCenter, styles.ph2]}>
                                    <Icon
                                        src={icons.DotIndicator}
                                        width={variables.iconSizeXXSmall}
                                        height={variables.iconSizeXXSmall}
                                        fill={theme.text}
                                    />
                                </View>
                                <Text style={styles.flex1}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return {policyMemberAccountIDs, showMembersNeedCategoryModal};
}

export default useMembersNeedCategoryModal;
