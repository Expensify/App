import ActivityIndicator from '@components/ActivityIndicator';
import Avatar from '@components/Avatar';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSuggestedAgents from '@hooks/useSuggestedAgents';
import useThemeStyles from '@hooks/useThemeStyles';

import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import type {AgentAvatarID} from '@libs/Avatars/AgentAvatarCatalog';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {clearNewAgentTemplate, setNewAgentTemplate, getAgentTemplates} from '@userActions/Agent';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type SuggestedAgent from '@src/types/onyx/SuggestedAgent';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type AgentTemplateCardProps = {
    /** The backend-served template to render */
    template: SuggestedAgent;

    /** Preset avatar shown on the card and copied onto the agent (backend templates don't carry one) */
    avatarID: AgentAvatarID;

    /** Called when the user taps "Add" to open the builder pre-filled from this template */
    onAdd: () => void;
};

function AgentTemplateCard({template, avatarID, onAdd}: AgentTemplateCardProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.p5, styles.mb3]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <Avatar
                    source={AGENT_AVATARS.getLocal(avatarID)}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    name={template.name}
                />
                <View style={[styles.flex1, styles.gapHalf]}>
                    <Text style={[styles.textStrong]}>{template.name}</Text>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{translate('newAgentPage.role')}</Text>
                </View>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={onAdd}
                >
                    <Button.Text>{translate('common.add')}</Button.Text>
                </Button>
            </View>
            <Text style={[styles.mt3, styles.textSupporting]}>{template.description}</Text>
        </View>
    );
}

type NewAgentPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.NEW>;

function NewAgentPage({route}: NewAgentPageProps) {
    const policyID = route.params?.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const icons = useMemoizedLazyExpensifyIcons(['Bot']);
    const illustrations = useMemoizedLazyIllustrations(['Lightbulb']);
    const {data: templates, isLoading} = useSuggestedAgents();

    const hasNoTemplates = templates.length === 0;
    const shouldShowLoadingIndicator = isLoading && hasNoTemplates && !isOffline;
    const shouldShowEmptyState = hasNoTemplates && (!isLoading || isOffline);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        getAgentTemplates();
    }, [isOffline]);

    const handleBuildCustomAgent = () => {
        // Start from scratch — drop any previously stashed template, and wait for the clear to land before
        // opening the builder so it can't read a stale template and wrongly pre-fill.
        clearNewAgentTemplate().then(() => {
            Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD.getRoute(policyID ? {policyID} : undefined));
        });
    };

    const handleAddTemplate = (template: SuggestedAgent, avatarID: AgentAvatarID) => {
        // Stash the template in Onyx (persists across refresh), then wait for the write to land before opening
        // the builder so it reads the seed on its first render instead of racing the async Onyx write.
        setNewAgentTemplate({name: template.name, prompt: template.prompt, avatarID}).then(() => {
            Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD.getRoute(policyID ? {policyID} : undefined));
        });
    };

    const buildCustomAgentButton = (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            onPress={handleBuildCustomAgent}
            style={styles.w100}
        >
            <Button.Icon src={icons.Bot} />
            <Button.Text>{translate('newAgentPage.buildCustomAgent')}</Button.Text>
        </Button>
    );

    const templateSectionLabel = <Text style={[styles.textLabelSupporting, styles.mt5, styles.mb3]}>{translate('newAgentPage.orStartWithTemplate')}</Text>;

    // Backend templates don't carry an avatar, so give each card a stable preset by cycling the catalog.
    const orderedAvatarIDs = AGENT_AVATARS.ordered;

    let body: React.ReactNode;
    if (shouldShowLoadingIndicator) {
        body = (
            <View style={[styles.flex1, styles.ph5, styles.pb5]}>
                {buildCustomAgentButton}
                {templateSectionLabel}
                <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        reasonAttributes={{context: 'NewAgentPage'}}
                    />
                </View>
            </View>
        );
    } else if (shouldShowEmptyState) {
        body = (
            <View style={[styles.flex1, styles.ph5, styles.pb5]}>
                {buildCustomAgentButton}
                {templateSectionLabel}
                <View style={styles.flex1}>
                    <BlockingView
                        icon={illustrations.Lightbulb}
                        title={translate('newAgentPage.emptyTemplatesTitle')}
                        subtitle={isOffline ? translate('common.youAppearToBeOffline') : translate('newAgentPage.emptyTemplatesSubtitle')}
                        subtitleStyle={[styles.textSupporting, styles.textNormal]}
                    />
                </View>
            </View>
        );
    } else {
        body = (
            <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                {buildCustomAgentButton}
                {templateSectionLabel}
                {templates.map((template, index) => {
                    const avatarID = orderedAvatarIDs.at(index % orderedAvatarIDs.length)?.id;
                    if (!avatarID) {
                        return null;
                    }
                    return (
                        <AgentTemplateCard
                            key={template.id}
                            template={template}
                            avatarID={avatarID}
                            onAdd={() => handleAddTemplate(template, avatarID)}
                        />
                    );
                })}
            </ScrollView>
        );
    }

    return (
        <ScreenWrapper
            testID={NewAgentPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('newAgentPage.title')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {body}
        </ScreenWrapper>
    );
}

NewAgentPage.displayName = 'NewAgentPage';

export default NewAgentPage;
