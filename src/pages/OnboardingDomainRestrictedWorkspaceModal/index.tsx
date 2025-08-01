import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {shouldShowPolicy} from '@libs/PolicyUtils';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import type {AvatarSource} from '@libs/UserUtils';
import {askToJoinPolicy} from '@userActions/Policy/Member';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function OnboardingDomainRestrictedWorkspaceModal() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingMessages} = useOnboardingMessages();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();

    // We need to use isSmallScreenWidth for navigation consistency
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    // Get workspaces that the user can join (based on their domain)
    const availableWorkspaces = useMemo(() => {
        if (!policies || !currentUserPersonalDetails.login) {
            return [];
        }

        return Object.values(policies)
            .filter((policy) => shouldShowPolicy(policy, false, currentUserPersonalDetails.login) && !policy?.isJoinRequestPending && policy?.isPolicyExpenseChatEnabled)
            .map((policy) => ({
                text: policy?.name ?? '',
                policyID: policy?.id ?? '',
                icons: [
                    {
                        source: policy?.avatarURL ? policy.avatarURL : getDefaultWorkspaceAvatar(policy?.name),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policy?.name,
                        type: CONST.ICON_TYPE_WORKSPACE,
                        id: policy?.id,
                    },
                ],
                keyForList: policy?.id,
                isSelected: false,
                automaticJoiningEnabled: false, // Default to require approval
            }));
    }, [policies, currentUserPersonalDetails.login]);

    type WorkspaceItem = {
        text: string;
        policyID: string;
        icons: Array<{
            source: AvatarSource;
            fallbackIcon?: AvatarSource;
            name?: string;
            type: ValueOf<typeof CONST.ICON_TYPE_WORKSPACE>;
            id?: string;
        }>;
        keyForList?: string;
        isSelected: boolean;
        automaticJoiningEnabled: boolean;
    };

    const handleJoinWorkspace = useCallback(
        (workspaceItem: WorkspaceItem) => {
            // For simplicity, we'll default to asking to join (requiring approval)
            askToJoinPolicy(workspaceItem.policyID);

            completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
                firstName: currentUserPersonalDetails?.firstName ?? '',
                lastName: currentUserPersonalDetails?.lastName ?? '',
            });

            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID(workspaceItem.policyID);

            navigateAfterOnboardingWithMicrotaskQueue(isSmallScreenWidth, isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), workspaceItem.policyID);
        },
        [onboardingMessages, currentUserPersonalDetails?.firstName, currentUserPersonalDetails?.lastName, isSmallScreenWidth, isBetaEnabled],
    );
    const handleSkip = useCallback(() => {
        // Complete onboarding without joining a workspace
        completeOnboarding({
            engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
            onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
            firstName: currentUserPersonalDetails?.firstName ?? '',
            lastName: currentUserPersonalDetails?.lastName ?? '',
        });

        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID();

        navigateAfterOnboardingWithMicrotaskQueue(isSmallScreenWidth, isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS));
    }, [onboardingMessages, currentUserPersonalDetails, isSmallScreenWidth, isBetaEnabled]);

    const handleBackPress = useCallback(() => {
        Navigation.goBack();
    }, []);

    const workspaceListItems = useMemo(() => {
        return availableWorkspaces.map((workspace) => ({
            ...workspace,
            rightElement: (
                <Button
                    success
                    medium
                    text={workspace.automaticJoiningEnabled ? translate('workspace.workspaceList.joinNow') : translate('workspace.workspaceList.askToJoin')}
                    onPress={() => handleJoinWorkspace(workspace)}
                />
            ),
        }));
    }, [availableWorkspaces, translate, handleJoinWorkspace]);

    const wrapperPadding = onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5;

    return (
        <ScreenWrapper
            testID={OnboardingDomainRestrictedWorkspaceModal.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title=""
                onBackButtonPress={handleBackPress}
            />
            <SelectionList
                sections={[{data: workspaceListItems, isDisabled: false}]}
                onSelectRow={() => {}} // Handled by the button in rightElement
                ListItem={UserListItem}
                listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8, styles.cursorDefault] : []}
                shouldStopPropagation
                showScrollIndicator
                headerContent={
                    <View style={[wrapperPadding, onboardingIsMediumOrLargerScreenWidth && styles.mt5, styles.mb5]}>
                        <Text style={styles.textHeadlineH1}>{translate('onboarding.domainWorkspaceRestriction.title')}</Text>
                        <Text style={[styles.textSupporting, styles.mt3]}>{translate('onboarding.domainWorkspaceRestriction.subtitle')}</Text>
                    </View>
                }
                footerContent={
                    <View style={[styles.ph5, styles.pb5]}>
                        <Button
                            text={translate('common.skip')}
                            onPress={handleSkip}
                            medium
                            style={[styles.w100]}
                        />
                    </View>
                }
            />
        </ScreenWrapper>
    );
}

OnboardingDomainRestrictedWorkspaceModal.displayName = 'OnboardingDomainRestrictedWorkspaceModal';

export default OnboardingDomainRestrictedWorkspaceModal;