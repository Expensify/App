/**
 * Lists a provisioned workspace's members with a switch for whether each one can book travel, plus one switch that
 * turns every member on or off at once. The rows render inline because the travel page already scrolls as one page.
 */
import SearchBar from '@components/SearchBar';
import Section from '@components/Section';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useSearchResults from '@hooks/useSearchResults';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceMembers from '@hooks/useWorkspaceMembers';

import {clearPolicyTravelMemberAccessError, setPolicyTravelMemberAccess, setPolicyTravelMemberRole} from '@libs/actions/Policy/Travel';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {canMemberUseTravel, getTravelMemberRole} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import type {TravelMemberRole} from '@libs/TravelMemberOptionUtils';

import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';

import TravelMemberRow from './TravelMemberRow';

type TravelMembersSectionProps = {
    policyID: string;
};

type TravelMember = {
    accountID: number;
    email: string;
    name: string;
    displayLogin: string;
    canUseTravel: boolean;
    travelRole: TravelMemberRole;
    pendingAction?: PendingAction;
    errors?: Errors;
};

const filterMember = (member: TravelMember, searchInput: string) => tokenizedSearch([member], searchInput, (option) => [option.name, option.email]).length > 0;

function TravelMembersSection({policyID}: TravelMembersSectionProps) {
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const policy = usePolicy(policyID);
    const {canWrite, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);
    const workspaceMembers = useWorkspaceMembers(policy);

    const members: TravelMember[] = workspaceMembers
        .map(({email, accountID, details, policyEmployee}) => ({
            accountID,
            email,
            name: temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber}),
            displayLogin: formatPhoneNumber(email),
            canUseTravel: canMemberUseTravel(policy, email),
            travelRole: getTravelMemberRole(policy, email),
            pendingAction: policyEmployee.pendingFields?.canUseTravel ?? policyEmployee.pendingFields?.travelRole,
            errors: policyEmployee.errors,
        }))
        .sort((member1, member2) => localeCompare(member1.name, member2.name));
    const [searchInput, setSearchInput, filteredMembers] = useSearchResults(members, filterMember);
    const shouldShowSearchInput = members.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const areAllMembersEnabled = members.length > 0 && members.every((member) => member.canUseTravel);
    const allMembersTitle = translate('workspace.moreFeatures.travel.members.allMembers');

    return (
        <Section
            title={translate('common.members')}
            subtitle={translate('workspace.moreFeatures.travel.members.subtitle')}
            titleStyles={[styles.accountSettingsSectionTitle]}
            subtitleMuted
            isCentralPane
        >
            <ToggleSettingOptionRow
                title={allMembersTitle}
                switchAccessibilityLabel={allMembersTitle}
                isActive={areAllMembersEnabled}
                onToggle={(enabled) => setPolicyTravelMemberAccess(policy, members, enabled)}
                disabled={!canWrite || members.length === 0}
                disabledAction={withReadOnlyFallback()}
                showLockIcon={!canWrite}
                wrapperStyle={styles.mt3}
            />
            {shouldShowSearchInput && (
                <SearchBar
                    label={translate('workspace.people.findMember')}
                    inputValue={searchInput}
                    onChangeText={setSearchInput}
                    shouldShowEmptyState={filteredMembers.length === 0 && searchInput.length > 0}
                    shouldShowIcon={false}
                    style={[styles.mh0, styles.mt3]}
                />
            )}
            <View style={styles.mt3}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pv2, styles.borderBottom]}>
                    <Text style={[styles.flex1, styles.lh16, styles.textMicroSupporting]}>{translate('common.member')}</Text>
                    <View style={[StyleUtils.getWidthStyle(variables.tableTravelRoleColumnWidth), styles.editableCellHeader]}>
                        <Text style={[styles.lh16, styles.textMicroSupporting]}>{translate('workspace.moreFeatures.travel.members.travelRole')}</Text>
                    </View>
                    <View style={[StyleUtils.getWidthStyle(variables.tableSwitchColumnWidth), styles.alignItemsEnd]}>
                        <Text style={[styles.lh16, styles.textMicroSupporting]}>{translate('workspace.moreFeatures.travel.members.access')}</Text>
                    </View>
                </View>
                {filteredMembers.map((member) => (
                    <TravelMemberRow
                        key={member.email}
                        accountID={member.accountID}
                        login={member.email}
                        name={member.name}
                        displayLogin={member.displayLogin}
                        canUseTravel={member.canUseTravel}
                        travelRole={member.travelRole}
                        pendingAction={member.pendingAction}
                        errors={member.errors}
                        canEdit={canWrite}
                        onToggleTravelAccess={(enabled) => setPolicyTravelMemberAccess(policy, [member], enabled)}
                        onSaveTravelRole={(travelRole) => setPolicyTravelMemberRole(policy, [member], travelRole)}
                        onReadOnlyPress={withReadOnlyFallback()}
                        onDismissError={() => clearPolicyTravelMemberAccessError(policyID, member.email)}
                    />
                ))}
            </View>
        </Section>
    );
}

export default TravelMembersSection;
