import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {setEmployeeWorkArrangement} from '@libs/actions/Policy/DistanceRate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type WorkArrangementOption = ListItem<string> & {
    value: boolean;
    text: string;
    alternateText: string;
    isSelected: boolean;
};

type WorkArrangementPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_WORK_ARRANGEMENT> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkArrangementPage({policy, personalDetails, route}: WorkArrangementPageProps) {
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isWorkArrangementBetaEnabled = isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS);

    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const canWriteMembers = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MEMBERS);

    // The member-level setting wins; otherwise fall back to the workspace default, then to no regular workspace.
    const currentIsOffice = member?.hasOfficeWorkArrangement ?? policy?.commuterExclusions?.isOfficeWorkArrangement ?? false;

    const navigateBackToDetails = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    };

    const changeWorkArrangement = ({value}: WorkArrangementOption) => {
        if (value === currentIsOffice || !canWriteMembers) {
            return;
        }
        setEmployeeWorkArrangement(policy, [accountID], value, personalDetails, translate);
        navigateBackToDetails();
    };

    const options: WorkArrangementOption[] = [
        {
            value: true,
            text: translate('workspace.people.officeBased'),
            alternateText: translate('workspace.people.workArrangementPage.optionOfficeBasedHelp'),
            isSelected: currentIsOffice,
            keyForList: 'office-based',
        },
        {
            value: false,
            text: translate('workspace.people.noRegularWorkspace'),
            alternateText: translate('workspace.people.workArrangementPage.optionNoRegularWorkspaceHelp'),
            isSelected: !currentIsOffice,
            keyForList: 'no-regular-workplace',
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canWriteMembers || !isWorkArrangementBetaEnabled}
        >
            <ScreenWrapper
                testID="WorkArrangementPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.people.workArrangementPage.title')}
                    onBackButtonPress={navigateBackToDetails}
                />
                <View style={[styles.flex1]}>
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        data={options}
                        onSelectRow={changeWorkArrangement}
                        shouldSingleExecuteRowSelect
                        shouldUpdateFocusedIndex
                        alternateNumberOfSupportedLines={2}
                        disableKeyboardShortcuts
                    />
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.people.workArrangementPage.futureOnlyNote')}</Text>
                    </View>
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkArrangementPage);
