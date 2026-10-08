import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import AgentsTable from '@components/Tables/AgentsTable';

import useAgents from '@hooks/useAgents';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import {View} from 'react-native';

function AgentsPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {pageGutter} = useLayoutSpacing();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();
    const selectionModeHeader = isMobileSelectionModeEnabled && shouldUseNarrowLayout;
    const icons = useMemoizedLazyExpensifyIcons(['Plus', 'Trashcan']);
    const {agents, selectedAgentKeys, setSelectedAgents, clearSelectedAgents, askForConfirmationToDelete, tableRef} = useAgents();
    const hasAgents = agents.length > 0;
    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;
    const shouldShowBulkActionsButton = shouldUseNarrowLayout ? canSelectMultiple : selectedAgentKeys.length > 0;

    useDocumentTitle(translate('agentsPage.title'));

    const newAgentButton = (
        <Button
            variant="success"
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_AGENTS_NEW.getRoute())}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('agentsPage.newAgent')}</Button.Text>
        </Button>
    );

    const bulkActionsButtonOptions: Array<DropdownOption<DeepValueOf<typeof CONST.AGENTS.BULK_ACTION_TYPES>>> = [
        {
            text: translate('agentsPage.deleteAgentsTitle', {count: selectedAgentKeys.length}),
            value: CONST.AGENTS.BULK_ACTION_TYPES.DELETE,
            icon: icons.Trashcan,
            shouldSkipFocusRestore: true,
            onSelected: askForConfirmationToDelete,
        },
    ];

    const headerButtons = shouldShowBulkActionsButton ? (
        <ButtonWithDropdownMenu<DeepValueOf<typeof CONST.AGENTS.BULK_ACTION_TYPES>>
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            shouldAlwaysShowDropdownMenu
            customText={translate('workspace.common.selected', {count: selectedAgentKeys.length})}
            size={CONST.BUTTON_SIZE.MEDIUM}
            onPress={() => null}
            options={bulkActionsButtonOptions}
            isSplitButton={false}
            isDisabled={!selectedAgentKeys.length}
        />
    ) : (
        newAgentButton
    );

    const agentsTableHeaderComponent = (
        <>
            {shouldDisplayButtonsInSeparateLine && <View style={[pageGutter, styles.pb3]}>{headerButtons}</View>}
            {hasAgents && (
                <View style={[styles.renderHTML, styles.flexRow, styles.w100, styles.ph5, styles.pb5, styles.pt3]}>
                    <RenderHTML html={translate('agentsPage.subtitle')} />
                </View>
            )}
        </>
    );

    const headerContent = shouldDisplayButtonsInSeparateLine ? undefined : headerButtons;

    const onBackButtonPress = () => {
        if (isMobileSelectionModeEnabled) {
            clearSelectedAgents();
            turnOffMobileSelectionMode();
            return;
        }
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            style={[styles.defaultModalContainer]}
            testID={AgentsPage.displayName}
            shouldShowOfflineIndicatorInWideScreen
            shouldMobileOfflineIndicatorStickToBottom={false}
            offlineIndicatorStyle={styles.mtAuto}
        >
            <CollapsibleHeaderOnKeyboard>
                <HeaderWithBackButton
                    onBackButtonPress={onBackButtonPress}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    shouldDisplaySearchRouter
                    shouldDisplayHelpButton
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('agentsPage.title')}
                >
                    {headerContent}
                </HeaderWithBackButton>
            </CollapsibleHeaderOnKeyboard>
            <AgentsTable
                ref={tableRef}
                agents={agents}
                headerComponent={agentsTableHeaderComponent}
                canSelectAgents
                selectedKeys={selectedAgentKeys}
                onRowSelectionChange={setSelectedAgents}
            />
        </ScreenWrapper>
    );
}

AgentsPage.displayName = 'AgentsPage';

export default AgentsPage;
