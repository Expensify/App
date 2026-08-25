import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {addMembersToWorkspace} from '@libs/actions/Policy/Member';
import {clearVacationDelegateError, setVacationDelegate} from '@libs/actions/VacationDelegate';
import Navigation from '@libs/Navigation/Navigation';
import {getAccountIDsByLogins, getNewAccountIDsAndLogins, getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {getAllPolicyExpenseChatReportActions} from '@libs/ReportUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {VacationDelegatePolicyDiff} from '@src/types/onyx';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

/** Everything this screen renders from */
type ScreenInput = {
    delegate: string;
    policyDiff: VacationDelegatePolicyDiff;
};

function VacationDelegateMissingWorkspacesPage() {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUser = {
        accountID: currentUserPersonalDetails.accountID,
        displayName: currentUserPersonalDetails.displayName,
        email: currentUserPersonalDetails.email,
        avatar: currentUserPersonalDetails.avatar,
    };

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    const vacationDelegateRef = useRef(vacationDelegate);
    useEffect(() => {
        vacationDelegateRef.current = vacationDelegate;
    }, [vacationDelegate]);

    // Leaving without submitting rolls the delegate back. Doing it here rather than in the back handler keeps every exit
    // (back button, swipe, dismissing the RHP) on one path, and keeps the flow state intact while this screen is still mounted.
    const isSubmittingRef = useRef(false);
    useEffect(
        () => () => {
            if (isSubmittingRef.current) {
                return;
            }
            clearVacationDelegateError(vacationDelegateRef.current?.previousDelegate);
        },
        [],
    );

    // Submitting nulls the flow state in Onyx while Navigation is still waiting on the transition to pop this screen, so render from
    // what was submitted for the rest of its life. Otherwise NotFoundPage takes over and the copy flips to the previous delegate's email.
    const [submittedInput, setSubmittedInput] = useState<ScreenInput>();

    const creator = currentUserPersonalDetails.login ?? '';
    const delegate = submittedInput?.delegate ?? vacationDelegate?.delegate ?? '';
    const previousDelegate = vacationDelegate?.previousDelegate;
    const policyDiff = submittedInput?.policyDiff ?? vacationDelegate?.policyDiff;
    const adminPolicies = policyDiff?.adminPolicies ?? [];
    const nonAdminPolicies = policyDiff?.nonAdminPolicies ?? [];
    const canInvite = adminPolicies.length > 0;

    if (!policyDiff) {
        return <NotFoundPage />;
    }

    const getMenuItemsForPolicies = (policyIDs: string[]) =>
        policyIDs.map((policyID, index) => ({
            key: policyID,
            title: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.name,
            avatarID: policyID,
            icon: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.avatarURL,
            iconType: CONST.ICON_TYPE_WORKSPACE,
            description: translate('workspace.common.workspace'),
            interactive: false,
            wrapperStyle: [styles.ph4, index < policyIDs.length - 1 ? styles.borderBottom : undefined],
        }));

    const goBackToStatus = () => {
        Navigation.goBack(ROUTES.SETTINGS_STATUS);
    };

    const submit = (shouldSkipPolicyInviteEmails: boolean) => {
        isSubmittingRef.current = true;
        setSubmittedInput({delegate, policyDiff});
        setVacationDelegate({creator, delegate, currentDelegate: previousDelegate, shouldOverridePolicyDiffWarning: true, shouldSkipPolicyInviteEmails});
        goBackToStatus();
    };

    const invite = () => {
        // The delegate may have been picked from the selector without existing in personal details yet, so fall back to an optimistic accountID.
        const [delegateAccountID] = getAccountIDsByLogins([delegate]);
        const invitedEmailsToAccountIDs = {[delegate]: delegateAccountID};
        const {newAccountIDs, newLogins} = getNewAccountIDsAndLogins(invitedEmailsToAccountIDs, allPersonalDetails);
        const personalDetailsOnyxData = getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber);
        const reportActionsList = getAllPolicyExpenseChatReportActions(allReports, allReportActions);

        for (const policyID of adminPolicies) {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            addMembersToWorkspace(
                invitedEmailsToAccountIDs,
                personalDetailsOnyxData,
                `# ${currentUserPersonalDetails.displayName ?? ''} invited you to ${policy?.name ?? ''}\n\n${translate('workspace.common.welcomeNote')}`,
                policy,
                Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false)),
                CONST.POLICY.ROLE.USER,
                currentUser,
                reportActionsList,
            );
        }

        // Workspaces the current user does not administer are untouched here and still need their own admins emailed.
        submit(false);
    };

    let introCopy: string;
    if (!canInvite) {
        introCopy = translate('statusPage.vacationDelegate.notAMemberAdminsWillBeAsked', delegate);
    } else if (nonAdminPolicies.length > 0) {
        introCopy = translate('statusPage.vacationDelegate.notAMemberMixed', delegate);
    } else {
        introCopy = translate('statusPage.vacationDelegate.notAMemberInviteThemNow', delegate);
    }

    const policySections = (
        <View style={styles.mt5}>
            {nonAdminPolicies.length > 0 && (
                <Section
                    title={translate('statusPage.vacationDelegate.youAreAMemberOf')}
                    titleStyles={[styles.sectionTitle, styles.ph4, styles.w100, styles.borderBottom]}
                    containerStyles={[styles.p0, styles.mh0]}
                    menuItems={getMenuItemsForPolicies(nonAdminPolicies)}
                />
            )}
            {adminPolicies.length > 0 && (
                <Section
                    title={translate('statusPage.vacationDelegate.youAreAnAdminOf')}
                    titleStyles={[styles.sectionTitle, styles.ph4, styles.w100, styles.borderBottom]}
                    containerStyles={[styles.p0, styles.mh0, nonAdminPolicies.length > 0 ? styles.mt5 : undefined]}
                    menuItems={getMenuItemsForPolicies(adminPolicies)}
                />
            )}
        </View>
    );

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
                    <View style={styles.renderHTML}>
                        <RenderHTML html={introCopy} />
                    </View>
                    {policySections}
                </ScrollView>
            </FullPageOfflineBlockingView>
            <FixedFooter addBottomSafeAreaPadding>
                {canInvite ? (
                    <>
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            isDisabled={isOffline}
                            onPress={invite}
                        >
                            <Button.Text>{translate('common.invite')}</Button.Text>
                        </Button>
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            style={styles.mt3}
                            onPress={() => submit(true)}
                        >
                            <Button.Text>{translate('common.skip')}</Button.Text>
                        </Button>
                    </>
                ) : (
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        isDisabled={isOffline}
                        onPress={() => submit(false)}
                    >
                        <Button.Text>{translate('common.confirm')}</Button.Text>
                    </Button>
                )}
            </FixedFooter>
        </ScreenWrapper>
    );
}

VacationDelegateMissingWorkspacesPage.displayName = 'VacationDelegateMissingWorkspacesPage';

export default VacationDelegateMissingWorkspacesPage;
