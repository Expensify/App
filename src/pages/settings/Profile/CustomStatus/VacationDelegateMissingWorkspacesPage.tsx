import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
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
import {createPoliciesByIDsSelector} from '@src/selectors/Policy';
import type {VacationDelegatePolicyDiff} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {NavigationAction} from '@react-navigation/native';

import {useNavigation, usePreventRemove} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

type ScreenInput = {
    delegate: string;
    policyDiff: VacationDelegatePolicyDiff;
};

function VacationDelegateMissingWorkspacesPage() {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const navigation = useNavigation();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUser = {
        accountID: currentUserPersonalDetails.accountID,
        displayName: currentUserPersonalDetails.displayName,
        email: currentUserPersonalDetails.email,
        avatar: currentUserPersonalDetails.avatar,
    };

    const [vacationDelegate, vacationDelegateMetadata] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);

    const [submittedInput, setSubmittedInput] = useState<ScreenInput>();

    const creator = currentUserPersonalDetails.login ?? '';
    const delegate = submittedInput?.delegate ?? vacationDelegate?.delegate ?? '';
    const previousDelegate = vacationDelegate?.previousDelegate;
    const policyDiff = submittedInput?.policyDiff ?? vacationDelegate?.policyDiff;
    const adminPolicies = policyDiff?.adminPolicies ?? [];
    const nonAdminPolicies = policyDiff?.nonAdminPolicies ?? [];

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createPoliciesByIDsSelector([...adminPolicies, ...nonAdminPolicies])});
    const [allPersonalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    const isSubmittingRef = useRef(false);

    usePreventRemove(!!policyDiff, ({data}: {data: {action: NavigationAction}}) => {
        if (!isSubmittingRef.current && policyDiff) {
            setSubmittedInput({delegate, policyDiff});
            clearVacationDelegateError(previousDelegate);
        }

        navigation.dispatch(data.action);
    });
    const canInvite = adminPolicies.length > 0;
    const hasUnresolvedAdminPolicy = adminPolicies.some((policyID) => !policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.id);

    if (!submittedInput && isLoadingOnyxValue(vacationDelegateMetadata)) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (!policyDiff) {
        return <NotFoundPage />;
    }

    const getMenuItemsForPolicies = (policyIDs: string[]) =>
        policyIDs.map((policyID, index) => ({
            key: policyID,
            title: policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.name ?? translate('workspace.common.unavailable'),
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

    const submit = () => {
        setSubmittedInput({delegate, policyDiff});
        setVacationDelegate({creator, delegate, currentDelegate: previousDelegate, shouldOverridePolicyDiffWarning: true});
        goBackToStatus();
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

        // The delegate may have been picked from the selector without existing in personal details yet, so fall back to an optimistic accountID.
        const [delegateAccountID] = getAccountIDsByLogins([delegate]);
        const invitedEmailsToAccountIDs = {[delegate]: delegateAccountID};
        const {newAccountIDs, newLogins} = getNewAccountIDsAndLogins(invitedEmailsToAccountIDs, allPersonalDetails);
        const personalDetailsOnyxData = getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber);
        const policyExpenseChatReportActions = getAllPolicyExpenseChatReportActions(allReports, allReportActions);

        for (const [index, policyID] of adminPolicies.entries()) {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            const isLastInvite = index === adminPolicies.length - 1;
            addMembersToWorkspace(
                invitedEmailsToAccountIDs,
                isLastInvite ? personalDetailsOnyxData : {optimisticData: personalDetailsOnyxData.optimisticData},
                `# ${currentUserPersonalDetails.displayName ?? ''} invited you to ${policy?.name ?? ''}\n\n${translate('workspace.common.welcomeNote')}`,
                policy,
                Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList, false, false)),
                CONST.POLICY.ROLE.USER,
                currentUser,
                policyExpenseChatReportActions,
            );
        }

        // Workspaces the current user does not administer are untouched here and still need their own admins emailed.
        submit();
    };

    // Format SMS delegates as phone numbers rather than raw @expensify.sms logins, and escape the result since this copy is rendered as HTML.
    const escapedDelegate = Str.htmlEncode(formatPhoneNumber(delegate));
    let introCopy: string;
    if (!canInvite) {
        introCopy = translate('statusPage.vacationDelegate.notAMemberAdminsWillBeAsked', escapedDelegate);
    } else if (nonAdminPolicies.length > 0) {
        introCopy = translate('statusPage.vacationDelegate.notAMemberMixed', escapedDelegate);
    } else {
        introCopy = translate('statusPage.vacationDelegate.notAMemberInviteThemNow', escapedDelegate);
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
                <FixedFooter addBottomSafeAreaPadding>
                    {canInvite ? (
                        <>
                            <Button
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                size={CONST.BUTTON_SIZE.LARGE}
                                isDisabled={hasUnresolvedAdminPolicy}
                                onPress={invite}
                            >
                                <Button.Text>{translate('common.invite')}</Button.Text>
                            </Button>
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                style={styles.mt3}
                                onPress={submitOnce}
                            >
                                <Button.Text>{translate('common.skip')}</Button.Text>
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            onPress={submitOnce}
                        >
                            <Button.Text>{translate('common.confirm')}</Button.Text>
                        </Button>
                    )}
                </FixedFooter>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

VacationDelegateMissingWorkspacesPage.displayName = 'VacationDelegateMissingWorkspacesPage';

export default VacationDelegateMissingWorkspacesPage;
