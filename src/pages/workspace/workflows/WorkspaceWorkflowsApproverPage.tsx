import Str from 'expensify-common/lib/str';
import React, {useMemo, useState} from 'react';
import {SectionListData} from 'react-native';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, Section} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import withPolicy, {WithPolicyProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import {Beta, InvitedEmailsToAccountIDs, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import withPolicyAndFullscreenLoading from '../withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '../withPolicyAndFullscreenLoading';

type WorkspaceWorkflowsApproverPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceWorkflowsApproverPageProps = WorkspaceWorkflowsApproverPageOnyxProps & WithPolicyAndFullscreenLoadingProps;
type MembersSection = SectionListData<MemberForList, Section<MemberForList>>;

function WorkspaceWorkflowsApproverPage({policy, policyMembers, personalDetails}: WorkspaceWorkflowsApproverPageProps) {
    const {translate} = useLocalize();
    const policyName = policy?.name ?? '';
    const [searchTerm, setSearchTerm] = useState('');
    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        return OptionsListUtils.getHeaderMessage(true, false, searchValue);
    }, [translate, searchTerm, policyName]);

    const policyMemberAccountIDs = Object.keys(policyMembers ?? {}).map((accountId) => accountId);
    const policyMemberDetails = policyMemberAccountIDs.filter((accountID) => !!personalDetails?.[accountID]).map((accountID) => personalDetails?.[accountID]);

    const sections: MembersSection[] = useMemo(() => {
        let result: MembersSection[] = [];

        return result;
    }, [personalDetails, searchTerm, translate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WorkspaceWorkflowsApproverPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workflowsPage.approver')}
                subtitle={policyName}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                sections={sections}
                textInputLabel={translate('optionsSelector.findMember')}
                textInputValue={searchTerm}
                onChangeText={setSearchTerm}
                headerMessage={headerMessage}
                ListItem={UserListItem}
                onSelectRow={() => {}}
                // initiallyFocusedOptionKey={0}
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

WorkspaceWorkflowsApproverPage.displayName = 'WorkspaceWorkflowsApproverPage';

export default compose(
    withOnyx<WorkspaceWorkflowsApproverPageProps, WorkspaceWorkflowsApproverPageOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
    withPolicyAndFullscreenLoading,
)(WorkspaceWorkflowsApproverPage);
