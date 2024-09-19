import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {format} from 'date-fns';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ListRenderItem, ListRenderItemInfo} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import InvertedFlatList from '@components/InvertedFlatList';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {addLog} from '@libs/actions/Console';
import {createLog, parseStringifiedMessages, sanitizeConsoleInput} from '@libs/Console';
import type {Log} from '@libs/Console';
import localFileCreate from '@libs/localFileCreate';
import localFileDownload from '@libs/localFileDownload';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CapturedLogs} from '@src/types/onyx';

type ConsolePageOnyxProps = {
    /** Logs captured on the current device */
    capturedLogs: OnyxEntry<CapturedLogs>;

    /** Whether or not logs should be stored */
    shouldStoreLogs: OnyxEntry<boolean>;
};

type ConsolePageProps = ConsolePageOnyxProps;

const filterBy = {
    all: '',
    network: '[Network]',
} as const;
type FilterBy = (typeof filterBy)[keyof typeof filterBy];

function ConsolePage({capturedLogs, shouldStoreLogs}: ConsolePageProps) {
    const [input, setInput] = useState('');
    const [isGeneratingLogsFile, setIsGeneratingLogsFile] = useState(false);
    const [isLimitModalVisible, setIsLimitModalVisible] = useState(false);
    const [activeFilterIndex, setActiveFilterIndex] = useState<FilterBy>(filterBy.all);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {windowWidth} = useWindowDimensions();
    const route = useRoute<RouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.CONSOLE>>();

    const menuItems: PopoverMenuItem[] = useMemo(
        () => [
            {
                text: translate('common.filterLogs'),
                disabled: true,
            },
            {
                icon: Expensicons.All,
                text: translate('common.all'),
                iconFill: activeFilterIndex === filterBy.all ? theme.iconSuccessFill : theme.icon,
                iconRight: Expensicons.Checkmark,
                shouldShowRightIcon: activeFilterIndex === filterBy.all,
                success: activeFilterIndex === filterBy.all,
                onSelected: () => {
                    setActiveFilterIndex(filterBy.all);
                },
            },
            {
                icon: Expensicons.Globe,
                text: translate('common.network'),
                iconFill: activeFilterIndex === filterBy.network ? theme.iconSuccessFill : theme.icon,
                iconRight: Expensicons.CheckCircle,
                shouldShowRightIcon: activeFilterIndex === filterBy.network,
                success: activeFilterIndex === filterBy.network,
                onSelected: () => {
                    setActiveFilterIndex(filterBy.network);
                },
            },
        ],
        [activeFilterIndex, theme.icon, theme.iconSuccessFill, translate],
    );

    const prevLogs = useRef<OnyxEntry<CapturedLogs>>({});
    const getLogs = useCallback(() => {
        if (!shouldStoreLogs) {
            return [];
        }

        prevLogs.current = {...prevLogs.current, ...capturedLogs};
        return Object.entries(prevLogs.current ?? {})
            .map(([key, value]) => ({key, ...value}))
            .reverse();
    }, [capturedLogs, shouldStoreLogs]);

    const logsList = useMemo(() => getLogs(), [getLogs]);

    const filteredLogsList = useMemo(() => logsList.filter((log) => log.message.includes(activeFilterIndex)), [activeFilterIndex, logsList]);

    const executeArbitraryCode = () => {
        const sanitizedInput = sanitizeConsoleInput(input);

        const output = createLog(sanitizedInput);
        output.forEach((log) => addLog(log));
        setInput('');
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ENTER, executeArbitraryCode);

    const saveLogs = () => {
        const logsWithParsedMessages = parseStringifiedMessages(filteredLogsList);

        localFileDownload('logs', JSON.stringify(logsWithParsedMessages, null, 2));
    };

    const shareLogs = () => {
        setIsGeneratingLogsFile(true);
        const logsWithParsedMessages = parseStringifiedMessages(filteredLogsList);

        // Generate a file with the logs and pass its path to the list of reports to share it with
        localFileCreate('logs', JSON.stringify(logsWithParsedMessages, null, 2)).then(({path, size}) => {
            setIsGeneratingLogsFile(false);

            // if the file size is too large to send it as an attachment, show a modal and return
            if (size > CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                setIsLimitModalVisible(true);

                return;
            }

            Navigation.navigate(ROUTES.SETTINGS_SHARE_LOG.getRoute(path));
        });
    };

    const renderItem: ListRenderItem<Log> = useCallback(
        ({item}: ListRenderItemInfo<Log>) => {
            if (!item) {
                return null;
            }

            return (
                <View style={styles.mb2}>
                    <Text family="MONOSPACE">{`${format(new Date(item.time), CONST.DATE.FNS_DB_FORMAT_STRING)} ${item.message}`}</Text>
                </View>
            );
        },
        [styles.mb2],
    );

    return (
        <ScreenWrapper testID={ConsolePage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.debugConsole')}
                onBackButtonPress={() => Navigation.goBack(route.params?.backTo)}
                shouldShowThreeDotsButton
                threeDotsMenuItems={menuItems}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffset(windowWidth)}
                threeDotsMenuIcon={Expensicons.Filter}
                threeDotsMenuIconFill={theme.icon}
            />
            <View style={[styles.border, styles.highlightBG, styles.borderNone, styles.mh5, styles.flex1]}>
                <InvertedFlatList
                    data={filteredLogsList}
                    renderItem={renderItem}
                    contentContainerStyle={styles.p5}
                    ListEmptyComponent={<Text>{translate('initialSettingsPage.debugConsole.noLogsAvailable')}</Text>}
                />
            </View>
            <View style={[styles.dFlex, styles.flexRow, styles.m5]}>
                <Button
                    text={translate('initialSettingsPage.debugConsole.saveLog')}
                    onPress={saveLogs}
                    large
                    icon={Expensicons.Download}
                    style={[styles.flex1, styles.mr1]}
                />
                <Button
                    text={translate('initialSettingsPage.debugConsole.shareLog')}
                    onPress={shareLogs}
                    large
                    icon={!isGeneratingLogsFile ? Expensicons.UploadAlt : undefined}
                    style={[styles.flex1, styles.ml1]}
                    isLoading={isGeneratingLogsFile}
                />
            </View>
            <View style={[styles.mh5]}>
                <TextInput
                    onChangeText={setInput}
                    value={input}
                    placeholder={translate('initialSettingsPage.debugConsole.enterCommand')}
                    autoGrowHeight
                    autoCorrect={false}
                    accessibilityRole="text"
                />
                <Button
                    success
                    text={translate('initialSettingsPage.debugConsole.execute')}
                    onPress={executeArbitraryCode}
                    style={[styles.mv5]}
                    large
                />
            </View>
            <ConfirmModal
                title={translate('initialSettingsPage.debugConsole.shareLog')}
                isVisible={isLimitModalVisible}
                onConfirm={() => setIsLimitModalVisible(false)}
                onCancel={() => setIsLimitModalVisible(false)}
                prompt={translate('initialSettingsPage.debugConsole.logSizeTooLarge', {
                    size: CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE / 1024 / 1024,
                })}
                shouldShowCancelButton={false}
                confirmText={translate('common.ok')}
            />
        </ScreenWrapper>
    );
}

ConsolePage.displayName = 'ConsolePage';

export default withOnyx<ConsolePageProps, ConsolePageOnyxProps>({
    capturedLogs: {
        key: ONYXKEYS.LOGS,
    },
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(ConsolePage);
