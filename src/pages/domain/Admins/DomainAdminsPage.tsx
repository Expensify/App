import {adminAccountIDsSelector, adminPendingActionSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearRemoveAdminError} from '@libs/actions/Domain';
import {getLatestError} from '@libs/ErrorUtils';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {clearAddAdminError} from '@userActions/Domain';
import {getCurrentUserAccountID} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainAdminsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS>;

type AdminOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
};

function DomainAdminsPage({route}: DomainAdminsPageProps) {
    const {domainAccountID} = route.params;

    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'Gear', 'Plus']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [adminAccountIDs, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {
        canBeMissing: true,
    });

    const [domainPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminPendingActionSelector,
    });

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});
    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        canBeMissing: false,
        selector: technicalContactSettingsSelector,
    });
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {canBeMissing: true});
    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {canBeMissing: true});

    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const data: AdminOption[] = [];
    for (const accountID of adminAccountIDs ?? []) {
        const details = personalDetails?.[accountID];
        const isPrimaryContact = technicalContactSettings?.technicalContactEmail === details?.login;
        data.push({
            keyForList: String(accountID),
            accountID,
            login: details?.login ?? '',
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            icons: [
                {
                    source: details?.avatar ?? icons.FallbackAvatar,
                    name: formatPhoneNumber(details?.login ?? ''),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
            rightElement: isPrimaryContact && <Badge text={translate('domain.admins.primaryContact')} />,
            errors: getLatestError(domainErrors?.adminErrors?.[accountID]?.errors),
            pendingAction: domainPendingActions?.admin?.[accountID]?.pendingAction ?? domainPendingAction?.[accountID]?.pendingAction,
        });
    }

    const filterMember = (adminOption: AdminOption, searchQuery: string) => {
        const results = tokenizedSearch([adminOption], searchQuery, (option) => [option.text ?? '', option.alternateText ?? '']);
        return results.length > 0;
    };
    const sortMembers = (adminOptions: AdminOption[]) => sortAlphabetically(adminOptions, 'text', localeCompare);
    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers);

    const getCustomListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }

        return (
            <CustomListHeader
                canSelectMultiple={false}
                leftHeaderText={translate('domain.admins.title')}
            />
        );
    };

    const getHeaderButtons = () => {
        if (!isAdmin) {
            return null;
        }
        return (
            <View style={[styles.flexRow, styles.gap2]}>
                <Button
                    success
                    onPress={() => {
                        Navigation.navigate(ROUTES.DOMAIN_ADD_ADMIN.getRoute(domainAccountID));
                    }}
                    text={translate('domain.admins.addAdmin')}
                    icon={icons.Plus}
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={shouldUseNarrowLayout && [styles.flexGrow1, styles.mb3]}
                />
                <Button
                    onPress={() => {
                        Navigation.navigate(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(domainAccountID));
                    }}
                    text={translate('domain.admins.settings')}
                    icon={icons.Gear}
                    innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
                    style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
                />
            </View>
        );
    };

    const listHeaderContent =
        data.length > CONST.SEARCH_ITEM_LIMIT ? (
            <SearchBar
                inputValue={inputValue}
                onChangeText={setInputValue}
                label={translate('domain.admins.findAdmin')}
                shouldShowEmptyState={!filteredData.length}
            />
        ) : null;

    if (isLoadingOnyxValue(domainMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID={DomainAdminsPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('domain.admins.title')}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.Members}
                    shouldShowBackButton={shouldUseNarrowLayout}
                >
                    {!shouldUseNarrowLayout && getHeaderButtons()}
                </HeaderWithBackButton>

                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                <SelectionList
                    sections={[{data: filteredData}]}
                    canSelectMultiple={false}
                    listHeaderContent={listHeaderContent}
                    listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                    ListItem={TableListItem}
                    shouldShowRightCaret
                    onSelectRow={(item: AdminOption) => Navigation.navigate(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(domainAccountID, item.accountID))}
                    shouldShowListEmptyContent={false}
                    listItemTitleContainerStyles={shouldUseNarrowLayout ? undefined : [styles.pr3]}
                    showScrollIndicator={false}
                    addBottomSafeAreaPadding
                    customListHeader={getCustomListHeader()}
                    onDismissError={(item: AdminOption) => clearAddAdminError(domainAccountID, item.accountID)}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainAdminsPage.displayName = 'DomainAdminsPage';

export default DomainAdminsPage;
