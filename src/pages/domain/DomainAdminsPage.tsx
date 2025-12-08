import React, {useMemo, useRef, useCallback} from 'react';
import { View } from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import SearchBar from '@components/SearchBar';
import SelectionListWithModal from '@components/SelectionListWithModal';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import { canUseTouchScreen } from '@libs/DeviceCapabilities';
import Navigation from '@navigation/Navigation';
import type { PlatformStackScreenProps } from '@navigation/PlatformStackNavigation/types';
import type { DomainSplitNavigatorParamList } from '@navigation/types';
import DomainSamlPage from '@pages/domain/DomainSamlPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import { isEmptyObject } from '@src/types/utils/EmptyObject';
import type {ListItem} from '@components/SelectionListWithSections/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {FallbackAvatar, Plus} from '@components/Icon/Expensicons';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import MessagesRow from '@components/MessagesRow';
import {dismissAddedWithPrimaryLoginMessages} from '@userActions/Policy/Policy';
import useNetwork from '@hooks/useNetwork';
import useSearchResults from '@hooks/useSearchResults';
import {isPersonalDetailsReady, sortAlphabetically} from '@libs/OptionsListUtils';
import Button from '@components/Button';

function invertObject(object: Record<string, string>): Record<string, string> {
    const invertedEntries = Object.entries(object).map(([key, value]) => [value, key] as const);
    return Object.fromEntries(invertedEntries);
}

type DomainSamlPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.SAML>;

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
    customField1?: string;
    customField2?: string;
};

function DomainAdminsPage({route}: DomainSamlPageProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['LaptopOnDeskWithCoffeeAndKey', 'LockClosed', 'OpenSafe', 'ShieldYellow', 'Members'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const accountID = route.params.accountID;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${accountID}`, {canBeMissing: true});
    const [isAdmin] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${accountID}`, {canBeMissing: false});

    const textInputRef = useRef<TextInput>(null);
    const fakeID = '15EDF503224FEB58';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${fakeID}`, {canBeMissing: false});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const isOfflineAndNoMemberDataAvailable = isEmptyObject(policy?.employeeList) && isOffline;

    const policyMemberEmailsToAccountIDs = useMemo(() => getMemberAccountIDsForWorkspace(policy?.employeeList, true), [policy?.employeeList]);

    const data: MemberOption[] = useMemo(() => {
        const result: MemberOption[] = [];
        for (const [email, policyEmployee] of Object.entries(policy?.employeeList ?? {})) {
            const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
            const details = personalDetails?.[accountID];
            result.push({
                keyForList: details.login ?? '',
                accountID,
                login: details.login ?? '',
                customField1: policyEmployee.employeeUserID,
                customField2: policyEmployee.employeePayrollID,
                isInteractive: !details.isOptimisticPersonalDetail,
                cursorStyle: details.isOptimisticPersonalDetail ? styles.cursorDefault : {},
                text: formatPhoneNumber(getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                icons: [
                    {
                        source: details.avatar ?? FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: getLatestErrorMessageField(policyEmployee),
                pendingAction: policyEmployee.pendingAction,
            });
        }
        return result;
    }, []);

    const invitedPrimaryToSecondaryLogins = useMemo(() => invertObject(policy?.primaryLoginsInvited ?? {}), [policy?.primaryLoginsInvited]);

    const getHeaderContent = () => (
        <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
            {!isEmptyObject(invitedPrimaryToSecondaryLogins) && (
                <MessagesRow
                    type="success"
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: translate('workspace.people.addedWithPrimary')}}
                    containerStyles={[styles.pb5, styles.ph5]}
                    onClose={() => dismissAddedWithPrimaryLoginMessages(fakeID)}
                />
            )}
        </View>
    );

    const isLoading = useMemo(
        () => !isOfflineAndNoMemberDataAvailable && (!isPersonalDetailsReady(personalDetails) || isEmptyObject(policy?.employeeList)),
        [isOfflineAndNoMemberDataAvailable, personalDetails, policy?.employeeList],
    );

    const headerMessage = useMemo(() => {
        if (isOfflineAndNoMemberDataAvailable) {
            return translate('workspace.common.mustBeOnlineToViewMembers');
        }

        return !isLoading && isEmptyObject(policy?.employeeList) ? translate('workspace.common.memberNotFound') : '';
    }, [isLoading, policy?.employeeList, translate, isOfflineAndNoMemberDataAvailable]);

    const sortMembers = useCallback((memberOptions: MemberOption[]) => sortAlphabetically(memberOptions, 'text', localeCompare), [localeCompare]);

    const [inputValue, setInputValue, filteredData] = useSearchResults(data, () => true, sortMembers);

    const headerContent = (
        <>
            {shouldUseNarrowLayout && data.length > 0 && <View style={[styles.pr5]}>{getHeaderContent()}</View>}
            {!shouldUseNarrowLayout && (
                <>
                    {!!headerMessage && (
                        <View style={[styles.ph5, styles.pb5]}>
                            <Text style={[styles.textLabel, styles.colorMuted, styles.minHeight5]}>{headerMessage}</Text>
                        </View>
                    )}
                    {getHeaderContent()}
                </>
            )}
            {data.length > 1 && (
                <SearchBar
                    inputValue={inputValue}
                    onChangeText={setInputValue}
                    label={translate('workspace.people.findMember')}
                    shouldShowEmptyState={!filteredData.length}
                />
            )}
        </>
    );

    const getHeaderButtons = () => {
        if (!isAdmin) {
            return null;
        }
        return (
            <View style={[styles.flexRow, styles.gap2]}>
                <Button
                    success
                    onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_ADMIN.getRoute(accountID))}
                    text={translate('workspace.invite.member')}
                    icon={Plus}
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                />
            </View>
        );
    };

    const openMemberDetails = useCallback(
        (item: MemberOption) => {
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(route.params.accountID, item.accountID));
            });
        },
        [route.params.accountID],
    );

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID={DomainSamlPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldShow={!domain || !isAdmin}
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={translate('domain.domainAdmins.title')}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.Members}
                    shouldShowBackButton={shouldUseNarrowLayout}
                >
                    {getHeaderButtons()}
                </HeaderWithBackButton>

                <ScrollViewWithContext
                    keyboardShouldPersistTaps="handled"
                    addBottomSafeAreaPadding
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                >
                    <View style={shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection}>
                        <SelectionListWithModal
                            sections={[{data, isDisabled: false}]}
                            ListItem={TableListItem}
                            shouldShowRightCaret
                            listHeaderContent={headerContent}
                            shouldUseDefaultRightHandSideCheckmark={false}
                            shouldUseUserSkeletonView
                            shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                            textInputRef={textInputRef}
                            // listHeaderContent={headerContent}
                            shouldShowListEmptyContent={false}
                            // customListHeader={getCustomListHeader()}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                            listItemTitleContainerStyles={shouldUseNarrowLayout ? undefined : [styles.pr3]}
                            showScrollIndicator={false}
                            addBottomSafeAreaPadding
                            onSelectRow={openMemberDetails}
                        />
                    </View>
                </ScrollViewWithContext>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DomainAdminsPage;
