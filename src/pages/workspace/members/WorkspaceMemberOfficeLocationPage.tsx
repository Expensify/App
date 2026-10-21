import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateEmployeeOfficeLocation} from '@libs/actions/Policy/DistanceRate';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAssignableOfficeLocations, getMemberOfficeLocation, hasOfficeLocations} from '@libs/OfficeLocationUtils';
import {canMemberWrite} from '@libs/PolicyUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

type WorkspaceMemberOfficeLocationPageProps = Omit<WithPolicyAndFullscreenLoadingProps, 'route'> &
    PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_OFFICE_LOCATION> & {
        personalDetails: OnyxEntry<PersonalDetailsList>;
    };

function WorkspaceMemberOfficeLocationPage({policy, personalDetails, route}: WorkspaceMemberOfficeLocationPageProps) {
    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();

    const memberLogin = personalDetails?.[accountID]?.login ?? '';
    const member = policy?.employeeList?.[memberLogin];
    const canChangeOfficeLocation =
        isBetaEnabled(CONST.BETAS.COMMUTER_EXCLUSIONS_ARRANGEMENTS) &&
        canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.MEMBERS) &&
        hasOfficeLocations(policy) &&
        !!member;
    const officeLocations = getAssignableOfficeLocations(policy, translate, localeCompare);
    const currentOfficeID = getMemberOfficeLocation(officeLocations, member?.officeID)?.officeID;
    const [chosenOfficeID, setChosenOfficeID] = useState<string>();
    const officeID = chosenOfficeID ?? currentOfficeID;

    const navigateBackToDetails = () => {
        Navigation.goBack(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    };

    const changeOfficeLocation = () => {
        if (!officeID || !canChangeOfficeLocation) {
            return;
        }

        // Confirming the member's current office leaves them as they are, so a member following the primary office keeps following it
        if (officeID !== currentOfficeID) {
            updateEmployeeOfficeLocation(policy, [accountID], officeID, personalDetails);
        }
        navigateBackToDetails();
    };

    const options: ListItem[] = officeLocations.map((officeLocation) => ({
        text: officeLocation.name,
        alternateText: officeLocation.address,
        keyForList: officeLocation.officeID,
        isSelected: officeLocation.officeID === officeID,
    }));

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MEMBERS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
            shouldBeBlocked={!canChangeOfficeLocation}
        >
            <ScreenWrapper
                testID="WorkspaceMemberOfficeLocationPage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('workspace.people.officeLocation')}
                    onBackButtonPress={navigateBackToDetails}
                />
                <View style={[styles.flex1]}>
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        data={options}
                        onSelectRow={({keyForList}) => setChosenOfficeID(keyForList)}
                        initiallyFocusedItemKey={officeID}
                    />
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.people.workArrangementPage.futureOnlyNote')}</Text>
                    </View>
                </View>
                <FixedFooter addBottomSafeAreaPadding>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={changeOfficeLocation}
                        isDisabled={!officeID}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{translate('common.confirm')}</Button.Text>
                    </Button>
                </FixedFooter>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceMemberOfficeLocationPage);
