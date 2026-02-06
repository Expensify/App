import type {DomainSecurityGroupWithID} from '@selectors/Domain';
import {groupsSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/ListItem/TableListItem';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type DomainGroupsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.GROUPS>;

function DomainGroupsPage({route}: DomainGroupsPageProps) {
    const {domainAccountID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Members']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const [groups = getEmptyArray<DomainSecurityGroupWithID>()] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: false, selector: groupsSelector});

    const data = groups.map((group) => {
        return {
            keyForList: group.id,
            text: group.details.name ?? '',
            rightElement: (
                <View style={[styles.flex1]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.alignSelfStart]}
                    >
                        {translate('domain.groups.memberCount', {count: Object.keys(group.details.shared).length})}
                    </Text>
                </View>
            ),
        };
    });

    const getCustomListHeader = () => {
        if (!data || data?.length === 0) {
            return null;
        }

        const header = (
            <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween]}>
                <View style={[styles.flex1]}>
                    <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.name')}</Text>
                </View>
                <View style={[styles.flex1]}>
                    <Text style={[styles.textMicroSupporting, styles.alignSelfStart]}>{translate('common.members')}</Text>
                </View>
            </View>
        );

        return <View style={[styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID={DomainGroupsPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('domain.groups.title')}
                    onBackButtonPress={Navigation.popToSidebar}
                    icon={illustrations.Members}
                    shouldShowBackButton={shouldUseNarrowLayout}
                />
                <SelectionList
                    data={data}
                    ListItem={TableListItem}
                    onSelectRow={() => null}
                    customListHeader={getCustomListHeader()}
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainGroupsPage.displayName = 'DomainGroupsPage';

export default DomainGroupsPage;
