import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import OfflineIndicator from '@components/OfflineIndicator';
import Button from '@components/Button';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import { BaseOnboardingWorkspacesProps } from './types';
import SelectionList from '@components/SelectionList';
import { ListItem } from '@components/SelectionList/types';
import CONST from '@src/CONST';
import * as Expensicons from '@components/Icon/Expensicons';
import * as ReportUtils from '@libs/ReportUtils';
import * as Report from '@userActions/Report';
import UserListItem from '@components/SelectionList/UserListItem';
import * as MemberAction from '@userActions/Policy/Member';
import navigateAfterJoinRequest from '@libs/navigateAfterJoinRequest';

function BaseOnboardingWorkspaces({ shouldUseNativeStyles, route }: BaseOnboardingWorkspacesProps) {
    const { isOffline } = useNetwork();
    const styles = useThemeStyles();
    const { translate } = useLocalize();
    const { shouldUseNarrowLayout, isSmallScreenWidth, onboardingIsMediumOrLargerScreenWidth } = useResponsiveLayout();
    const [selectedPolicyID, setSelectedPolicyID] = useState<string | null | undefined>();

    // TODO remove 
    const response = {
        "D35BAB0CFAC69F52": {
            "policyID": "D35BAB0CFAC69F52",
            "policyOwner": "bob@domain.com",
            "policyName": "Health Coverage",
            "employeeCount": 150,
            "hasPendingAccess": false,
            "automaticJoiningEnabled": true,
        },
        "E56CAB1DFBC78A13": {
            "policyOwner": "alice@domain.com",
            "policyID": "E56CAB1DFBC78A13",
            "policyName": "Travel Support",
            "employeeCount": 50,
            "hasPendingAccess": true,
            "automaticJoiningEnabled": false,
        },
        "F67DAC2EABC89B24": {
            "policyOwner": "eve@domain.com",
            "policyID": "F67DAC2EABC89B24",
            "policyName": "Tech Equipment",
            "employeeCount": 200,
            "hasPendingAccess": false,
            "automaticJoiningEnabled": false,
        }
    }

    type OnboardingListItem = ListItem & {
        keyForList: any; // TODO
    };

    const handleJoinWorkspace = (policyID: string, automaticJoiningEnabled: boolean) => {
        if (automaticJoiningEnabled) {
            MemberAction.addMemberToPrivateDomainWorkspace(policyID);
            navigateAfterJoinRequest();
            Report.navigateToConciergeChat();
        } else {
            //TODO
            Report.navigateToConciergeChat();
        }
    }

    const policyIDItems: OnboardingListItem[] = useMemo(() => {
        return Object.values(response).map((policyInfo): any => {
            return {
                text: policyInfo.policyName,
                alternateText: `${policyInfo.employeeCount} ${translate('common.members').charAt(0).toLowerCase() + translate('common.members').slice(1)}· ${policyInfo.policyOwner}`,
                keyForList: policyInfo.policyID,
                isSelected: policyInfo.policyID === selectedPolicyID,
                rightElement: <Button
                    isDisabled={isOffline}
                    success={true}
                    medium
                    text={policyInfo.automaticJoiningEnabled ? translate('workspace.workspaceList.joinNow') : translate('workspace.workspaceList.askToJoin')} // TODO change
                    onPress={() => { handleJoinWorkspace(policyInfo.policyID, policyInfo.automaticJoiningEnabled) }}
                />,
                icons: [
                    {
                        id: policyInfo.policyID,
                        source: ReportUtils.getDefaultWorkspaceAvatar(policyInfo.policyName),
                        //policy?.avatarURL ? policy.avatarURL : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policyInfo.policyName,
                        type: CONST.ICON_TYPE_WORKSPACE,
                    },
                ],
            };
        });
    }, [translate, selectedPolicyID]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingWorkspaces"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={80}
                onBackButtonPress={OnboardingFlow.goBack}
            />
            <View style={[styles.flex1, styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                <Text style={styles.textHeadlineH1}>{translate('onboarding.joinAWorkspace')}</Text>
                <Text style={[styles.textAlignLeft, styles.mt5]}>{translate('onboarding.listOfWorkspaces')}</Text>

                <SelectionList
                    sections={[{ data: policyIDItems }]}
                    onSelectRow={(item) => {
                        setSelectedPolicyID(item.keyForList);
                    }}
                    initiallyFocusedOptionKey={policyIDItems.find((item) => item.keyForList === selectedPolicyID)?.keyForList}
                    shouldUpdateFocusedIndex
                    ListItem={UserListItem}
                    listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}
                />

                <View style={[styles.flex1, styles.justifyContentEnd]}>
                    <Button
                        isDisabled={isOffline}
                        success={false}
                        large
                        style={[styles.mb5]}
                        text={translate('common.skip')}
                        onPress={() => { Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo)); }}
                    />
                </View>
            </View>
            {isSmallScreenWidth && <OfflineIndicator />}
        </ScreenWrapper>
    );
}

BaseOnboardingWorkspaces.displayName = 'BaseOnboardingWorkspaces';

export default BaseOnboardingWorkspaces;
