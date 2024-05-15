import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {TagListItem} from './types';

type WorkspaceTagsPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.TAGS>;

function WorkspaceTagsPage({route}: WorkspaceTagsPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTags, setSelectedTags] = useState<Record<string, boolean>>({});
    const [isDeleteTagsConfirmModalVisible, setIsDeleteTagsConfirmModalVisible] = useState(false);
    const isFocused = useIsFocused();
    const policyID = route.params.policyID ?? '';
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const {environmentURL} = useEnvironment();
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const [policyTagLists, isMultiLevelTags] = useMemo(() => [PolicyUtils.getTagLists(policyTags), PolicyUtils.isMultiLevelTags(policyTags)], [policyTags]);
    const canSelectMultiple = !isMultiLevelTags;

    const fetchTags = useCallback(() => {
        Policy.openPolicyTagsPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchTags});

    useFocusEffect(fetchTags);

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedTags({});
    }, [isFocused]);

    const tagList = useMemo<TagListItem[]>(() => {
        if (isMultiLevelTags) {
            return policyTagLists.map((policyTagList) => ({
                value: policyTagList.name,
                orderWeight: policyTagList.orderWeight,
                text: PolicyUtils.getCleanedTagName(policyTagList.name),
                keyForList: String(policyTagList.orderWeight),
                isSelected: selectedTags[policyTagList.name],
                enabled: true,
                required: policyTagList.required,
                rightElement: (
                    <ListItemRightCaretWithLabel
                        labelText={policyTagList.required ? translate('common.required') : undefined}
                        shouldShowCaret={false}
                    />
                ),
            }));
        }
        return Object.values(policyTagLists[0]?.tags ?? {})
            .sort((tagA, tagB) => localeCompare(tagA.name, tagB.name))
            .map((tag) => ({
                value: tag.name,
                text: PolicyUtils.getCleanedTagName(tag.name),
                keyForList: tag.name,
                isSelected: selectedTags[tag.name],
                pendingAction: tag.pendingAction,
                errors: tag.errors ?? undefined,
                enabled: tag.enabled,
                isDisabled: tag.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                rightElement: <ListItemRightCaretWithLabel labelText={tag.enabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')} />,
            }));
    }, [isMultiLevelTags, policyTagLists, selectedTags, translate]);

    const tagListKeyedByName = useMemo(
        () =>
            tagList.reduce<Record<string, TagListItem>>((acc, tag) => {
                acc[tag.value] = tag;
                return acc;
            }, {}),
        [tagList],
    );

    const toggleTag = (tag: TagListItem) => {
        setSelectedTags((prev) => ({
            ...prev,
            [tag.value]: !prev[tag.value],
        }));
    };

    const toggleAllTags = () => {
        const isAllSelected = tagList.every((tag) => !!selectedTags[tag.value]);
        setSelectedTags(isAllSelected ? {} : Object.fromEntries(tagList.map((item) => [item.value, true])));
    };

    const getCustomListHeader = () => {
        const header = (
            <View
                style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.justifyContentBetween,
                    // Required padding accounting for the checkbox and the right arrow in multi-select mode
                    canSelectMultiple && [styles.pl3, styles.pr9],
                ]}
            >
                <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
                <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
            </View>
        );
        if (canSelectMultiple) {
            return header;
        }
        return <View style={[styles.flexRow, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    const navigateToTagsSettings = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAGS_SETTINGS.getRoute(policyID));
    };

    const navigateToCreateTagPage = () => {
        Navigation.navigate(ROUTES.WORKSPACE_TAG_CREATE.getRoute(policyID));
    };

    const navigateToTagSettings = (tag: TagListItem) => {
        if (tag.orderWeight != null) {
            Navigation.navigate(ROUTES.WORKSPACE_TAG_LIST_VIEW.getRoute(policyID, tag.orderWeight));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_TAG_SETTINGS.getRoute(policyID, tag.value));
    };

    const selectedTagsArray = Object.keys(selectedTags).filter((key) => selectedTags[key]);

    const deleteTags = () => {
        setSelectedTags({});
        Policy.deletePolicyTags(policyID, selectedTagsArray);
        setIsDeleteTagsConfirmModalVisible(false);
    };

    const isLoading = !isOffline && policyTags === undefined;

    const getHeaderButtons = () => {
        const isThereAnyAccountingConnection = Object.keys(policy?.connections ?? {}).length !== 0;

        if (selectedTagsArray.length === 0) {
            return (
                <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
                    {!isThereAnyAccountingConnection && !isMultiLevelTags && (
                        <Button
                            medium
                            success
                            onPress={navigateToCreateTagPage}
                            icon={Expensicons.Plus}
                            text={translate('workspace.tags.addTag')}
                            style={[styles.mr3, isSmallScreenWidth && styles.w50]}
                        />
                    )}
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
        }

        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.TAGS_BULK_ACTION_TYPES>>> = [];

        if (!isThereAnyAccountingConnection && !isMultiLevelTags) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags'),
                value: CONST.POLICY.TAGS_BULK_ACTION_TYPES.DELETE,
                onSelected: () => setIsDeleteTagsConfirmModalVisible(true),
            });
        }

        let enabledTagCount = 0;
        const tagsToDisable: Record<string, {name: string; enabled: boolean}> = {};
        let disabledTagCount = 0;
        const tagsToEnable: Record<string, {name: string; enabled: boolean}> = {};
        for (const tagName of selectedTagsArray) {
            if (tagListKeyedByName[tagName]?.enabled) {
                enabledTagCount++;
                tagsToDisable[tagName] = {
                    name: tagName,
                    enabled: false,
                };
            } else {
                disabledTagCount++;
                tagsToEnable[tagName] = {
                    name: tagName,
                    enabled: true,
                };
            }
        }

        if (enabledTagCount > 0) {
            options.push({
                icon: Expensicons.DocumentSlash,
                text: translate(enabledTagCount === 1 ? 'workspace.tags.disableTag' : 'workspace.tags.disableTags'),
                value: CONST.POLICY.TAGS_BULK_ACTION_TYPES.DISABLE,
                onSelected: () => {
                    setSelectedTags({});
                    Policy.setWorkspaceTagEnabled(policyID, tagsToDisable);
                },
            });
        }

        if (disabledTagCount > 0) {
            options.push({
                icon: Expensicons.Document,
                text: translate(disabledTagCount === 1 ? 'workspace.tags.enableTag' : 'workspace.tags.enableTags'),
                value: CONST.POLICY.TAGS_BULK_ACTION_TYPES.ENABLE,
                onSelected: () => {
                    setSelectedTags({});
                    Policy.setWorkspaceTagEnabled(policyID, tagsToEnable);
                },
            });
        }

        return (
            <ButtonWithDropdownMenu
                onPress={() => null}
                shouldAlwaysShowDropdownMenu
                pressOnEnter
                isSplitButton={false}
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                customText={translate('workspace.common.selected', {selectedNumber: selectedTagsArray.length})}
                options={options}
                style={[isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && styles.mb3]}
            />
        );
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceTagsPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={Illustrations.Tag}
                    title={translate('workspace.common.tags')}
                    shouldShowBackButton={isSmallScreenWidth}
                >
                    {!isSmallScreenWidth && getHeaderButtons()}
                </HeaderWithBackButton>
                <ConfirmModal
                    isVisible={isDeleteTagsConfirmModalVisible}
                    onConfirm={deleteTags}
                    onCancel={() => setIsDeleteTagsConfirmModalVisible(false)}
                    title={translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTag' : 'workspace.tags.deleteTags')}
                    prompt={translate(selectedTagsArray.length === 1 ? 'workspace.tags.deleteTagConfirmation' : 'workspace.tags.deleteTagsConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                <View style={[styles.ph5, styles.pb5, styles.pt3]}>
                    {isConnectedToAccounting ? (
                        <Text>
                            <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.tags.importedFromAccountingSoftware')} `}</Text>
                            <TextLink
                                style={[styles.textNormal, styles.link]}
                                href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
                            >
                                {`${translate('workspace.accounting.qbo')} ${translate('workspace.accounting.settings')}`}
                            </TextLink>
                        </Text>
                    ) : (
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.tags.subtitle')}</Text>
                    )}
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
                {tagList.length > 0 && !isLoading && (
                    <SelectionList
                        canSelectMultiple={canSelectMultiple}
                        sections={[{data: tagList, isDisabled: false}]}
                        onCheckboxPress={toggleTag}
                        onSelectRow={navigateToTagSettings}
                        onSelectAll={toggleAllTags}
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        onDismissError={(item) => Policy.clearPolicyTagErrors(policyID, item.value)}
                        showScrollIndicator={false}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTagsPage.displayName = 'WorkspaceTagsPage';

export default WorkspaceTagsPage;
