import React from 'react';
import {View} from 'react-native';
import type {BlockingViewProps} from '@components/BlockingViews/BlockingView';
import BlockingView from '@components/BlockingViews/BlockingView';
import Icon from '@components/Icon';
import TextBlock from '@components/TextBlock';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsActions, useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import useEmptyLHNIllustration from './useEmptyLHNIllustration';

function LHNEmptyState() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass', 'Plus']);
    const emptyLHNIllustration = useEmptyLHNIllustration();
    const {activeTab} = useSidebarOrderedReportsState();
    const {setActiveTab} = useSidebarOrderedReportsActions();

    if (activeTab === CONST.INBOX_TAB.UNREAD || activeTab === CONST.INBOX_TAB.TODO) {
        const title = activeTab === CONST.INBOX_TAB.UNREAD ? translate('common.emptyLHN.noUnreadChats') : translate('common.emptyLHN.noTodos');

        return (
            <BlockingView
                {...(emptyLHNIllustration as BlockingViewProps)}
                title={title}
                subtitle={translate('common.emptyLHN.caughtUp')}
                subtitleStyle={styles.textSupporting}
                linkTranslationKey="common.emptyLHN.seeAllChats"
                onLinkPress={() => setActiveTab(CONST.INBOX_TAB.ALL)}
                accessibilityLabel={title}
            />
        );
    }

    const subtitle = (
        <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter]}>
            <TextBlock
                color={theme.textSupporting}
                textStyles={[styles.textAlignCenter, styles.textNormal]}
                text={translate('common.emptyLHN.subtitleText1')}
            />
            <Icon
                src={expensifyIcons.MagnifyingGlass}
                width={variables.emptyLHNIconWidth}
                height={variables.emptyLHNIconHeight}
                fill={theme.icon}
                small
                additionalStyles={styles.mh1}
            />
            <TextBlock
                color={theme.textSupporting}
                textStyles={[styles.textAlignCenter, styles.textNormal]}
                text={translate('common.emptyLHN.subtitleText2')}
            />
            <Icon
                src={expensifyIcons.Plus}
                width={variables.emptyLHNIconWidth}
                height={variables.emptyLHNIconHeight}
                fill={theme.icon}
                small
                additionalStyles={styles.mh1}
            />
            <TextBlock
                color={theme.textSupporting}
                textStyles={[styles.textAlignCenter, styles.textNormal]}
                text={translate('common.emptyLHN.subtitleText3')}
            />
        </View>
    );

    return (
        <BlockingView
            {...(emptyLHNIllustration as BlockingViewProps)}
            title={translate('common.emptyLHN.title')}
            CustomSubtitle={subtitle}
            accessibilityLabel={translate('common.emptyLHN.title')}
        />
    );
}

export default LHNEmptyState;
