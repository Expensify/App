import React, {useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import withPolicy, {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import type {Section} from '@components/SelectionList/types';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as LoginUtils from '@libs/LoginUtils';
import type {MemberForList} from '@libs/OptionsListUtils';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import * as Policy from '@userActions/Policy';
import { SectionListData } from 'react-native';

type WorkspaceWorkflowsApproverPageProps = WithPolicyOnyxProps;
type MembersSection = SectionListData<OptionsListUtils.MemberForList, Section<MemberForList>>;

function WorkspaceWorkflowsApproverPage({policy, policyMembers}: WorkspaceWorkflowsApproverPageProps) {
    const {translate} = useLocalize();
    const policyName = policy?.name ?? '';
    const [searchTerm, setSearchTerm] = useState('');
    const headerMessage = useMemo(() => {
        const searchValue = searchTerm.trim().toLowerCase();
        return OptionsListUtils.getHeaderMessage(true, false, searchValue);
    }, [translate, searchTerm, policyName]);

    console.log(policy, policyMembers);

    const sections: MembersSection[] = () => {
        
    }

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
                textInputLabel={translate('common.all')}
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

export default withPolicy(WorkspaceWorkflowsApproverPage);
