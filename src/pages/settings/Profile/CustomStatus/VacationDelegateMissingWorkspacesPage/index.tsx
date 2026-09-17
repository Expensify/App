/**
 * RHP step shown when a vacation delegate is missing from workspaces: lets the user invite them into the
 * workspaces they admin, skip, or just confirm the delegate.
 */
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {openWorkspaceMembersPage} from '@libs/actions/Policy/Member';
import {clearVacationDelegateError, inviteVacationDelegateToWorkspaces, setVacationDelegate} from '@libs/actions/VacationDelegate';
import Navigation from '@libs/Navigation/Navigation';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {createPoliciesByIDsSelector} from '@src/selectors/Policy';
import type {Policy, VacationDelegatePolicyDiff} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {NavigationAction} from '@react-navigation/native';

import {useNavigation, usePreventRemove} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';

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
    const delegate = submittedInput?.delegate ?? vacationDelegate?.pendingDelegate ?? '';
    const previousDelegate = vacationDelegate?.previousDelegate;
    const policyDiff = submittedInput?.policyDiff ?? vacationDelegate?.policyDiff;
    const adminPolicies = policyDiff?.adminPolicies ?? [];
    const nonAdminPolicies = policyDiff?.nonAdminPolicies ?? [];

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createPoliciesByIDsSelector([...adminPolicies, ...nonAdminPolicies])});

    // The invite builds the optimistic #announce room from employeeList, so refresh every admin workspace on entry.
    const fetchAdminWorkspaceMembers = () => {
        for (const policyID of adminPolicies) {
            const knownMemberEmails = Object.keys(policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.employeeList ?? {});
            openWorkspaceMembersPage(policyID, knownMemberEmails);
        }
    };

    useNetwork({onReconnect: fetchAdminWorkspaceMembers});

    // Depends only on the admin workspaces: the response updates `policies`, which would refetch in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(fetchAdminWorkspaceMembers, [policyDiff?.adminPolicies]);

    const adminWorkspaces: Policy[] = [];
    let hasUnresolvedAdminPolicy = false;
    for (const policyID of adminPolicies) {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        if (policy?.id && !isEmptyObject(policy.employeeList)) {
            adminWorkspaces.push(policy);
        } else {
            hasUnresolvedAdminPolicy = true;
        }
    }
    const canInvite = adminPolicies.length > 0;

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

    const submit = (policiesToInvite?: Policy[]) => {
        if (isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;

        if (policiesToInvite?.length) {
            inviteVacationDelegateToWorkspaces({
                delegate,
                policies: policiesToInvite,
                inviter: {
                    accountID: currentUserPersonalDetails.accountID,
                    displayName: currentUserPersonalDetails.displayName,
                    email: currentUserPersonalDetails.email,
                    avatar: currentUserPersonalDetails.avatar,
                },
                translate,
                formatPhoneNumber,
            });
        }

        setSubmittedInput({delegate, policyDiff});
        setVacationDelegate({creator, delegate, currentDelegate: previousDelegate, shouldOverridePolicyDiffWarning: true});
        Navigation.goBack(ROUTES.SETTINGS_STATUS);
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
                onInvite={() => submit(adminWorkspaces)}
                onSkip={() => submit()}
            />
        </ScreenWrapper>
    );
}

export default VacationDelegateMissingWorkspacesPage;
