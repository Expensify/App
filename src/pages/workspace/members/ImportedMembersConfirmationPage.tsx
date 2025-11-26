import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native/Libraries/Types/CoreEventTypes';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportSpreadsheetConfirmModal from '@components/ImportSpreadsheetConfirmModal';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useCloseImportPage from '@hooks/useCloseImportPage';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {closeImportPage} from '@libs/actions/ImportSpreadsheet';
import {openExternalLink} from '@libs/actions/Link';
import {clearImportedSpreadsheetMemberData, importPolicyMembers} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getAccountIDsByLogins} from '@libs/PersonalDetailsUtils';
import {isControlPolicy, isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import WorkspaceMemberDetailsRoleSelectionModal from '@pages/workspace/WorkspaceMemberRoleSelectionModal';
import type {ListItemType} from '@pages/workspace/WorkspaceMemberRoleSelectionModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type ImportedMembersConfirmationPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBERS_IMPORTED>;

function ImportedMembersConfirmationPage({route}: ImportedMembersConfirmationPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [spreadsheet] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET, {canBeMissing: true});
    const [role, setRole] = useState<ValueOf<typeof CONST.POLICY.ROLE>>(CONST.POLICY.ROLE.USER);
    const [isRoleSelectionModalVisible, setIsRoleSelectionModalVisible] = useState(false);

    const policyID = route.params.policyID;
    const policy = usePolicy(policyID);
    const [isImporting, setIsImporting] = useState(false);
    const {isOffline} = useNetwork();

    const personalDetails = usePersonalDetails();
    const {setIsClosing} = useCloseImportPage();

    useEffect(() => {
        return () => {
            clearImportedSpreadsheetMemberData();
        };
    }, []);

    const [importedSpreadsheetMemberData] = useOnyx(ONYXKEYS.IMPORTED_SPREADSHEET_MEMBER_DATA, {canBeMissing: true});
    const newMembers = useMemo(() => {
        return importedSpreadsheetMemberData?.filter((member) => !isPolicyMemberWithoutPendingDelete(member.email, policy) && !member.role) ?? [];
    }, [importedSpreadsheetMemberData, policy]);
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
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newMembers, personalDetails]);

    /** Opens privacy url as an external link */
    const openPrivacyURL = (event: GestureResponderEvent | KeyboardEvent | undefined) => {
        event?.preventDefault();
        openExternalLink(CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL);
    };

    const importMembers = useCallback(() => {
        if (!newMembers) {
            return;
        }
        setIsImporting(true);
        const membersWithRole = (importedSpreadsheetMemberData ?? []).map((member) => ({...member, role: member.role || role}));
        importPolicyMembers(policyID, membersWithRole);
    }, [importedSpreadsheetMemberData, newMembers, policyID, role]);

    const closeImportPageAndModal = () => {
        setIsClosing(true);
        setIsImporting(false);
        closeImportPage();
    };

    const onRoleChange = (item: ListItemType) => {
        setRole(item.value);
        setIsRoleSelectionModalVisible(false);
    };

    const roleItems: ListItemType[] = useMemo(() => {
        const items: ListItemType[] = [
            {
                value: CONST.POLICY.ROLE.ADMIN,
                text: translate('common.admin'),
                alternateText: translate('workspace.common.adminAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.ADMIN,
                keyForList: CONST.POLICY.ROLE.ADMIN,
            },
            {
                value: CONST.POLICY.ROLE.AUDITOR,
                text: translate('common.auditor'),
                alternateText: translate('workspace.common.auditorAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.AUDITOR,
                keyForList: CONST.POLICY.ROLE.AUDITOR,
            },
            {
                value: CONST.POLICY.ROLE.USER,
                text: translate('common.member'),
                alternateText: translate('workspace.common.memberAlternateText'),
                isSelected: role === CONST.POLICY.ROLE.USER,
                keyForList: CONST.POLICY.ROLE.USER,
            },
        ];

        if (!isControlPolicy(policy)) {
            return items.filter((item) => item.value !== CONST.POLICY.ROLE.AUDITOR);
        }
        return items;
    }, [role, translate, policy]);

    if (!spreadsheet || !importedSpreadsheetMemberData) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldUseCachedViewportHeight
            testID={ImportedMembersConfirmationPage.displayName}
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
                            title={translate(`workspace.common.roleName`, {role})}
                            description={translate('common.role')}
                            shouldShowRightIcon
                            onPress={() => {
                                setIsRoleSelectionModalVisible(true);
                            }}
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
                >
                    <View style={[styles.flexRow]}>
                        <Text style={[styles.mr1, styles.label, styles.link]}>{translate('common.privacy')}</Text>
                    </View>
                </PressableWithoutFeedback>
            </FixedFooter>
            <ImportSpreadsheetConfirmModal
                isVisible={spreadsheet?.shouldFinalModalBeOpened}
                closeImportPageAndModal={closeImportPageAndModal}
                shouldHandleNavigationBack={false}
            />
            <WorkspaceMemberDetailsRoleSelectionModal
                isVisible={isRoleSelectionModalVisible}
                items={roleItems}
                onRoleChange={onRoleChange}
                onClose={() => setIsRoleSelectionModalVisible(false)}
            />
        </ScreenWrapper>
    );
}

ImportedMembersConfirmationPage.displayName = 'ImportedMembersConfirmationPage';

export default ImportedMembersConfirmationPage;
