import type {DomainSecurityGroupWithID} from '@selectors/Domain';
import {defaultSecurityGroupIDSelector, domainNameSelector, groupsSelector, isSecurityGroupPendingDeleteSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import Badge from '@components/Badge';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchBar from '@components/SearchBar';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import Text from '@components/Text';
import useDomainDocumentTitle from '@hooks/useDomainDocumentTitle';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestError} from '@libs/ErrorUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {clearGroupDeleteError} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type GroupOption = Omit<ListItem, 'groupID'> & {
    /** Group ID */
    groupID: string;
};

type DomainGroupsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.GROUPS>;

function DomainGroupsPage({route}: DomainGroupsPageProps) {
    const {domainAccountID} = route.params;
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    useDomainDocumentTitle(domainName, 'domain.groups.title');

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [groups = getEmptyArray<DomainSecurityGroupWithID>()] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});
    const [defaultGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: defaultSecurityGroupIDSelector});
    const [pendingActions] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`);
    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);

    const data = groups.map((group) => {
        const isDefault = group.id === defaultGroupID;
        return {
            keyForList: group.id,
            groupID: group.id,
            text: group.details.name ?? '',
            errors: getLatestError(domainErrors?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${group.id}`]?.errors),
            rightElement: (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text numberOfLines={1}>{translate('domain.groups.memberCount', {count: Object.keys(group.details.shared).length})}</Text>
                    {isDefault && <Badge text={translate('common.default')} />}
                </View>
            ),
            pendingAction: Object.values(pendingActions?.[`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${group.id}`] ?? {}).find(Boolean),
            isDisabled: isSecurityGroupPendingDeleteSelector(group.id)(pendingActions),
        };
    });

    const filterGroup = (item: GroupOption, searchQuery: string) => tokenizedSearch([item], searchQuery, (o) => [o.text ?? '']).length > 0;

    const [inputValue, setInputValue, filteredData] = useSearchResults(data, filterGroup);

    const shouldShowSearchBar = data.length > CONST.SEARCH_ITEM_LIMIT;
    const shouldShowEmptySearchMessage = shouldShowSearchBar && inputValue.length > 0 && filteredData.length === 0;

    const listHeaderContent = shouldShowSearchBar ? (
        <View style={styles.flexColumn}>
            <View style={[styles.mh5, styles.gap3, styles.mb5, shouldUseNarrowLayout ? styles.flexColumn : styles.flexRow]}>
                <View style={[shouldUseNarrowLayout && styles.w100]}>
                    <SearchBar
                        inputValue={inputValue}
                        onChangeText={setInputValue}
                        label={translate('domain.groups.findGroup')}
                        shouldShowEmptyState={false}
                        style={[styles.flex1, styles.mh0, styles.mb0]}
                    />
                </View>
            </View>
            {shouldShowEmptySearchMessage && (
                <View style={[styles.ph5, styles.pb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('common.noResultsFoundMatching', inputValue)}</Text>
                </View>
            )}
        </View>
    ) : null;

    const getCustomListHeader = () => {
        if (filteredData.length === 0) {
            return null;
        }

        return (
            <CustomListHeader
                canSelectMultiple={false}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate('common.members')}
                shouldDivideEqualWidth
                shouldShowRightCaret
            />
        );
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="DomainGroupsPage"
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.title')}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.Members}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader
                />
                <SelectionList
                    data={filteredData}
                    ListItem={TableListItem}
                    onSelectRow={(item: GroupOption) => Navigation.navigate(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, item.groupID))}
                    onDismissError={(item: GroupOption) => clearGroupDeleteError(domainAccountID, item.groupID)}
                    customListHeader={getCustomListHeader()}
                    shouldHeaderBeInsideList
                    customListHeaderContent={listHeaderContent}
                    shouldShowListEmptyContent={false}
                    shouldShowRightCaret
                    disableMaintainingScrollPosition
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupsPage;
