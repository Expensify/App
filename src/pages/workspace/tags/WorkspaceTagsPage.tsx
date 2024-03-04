import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type PolicyForList = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
    rightElement: React.ReactNode;
};

type WorkspaceTagsOnyxProps = {
    /** Collection of tags attached to a policy */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>;
};

type WorkspaceTagsPageProps = WorkspaceTagsOnyxProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS>;

function WorkspaceTagsPage({policyTags, route}: WorkspaceTagsPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);
    const tagList = useMemo<PolicyForList[]>(
        () =>
            policyTagLists
                .map((policyTagList) =>
                    Object.values(policyTagList.tags).map((value) => ({
                        value: value.name,
                        text: value.name,
                        keyForList: value.name,
                        isSelected: !!selectedTags[value.name],
                        rightElement: (
                            <View style={styles.flexRow}>
                                <Text style={[styles.disabledText, styles.alignSelfCenter]}>
                                    {value.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')}
                                </Text>
                                <View style={[styles.p1, styles.pl2]}>
                                    <Icon
                                        src={Expensicons.ArrowRight}
                                        fill={theme.icon}
                                    />
                                </View>
                            </View>
                        ),
                    })),
                )
                .flat(),
        [policyTagLists, selectedTags, styles.alignSelfCenter, styles.disabledText, styles.flexRow, styles.p1, styles.pl2, theme.icon, translate],
    );

    const toggleTag = (tag: PolicyForList) => {
        setSelectedTags((prev) => ({
            ...prev,
            [tag.value]: !prev[tag.value],
        }));
    };

    const toggleAllTags = () => {
        const isAllSelected = tagList.every((tag) => !!selectedTags[tag.value]);
        setSelectedTags(isAllSelected ? {} : Object.fromEntries(tagList.map((item) => [item.value, true])));
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceTagsPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        icon={Illustrations.Tag}
                        title={translate('workspace.common.tags')}
                        shouldShowBackButton={isSmallScreenWidth}
                    />
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.subtitle')}</Text>
                    </View>
                    {tagList.length ? (
                        <SelectionList
                            canSelectMultiple
                            sections={[{data: tagList, indexOffset: 0, isDisabled: false}]}
                            onCheckboxPress={toggleTag}
                            onSelectRow={() => {}}
                            onSelectAll={toggleAllTags}
                            showScrollIndicator
                            ListItem={TableListItem}
                            customListHeader={getCustomListHeader()}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        />
                    ) : (
                        <WorkspaceEmptyStateSection
                            title={translate('workspace.tags.emptyTags.title')}
                            icon={Illustrations.EmptyStateExpenses}
                            subtitle={translate('workspace.tags.emptyTags.subtitle')}
                        />
                    )}
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTagsPage.displayName = 'WorkspaceTagsPage';

export default withOnyx<WorkspaceTagsPageProps, WorkspaceTagsOnyxProps>({
    policyTags: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${route.params.policyID}`,
    },
})(WorkspaceTagsPage);
