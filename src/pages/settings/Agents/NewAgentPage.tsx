import Avatar from '@components/Avatar';
import Button from '@components/ButtonComposed';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {AGENT_AVATARS} from '@libs/Avatars/AgentAvatarCatalog';
import type {AgentAvatarID} from '@libs/Avatars/AgentAvatarCatalog';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {clearNewAgentTemplate, setNewAgentTemplate} from '@userActions/Agent';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

type AgentTemplate = {
    /** Stable identifier, matches the translation key under `newAgentPage.templates` */
    id: string;

    /** Preset avatar shown on the template card and copied onto the created agent */
    avatarID: AgentAvatarID;

    /** Localized display name of the agent */
    name: string;

    /** Short description of what the agent does, shown on the card */
    description: string;

    /** Instructions used to seed the agent when the template is added */
    prompt: string;
};

type AgentTemplateCardProps = {
    /** The template to render */
    template: AgentTemplate;

    /** Called when the user taps "Add" to create an agent from this template */
    onAdd: () => void;
};

function AgentTemplateCard({template, onAdd}: AgentTemplateCardProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.p5, styles.mb3]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <Avatar
                    source={AGENT_AVATARS.getLocal(template.avatarID)}
                    type={CONST.ICON_TYPE_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                    name={template.name}
                />
                <View style={[styles.flex1]}>
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
    const icons = useMemoizedLazyExpensifyIcons(['Bot']);

    const templates: AgentTemplate[] = [
        {
            id: 'cheapskateCharlie',
            avatarID: 'bot-avatar--blue',
            name: translate('newAgentPage.templates.cheapskateCharlie.name'),
            description: translate('newAgentPage.templates.cheapskateCharlie.description'),
            prompt: translate('newAgentPage.templates.cheapskateCharlie.prompt'),
        },
        {
            id: 'enforcerEliza',
            avatarID: 'bot-avatar--ice',
            name: translate('newAgentPage.templates.enforcerEliza.name'),
            description: translate('newAgentPage.templates.enforcerEliza.description'),
            prompt: translate('newAgentPage.templates.enforcerEliza.prompt'),
        },
        {
            id: 'reductionRob',
            avatarID: 'bot-avatar--tangerine',
            name: translate('newAgentPage.templates.reductionRob.name'),
            description: translate('newAgentPage.templates.reductionRob.description'),
            prompt: translate('newAgentPage.templates.reductionRob.prompt'),
        },
        {
            id: 'funTimeFiona',
            avatarID: 'bot-avatar--green',
            name: translate('newAgentPage.templates.funTimeFiona.name'),
            description: translate('newAgentPage.templates.funTimeFiona.description'),
            prompt: translate('newAgentPage.templates.funTimeFiona.prompt'),
        },
    ];

    const handleBuildCustomAgent = () => {
        // Start from scratch — drop any previously stashed template, and wait for the clear to land before
        // opening the builder so it can't read a stale template and wrongly pre-fill.
        clearNewAgentTemplate().then(() => {
            Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD.getRoute(policyID ? {policyID} : undefined));
        });
    };

    const handleAddTemplate = (template: AgentTemplate) => {
        // Stash the template in Onyx (persists across refresh), then wait for the write to land before opening
        // the builder so it reads the seed on its first render instead of racing the async Onyx write.
        setNewAgentTemplate({name: template.name, prompt: template.prompt, avatarID: template.avatarID}).then(() => {
            Navigation.navigate(ROUTES.SETTINGS_AGENTS_ADD.getRoute(policyID ? {policyID} : undefined));
        });
    };

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
            <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={handleBuildCustomAgent}
                    style={styles.w100}
                >
                    <Button.Icon src={icons.Bot} />
                    <Button.Text>{translate('newAgentPage.buildCustomAgent')}</Button.Text>
                </Button>
                <Text style={[styles.textLabelSupporting, styles.mt5, styles.mb3]}>{translate('newAgentPage.orStartWithTemplate')}</Text>
                {templates.map((template) => (
                    <AgentTemplateCard
                        key={template.id}
                        template={template}
                        onAdd={() => handleAddTemplate(template)}
                    />
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

NewAgentPage.displayName = 'NewAgentPage';

export default NewAgentPage;
