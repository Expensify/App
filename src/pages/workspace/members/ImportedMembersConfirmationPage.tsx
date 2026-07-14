import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';

import useCloseImportPage from '@hooks/useCloseImportPage';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useImportSpreadsheetConfirmModal from '@hooks/useImportSpreadsheetConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {closeImportPage} from '@libs/actions/ImportSpreadsheet';
import {openExternalLink} from '@libs/actions/Link';
import {clearImportedSpreadsheetMemberData, importPolicyMembers} from '@libs/actions/Policy/Member';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAccountIDsByLogins} from '@libs/PersonalDetailsUtils';
import {canMemberAssignElevatedRole, canMemberAssignRole, isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

type ImportedMembersConfirmationPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_IMPORTED>;

function ImportedMembersConfirmationPage({route}: ImportedMembersConfirmationPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET);
    const [roleFromOnyx = CONST.POLICY.ROLE.USER] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_ROLE);

    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const canAssignElevatedRoles = canMemberAssignElevatedRole(policy, currentUserLogin);
    const role = canMemberAssignRole(policy, currentUserLogin, roleFromOnyx) ? roleFromOnyx : CONST.POLICY.ROLE.USER;
    const [isImporting, setIsImporting] = useState(false);
    const {isOffline} = useNetwork();

    const personalDetails = usePersonalDetails();
    const {setIsClosing} = useCloseImportPage();
    const showImportSpreadsheetConfirmModal = useImportSpreadsheetConfirmModal();

    useEffect(() => {
        return () => {
            clearImportedSpreadsheetMemberData();
        };
    }, []);

    const [importedSpreadsheetMemberData] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_DATA);
    const computedNewMembers = useMemo(() => {
        return importedSpreadsheetMemberData?.filter((member) => !isPolicyMemberWithoutPendingDelete(member.email, policy) && !member.role) ?? [];
    }, [importedSpreadsheetMemberData, policy]);

    // Freeze the displayed members once import starts so the UI doesn't reset
    // when the policy updates with the newly imported members.
    const newMembersRef = useRef(computedNewMembers);
    if (!isImporting) {
        newMembersRef.current = computedNewMembers;
    }
    const newMembers = newMembersRef.current;
    const invitedEmailsToAccountIDsDraft = useMemo(() => {
        const memberEmails = newMembers.map((member) => member.email);
        return memberEmails.reduce(
            (acc, email) => {
                acc[email] = getAccountIDsByLogins([email])?.at(0) ?? 0;
                return acc;
            },
            {} as Record<string, number>,
        );
        // getAccountIDsByLogins function uses the personalDetails data from the connection, so we need to re-run this logic when the personal detail is changed.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newMembers, personalDetails]);

    /** Opens privacy url as an external link */
    const openPrivacyURL = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        event?.preventDefault();
        openExternalLink(CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL);
    };

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImporting(false);
        closeImportPage();
        Navigation.goBack(ROUTES.WORKSPACE_MEMBERS.getRoute(policyID));
    };

    const importMembers = async () => {
        if (!newMembers) {
            return;
        }
        setIsImporting(true);
        const membersWithRole = (importedSpreadsheetMemberData ?? []).map((member) => ({...member, role: member.role || role}));
        const importFinalModal = await importPolicyMembers(policy, membersWithRole);
        const didShowImportFinalModal = await showImportSpreadsheetConfirmModal(importFinalModal, {shouldHandleNavigationBack: false});
        if (!didShowImportFinalModal) {
            setIsImporting(false);
            return;
        }
        closeImportPageAndModal();
    };

    if (!spreadsheet || !importedSpreadsheetMemberData) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldUseCachedViewportHeight
            testID="ImportedMembersConfirmationPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.inviteMessage.confirmDetails')}
                subtitle={policy?.name}
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack();
                }}
            />
            <View style={styles.ph5}>
                <View style={[styles.mv4, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ReportActionAvatars
                        size={CONST.AVATAR_SIZE.LARGE}
                        accountIDs={Object.values(invitedEmailsToAccountIDsDraft ?? {})}
                        horizontalStacking={{
                            displayInRows: true,
                        }}
                        secondaryAvatarContainerStyle={[styles.secondAvatarInline]}
                    />
                </View>
                <View style={[styles.mb5]}>
                    <Text>{translate('spreadsheet.importMemberConfirmation', {count: newMembers?.length ?? 0})}</Text>
                </View>
                <View style={[styles.mb3]}>
                    <View style={[styles.mhn5, styles.mb3]}>
                        <MenuItemWithTopDescription
                            title={translate(`workspace.common.roleName`, role)}
                            description={translate('common.role')}
                            shouldShowRightIcon={canAssignElevatedRoles}
                            interactive={canAssignElevatedRoles}
                            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.IMPORTED_MEMBERS_ROLE.path))}
                        />
                    </View>
                </View>
            </View>
            <FixedFooter style={[styles.flex1, styles.justifyContentEnd]}>
                <Button
                    text={translate('common.import')}
                    onPress={importMembers}
                    isLoading={isImporting}
                    isDisabled={isOffline}
                    pressOnEnter
                    success
                    large
                    style={styles.mb3}
                />
                <PressableWithoutFeedback
                    onPress={openPrivacyURL}
                    role={CONST.ROLE.LINK}
                    accessibilityLabel={translate('common.privacy')}
                    href={CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}
                    style={[styles.mv2, styles.alignSelfStart]}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.IMPORTED_MEMBERS_CONFIRMATION_PRIVACY_LINK}
                >
                    <View style={[styles.flexRow]}>
                        <Text style={[styles.mr1, styles.label, styles.link]}>{translate('common.privacy')}</Text>
                    </View>
                </PressableWithoutFeedback>
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default ImportedMembersConfirmationPage;
