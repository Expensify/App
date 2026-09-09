/**
 * RHP step shown when a vacation delegate is missing from workspaces: lets the user invite them into the
 * workspaces they admin, skip, or just confirm the delegate.
 */
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearVacationDelegateError, inviteVacationDelegateToWorkspaces, setVacationDelegate} from '@libs/actions/VacationDelegate';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {createPoliciesByIDsSelector} from '@src/selectors/Policy';
import type {Policy, VacationDelegatePolicyDiff} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {NavigationAction} from '@react-navigation/native';

import {useNavigation, usePreventRemove} from '@react-navigation/native';
import React, {useRef, useState} from 'react';

import MissingWorkspacesFooter from './MissingWorkspacesFooter';
import MissingWorkspacesIntro from './MissingWorkspacesIntro';
import WorkspaceSection from './WorkspaceSection';

type ScreenInput = {
    delegate: string;
    policyDiff: VacationDelegatePolicyDiff;
};

function VacationDelegateMissingWorkspacesPage() {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const navigation = useNavigation();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [vacationDelegate, vacationDelegateMetadata] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);

    const [submittedInput, setSubmittedInput] = useState<ScreenInput>();

    const creator = currentUserPersonalDetails.login ?? '';
    const delegate = submittedInput?.delegate ?? vacationDelegate?.delegate ?? '';
    const previousDelegate = vacationDelegate?.previousDelegate;
    const policyDiff = submittedInput?.policyDiff ?? vacationDelegate?.policyDiff;
    const adminPolicies = policyDiff?.adminPolicies ?? [];
    const nonAdminPolicies = policyDiff?.nonAdminPolicies ?? [];

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createPoliciesByIDsSelector([...adminPolicies, ...nonAdminPolicies])});

    // Only loaded workspaces can be invited into, so a missing one has to block the invite rather than be dropped from it.
    const adminWorkspaces = adminPolicies.map((policyID) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]).filter((policy): policy is Policy => !!policy?.id);
    const canInvite = adminPolicies.length > 0;
    const hasUnresolvedAdminPolicy = adminWorkspaces.length !== adminPolicies.length;

    const isSubmittingRef = useRef(false);

    usePreventRemove(!!policyDiff, ({data}: {data: {action: NavigationAction}}) => {
        if (!isSubmittingRef.current && policyDiff) {
            setSubmittedInput({delegate, policyDiff});
            clearVacationDelegateError(previousDelegate);
        }

        navigation.dispatch(data.action);
    });

    if (!submittedInput && isLoadingOnyxValue(vacationDelegateMetadata)) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (!policyDiff) {
        return <NotFoundPage />;
    }

    const submit = () => {
        setSubmittedInput({delegate, policyDiff});
        setVacationDelegate({creator, delegate, currentDelegate: previousDelegate, shouldOverridePolicyDiffWarning: true});
        Navigation.goBack(ROUTES.SETTINGS_STATUS);
    };

    const submitOnce = () => {
        if (isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
        submit();
    };

    const invite = () => {
        if (isSubmittingRef.current || hasUnresolvedAdminPolicy) {
            return;
        }

        isSubmittingRef.current = true;

        inviteVacationDelegateToWorkspaces({
            delegate,
            policies: adminWorkspaces,
            inviter: {
                accountID: currentUserPersonalDetails.accountID,
                displayName: currentUserPersonalDetails.displayName,
                email: currentUserPersonalDetails.email,
                avatar: currentUserPersonalDetails.avatar,
            },
            translate,
            formatPhoneNumber,
        });

        submit();
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="VacationDelegateMissingWorkspacesPage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.vacationDelegate')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_VACATION_DELEGATE)}
            />
            <FullPageOfflineBlockingView>
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.ph5}
                >
                    <MissingWorkspacesIntro
                        delegate={delegate}
                        hasAdminWorkspaces={canInvite}
                        hasNonAdminWorkspaces={nonAdminPolicies.length > 0}
                    />
                    <WorkspaceSection
                        title={translate('statusPage.vacationDelegate.youAreAMemberOf')}
                        policyIDs={nonAdminPolicies}
                        policies={policies}
                    />
                    <WorkspaceSection
                        title={translate('statusPage.vacationDelegate.youAreAnAdminOf')}
                        policyIDs={adminPolicies}
                        policies={policies}
                    />
                </ScrollView>
                <MissingWorkspacesFooter
                    canInvite={canInvite}
                    isInviteDisabled={hasUnresolvedAdminPolicy}
                    onInvite={invite}
                    onSkip={submitOnce}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

VacationDelegateMissingWorkspacesPage.displayName = 'VacationDelegateMissingWorkspacesPage';

export default VacationDelegateMissingWorkspacesPage;
