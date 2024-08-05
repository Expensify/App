import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import RNFS from 'react-native-fs';
import Onyx, {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import ClientSideLoggingToolMenu from '@components/ClientSideLoggingToolMenu';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Switch from '@components/Switch';
import TestToolMenu from '@components/TestToolMenu';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {setShouldMaskOnyxState} from '@libs/actions/MaskOnyx';
import ExportOnyxState from '@libs/ExportOnyxState';
import localFileDownload from '@libs/localFileDownload';
import Navigation from '@libs/Navigation/Navigation';
import * as App from '@userActions/App';
import * as Network from '@userActions/Network';
import * as Report from '@userActions/Report';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import getLightbulbIllustrationStyle from './getLightbulbIllustrationStyle';

// List of Onyx keys from the .txt file we want to keep for the local override
const keysToInclude = [
    ONYXKEYS.COLLECTION.REPORT,
    ONYXKEYS.COLLECTION.REPORT_METADATA,
    ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    ONYXKEYS.COLLECTION.REPORT_VIOLATIONS,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES,
    ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
    ONYXKEYS.COLLECTION.TRANSACTION,
    ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    ONYXKEYS.COLLECTION.POLICY,
    ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
    ONYXKEYS.COLLECTION.POLICY_TAGS,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS,
    ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES,
    ONYXKEYS.PERSONAL_DETAILS_LIST,
    ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    ONYXKEYS.ACCOUNT,
    ONYXKEYS.SESSION,
    ONYXKEYS.WALLET_TRANSFER,
    ONYXKEYS.LOGIN_LIST,
    ONYXKEYS.USER,
    ONYXKEYS.USER_WALLET,
    ONYXKEYS.USER_METADATA,
    ONYXKEYS.IS_LOADING_REPORT_DATA,
    'nvp_',
];

type BaseMenuItem = {
    translationKey: TranslationPaths;
    icon: React.FC<SvgProps>;
    action: () => void | Promise<void>;
};

type TroubleshootPageOnyxProps = {
    shouldStoreLogs: OnyxEntry<boolean>;
    shouldMaskOnyxState: boolean;
};

type TroubleshootPageProps = TroubleshootPageOnyxProps;

Network.setShouldForceOffline(false);

function TroubleshootPage({shouldStoreLogs, shouldMaskOnyxState}: TroubleshootPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrationStyle = getLightbulbIllustrationStyle();

    const exportOnyxState = useCallback(() => {
        ExportOnyxState.readFromOnyxDatabase().then((value: Record<string, unknown>) => {
            let dataToShare = value;
            if (shouldMaskOnyxState) {
                dataToShare = ExportOnyxState.maskFragileData(value);
            }

            ExportOnyxState.shareAsFile(JSON.stringify(dataToShare));
        });
    }, [shouldMaskOnyxState]);

    const menuItems = useMemo(() => {
        const debugConsoleItem: BaseMenuItem = {
            translationKey: 'initialSettingsPage.troubleshoot.viewConsole',
            icon: Expensicons.Gear,
            action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_CONSOLE.getRoute(ROUTES.SETTINGS_TROUBLESHOOT))),
        };

        const baseMenuItems: BaseMenuItem[] = [
            {
                translationKey: 'initialSettingsPage.troubleshoot.clearCacheAndRestart',
                icon: Expensicons.RotateLeft,
                action: () => setIsConfirmationModalVisible(true),
            },
            {
                translationKey: 'initialSettingsPage.troubleshoot.exportOnyxState',
                icon: Expensicons.Download,
                action: exportOnyxState,
            },
        ];

        if (shouldStoreLogs) {
            baseMenuItems.push(debugConsoleItem);
        }

        return baseMenuItems
            .map((item) => ({
                key: item.translationKey,
                title: translate(item.translationKey),
                icon: item.icon,
                onPress: item.action,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
            }))
            .reverse();
    }, [waitForNavigate, exportOnyxState, shouldStoreLogs, translate, styles.sectionMenuItemTopDescription]);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={TroubleshootPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                shouldShowBackButton={shouldUseNarrowLayout}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                icon={Illustrations.Lightbulb}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                        subtitle={translate('initialSettingsPage.troubleshoot.description')}
                        isCentralPane
                        subtitleMuted
                        illustration={LottieAnimations.Desk}
                        illustrationStyle={illustrationStyle}
                        titleStyles={styles.accountSettingsSectionTitle}
                        renderSubtitle={() => (
                            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('initialSettingsPage.troubleshoot.description')}</Text>{' '}
                                <TextLink
                                    style={styles.link}
                                    onPress={() => Report.navigateToConciergeChat()}
                                >
                                    {translate('initialSettingsPage.troubleshoot.submitBug')}
                                </TextLink>
                                .
                            </Text>
                        )}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <View>
                                <AttachmentPicker>
                                    {({openPicker}) => {
                                        return (
                                            <Button
                                                text={translate('initialSettingsPage.troubleshoot.importOnyxState')}
                                                onPress={() => {
                                                    // TODO should directly use 'react-native-document-picker'
                                                    openPicker({
                                                        onPicked: (file) => {
                                                            if (!file.uri) {
                                                                return;
                                                            }

                                                            // 1. Read the file content
                                                            RNFS.readFile(file.uri).then((fileContent) => {
                                                                const importedState = JSON.parse(fileContent);
                                                                // TODO: this needs to be exactly the same as we get from running the App.openApp command?
                                                                const parsedState = Object.assign({}, importedState);

                                                                // 2. Only keep the keys that we're interested in
                                                                Object.keys(parsedState).forEach((key) => {
                                                                    const shouldStay = keysToInclude.some((onyxKey) => key.startsWith(onyxKey));

                                                                    if (shouldStay) {
                                                                        return;
                                                                    }

                                                                    delete parsedState[key];
                                                                });

                                                                // App.openApp();

                                                                // 3. Go offline
                                                                Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline: true}).then(() => {
                                                                    // Onyx.clear(App.KEYS_TO_PRESERVE).then(() => {

                                                                    // 4. Apply the new state from the file
                                                                    Onyx.multiSet(parsedState).then(() => {
                                                                        console.log('Applied imported state.');
                                                                        Navigation.navigate(ROUTES.HOME);
                                                                    });
                                                                    // });
                                                                });
                                                            });
                                                        },
                                                    });
                                                }}
                                            />
                                        );
                                    }}
                                </AttachmentPicker>
                            </View>
                            <View>
                                <ClientSideLoggingToolMenu />
                                <TestToolRow title={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')}>
                                    <Switch
                                        accessibilityLabel={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')}
                                        isOn={shouldMaskOnyxState}
                                        onToggle={setShouldMaskOnyxState}
                                    />
                                </TestToolRow>
                            </View>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                            {!isProduction && (
                                <View style={[styles.mt6]}>
                                    <TestToolMenu />
                                </View>
                            )}
                            <ConfirmModal
                                title={translate('common.areYouSure')}
                                isVisible={isConfirmationModalVisible}
                                onConfirm={() => {
                                    setIsConfirmationModalVisible(false);
                                    Onyx.clear(App.KEYS_TO_PRESERVE).then(() => {
                                        App.openApp();
                                    });
                                }}
                                onCancel={() => setIsConfirmationModalVisible(false)}
                                prompt={translate('initialSettingsPage.troubleshoot.confirmResetDescription')}
                                confirmText={translate('initialSettingsPage.troubleshoot.resetAndRefresh')}
                                cancelText={translate('common.cancel')}
                            />
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

TroubleshootPage.displayName = 'TroubleshootPage';

export default withOnyx<TroubleshootPageProps, TroubleshootPageOnyxProps>({
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
    shouldMaskOnyxState: {
        key: ONYXKEYS.SHOULD_MASK_ONYX_STATE,
        selector: (shouldMaskOnyxState) => shouldMaskOnyxState ?? true,
    },
})(TroubleshootPage);
