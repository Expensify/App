import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

function PolicyAccountingPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const waitForNavigate = useWaitForNavigation();
    const {isSmallScreenWidth} = useWindowDimensions();

    const menuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'workspace.accounting.qbo',
                icon: Expensicons.Shield,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_2FA.getRoute())),
            },
        ];

        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey as TranslationPaths),
            icon: item.icon,
            onPress: item.action,
            shouldShowRightIcon: false,

            link: '',
            shouldShowRightComponent: true,
            rightComponent: (
                <Button
                    onPress={() => {}}
                    style={[styles.pl2]}
                    text={translate('workspace.accounting.setup')}
                    small
                />
            ),
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }));
    }, [translate, waitForNavigate, styles]);

    return (
        <ScreenWrapper
            testID={PolicyAccountingPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('workspace.common.accounting')}
                shouldShowBackButton={isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack()}
                icon={Illustrations.Accounting}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('workspace.accounting.title')}
                        subtitle={translate('workspace.accounting.subtitle')}
                        isCentralPane
                        subtitleMuted
                        titleStyles={styles.accountSettingsSectionTitle}
                        childrenStyles={styles.pt5}
                    >
                        <MenuItemList
                            menuItems={menuItems}
                            shouldUseSingleExecution
                        />
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

PolicyAccountingPage.displayName = 'PolicyAccountingPage';

export default PolicyAccountingPage;
