import React, {useCallback} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollViewWithContext from '@components/ScrollViewWithContext';
import SearchBar from '@components/SearchBar';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import SelectionList from '@components/SelectionListWithSections';
import TableListItem from '@components/SelectionListWithSections/TableListItem';
import type {ListItem} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import {clearAddAdminError, clearRemoveAdminError} from '@userActions/Domain';
import CONST from '@src/CONST';
import {getAdminKey} from '@src/libs/DomainUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type MemberOption = Omit<ListItem, 'accountID' | 'login'> & {
    accountID: number;
    login: string;
};

type BaseDomainMembersPageProps = {
    /** The domain ID */
    domainID: number;

    /** The domain object from Onyx (required for error handling logic) */
    domain: OnyxTypes.Domain | undefined;

    /** The list of accountIDs to display (Admins or Members) */
    accountIDs: number[];

    /** The title of the header */
    headerTitle: string;

    /** Placeholder text for the search bar */
    searchPlaceholder: string;

    /** Content to display in the header (e.g., Add/Settings buttons) */
    headerContent?: React.ReactNode;

    /** Callback fired when a row is selected */
    onSelectRow: (item: MemberOption) => void;

    /** Whether to show the loading state (blocking view) */
    shouldShowLoading?: boolean;
};

function BaseDomainMembersPage({
                                   domainID,
                                   domain,
                                   accountIDs,
                                   headerTitle,
                                   searchPlaceholder,
                                   headerContent,
                                   onSelectRow,
                                   shouldShowLoading = false,
                               }: BaseDomainMembersPageProps) {
    const {formatPhoneNumber, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['LaptopOnDeskWithCoffeeAndKey', 'LockClosed', 'OpenSafe', 'ShieldYellow', 'Members'] as const);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [domainPendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainID}`, {canBeMissing: true});
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: true});

    const data: MemberOption[] = [];
    for (const accountID of accountIDs) {
        const details = personalDetails?.[accountID];
        data.push({
            keyForList: String(accountID),
            accountID,
            login: details?.login ?? '',
            text: formatPhoneNumber(getDisplayNameOrDefault(details)),
            alternateText: formatPhoneNumber(details?.login ?? ''),
            icons: [
                {
                    source: details?.avatar ?? FallbackAvatar,
                    name: formatPhoneNumber(details?.login ?? ''),
                    type: CONST.ICON_TYPE_AVATAR,
                    id: accountID,
                },
            ],
            pendingAction: domainPendingActions?.admin?.[accountID],
            errors: getLatestError(domainErrors?.adminErrors?.[accountID]),
        });
    }

    const filterMember = useCallback((option: MemberOption, searchQuery: string) => {
        const results = tokenizedSearch([option], searchQuery, (item) => [item.text ?? '', item.alternateText ?? '']);
        return results.length > 0;
    }, []);

    const sortMembers = useCallback(
        (options: MemberOption[]) => sortAlphabetically(options, 'text', localeCompare),
        [localeCompare],
    );

    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterMember, sortMembers);

    const getCustomListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }
        return <CustomListHeader canSelectMultiple={false} leftHeaderText={headerTitle} />;
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID={BaseDomainMembersPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACES_LIST.route)}
                shouldShow={shouldShowLoading}
                shouldForceFullScreen
                shouldDisplaySearchRouter
            >
                <HeaderWithBackButton
                    title={headerTitle}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.Members}
                    shouldShowBackButton={shouldUseNarrowLayout}
                >
                    {!shouldUseNarrowLayout && !!headerContent && (
                        <View style={[styles.flexRow, styles.gap2]}>{headerContent}</View>
                    )}
                </HeaderWithBackButton>

                {shouldUseNarrowLayout && !!headerContent && (
                    <View style={[styles.pl5, styles.pr5, styles.flexRow, styles.gap2]}>{headerContent}</View>
                )}

                <ScrollViewWithContext
                    keyboardShouldPersistTaps="handled"
                    addBottomSafeAreaPadding
                    style={[styles.settingsPageBackground, styles.flex1, styles.w100]}
                >
                    <SelectionList
                        sections={[{data: filteredData}]}
                        shouldShowRightCaret
                        canSelectMultiple={false}
                        listHeaderContent={
                            data.length > -1 ? (
                                <SearchBar
                                    inputValue={inputValue}
                                    onChangeText={setInputValue}
                                    label={searchPlaceholder}
                                    shouldShowEmptyState={!filteredData.length}
                                />
                            ) : null
                        }
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        ListItem={TableListItem}
                        onSelectRow={onSelectRow}
                        shouldShowListEmptyContent={false}
                        listItemTitleContainerStyles={shouldUseNarrowLayout ? undefined : [styles.pr3]}
                        showScrollIndicator={false}
                        addBottomSafeAreaPadding
                        customListHeader={getCustomListHeader()}
                        onDismissError={(item) => {
                            const adminKey = getAdminKey(domain, item.accountID);
                            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                                clearAddAdminError(domainID, item.accountID);
                            } else if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && adminKey) {
                                clearRemoveAdminError(domainID, item.accountID, adminKey);
                            }
                        }}
                    />
                </ScrollViewWithContext>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

BaseDomainMembersPage.displayName = 'BaseDomainMembersPage';

export type {MemberOption};
export default BaseDomainMembersPage;
