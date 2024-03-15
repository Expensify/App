import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
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
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WorkspacesCentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

type WorkspaceTagsPageProps = WorkspaceTagsOnyxProps & StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS>;

function WorkspaceTagsPage({policyTags, route}: WorkspaceTagsPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});

    function fetchTags() {
        Policy.openPolicyTagsPage(route.params.policyID);
    }

    const {isOffline} = useNetwork({onReconnect: fetchTags});

    useEffect(() => {
        fetchTags();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const policyTagLists = useMemo(() => PolicyUtils.getTagLists(policyTags), [policyTags]);
    const tagList = useMemo<PolicyForList[]>(
        () =>
            policyTagLists
                .map((policyTagList) =>
                    Object.values(policyTagList.tags || []).map((value) => ({
                        value: value.name,
                        text: value.name,
                        keyForList: value.name,
                        isSelected: !!selectedTags[value.name],
                        pendingAction: value.pendingAction,
                        errors: value.errors ?? undefined,
                        rightElement: (
                            <View style={styles.flexRow}>
                                <Text style={[styles.textSupporting, styles.alignSelfCenter, styles.pl2, styles.label]}>
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
        [policyTagLists, selectedTags, styles.alignSelfCenter, styles.flexRow, styles.label, styles.p1, styles.pl2, styles.textSupporting, theme.icon, translate],
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

    const navigateToTagsSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAGS_SETTINGS.getRoute(route.params.policyID));
    };

    const navigateToCreateTagPage = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_CREATE.getRoute(route.params.policyID));
    };

    const isLoading = !isOffline && policyTags === undefined;

    const headerButtons = (
        <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
            <Button
                medium
                success
                onPress={navigateToCreateTagPage}
                icon={Expensicons.Plus}
                text={translate('workspace.tags.addTag')}
                style={[styles.mr3, isSmallScreenWidth && styles.w50]}
            />
            {policyTags && (
                <Button
                    medium
                    onPress={navigateToTagsSettings}
                    icon={Expensicons.Gear}
                    text={translate('common.settings')}
                    style={[isSmallScreenWidth && styles.w50]}
                />
            )}
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
                    >
                        {!isSmallScreenWidth && headerButtons}
                    </HeaderWithBackButton>
                    {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}
                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.subtitle')}</Text>
                    </View>
                    {isLoading && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            color={theme.spinner}
                        />
                    )}
                    {tagList.length === 0 && !isLoading && (
                        <WorkspaceEmptyStateSection
                            title={translate('workspace.tags.emptyTags.title')}
                            icon={Illustrations.EmptyStateExpenses}
                            subtitle={translate('workspace.tags.emptyTags.subtitle')}
                        />
                    )}
                    {tagList.length > 0 && (
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
                            onDismissError={(item) => Policy.clearPolicyTagErrors(route.params.policyID, item.value)}
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
