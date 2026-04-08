import type {DomainSecurityGroupWithID} from '@selectors/Domain';
import {domainNameSelector, groupsSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import Text from '@components/Text';
import useDomainDocumentTitle from '@hooks/useDomainDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
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
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [groups = getEmptyArray<DomainSecurityGroupWithID>()] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: groupsSelector});

    const data = groups.map((group) => {
        return {
            keyForList: group.id,
            groupID: group.id,
            text: group.details.name ?? '',
            rightElement: (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <Text numberOfLines={1}>{translate('domain.groups.memberCount', {count: Object.keys(group.details.shared).length})}</Text>
                </View>
            ),
        };
    });

    const getCustomListHeader = () => {
        if (!data || data?.length === 0) {
            return null;
        }

        return (
            <CustomListHeader
                canSelectMultiple={false}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate('common.members')}
                shouldDivideEqualWidth
            />
        );
    };

    const createGroupHeaderButton = (
        <Button
            accessibilityLabel={translate('domain.groups.createNewGroupButton')}
            text={translate('domain.groups.createNewGroupButton')}
            sentryLabel={CONST.SENTRY_LABEL.DOMAIN.GROUPS.CREATE_GROUP_BUTTON}
            onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_CREATE.getRoute(domainAccountID))}
            icon={icons.Plus}
            innerStyles={[shouldUseNarrowLayout && styles.alignItemsCenter]}
            style={shouldUseNarrowLayout ? [styles.flexGrow1, styles.mb3] : undefined}
            success
        />
    );

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
                >
                    {!shouldUseNarrowLayout && <View style={[styles.flexRow, styles.gap2]}>{createGroupHeaderButton}</View>}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{createGroupHeaderButton}</View>}

                <SelectionList
                    data={data}
                    ListItem={TableListItem}
                    onSelectRow={(item: GroupOption) => Navigation.navigate(ROUTES.DOMAIN_GROUP_DETAILS.getRoute(domainAccountID, item.groupID))}
                    customListHeader={getCustomListHeader()}
                    shouldShowRightCaret
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupsPage;
