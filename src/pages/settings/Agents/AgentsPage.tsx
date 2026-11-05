import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import HeaderCentralPane from '@components/Header/composed/HeaderCentralPane';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import AgentsTable from '@components/Tables/AgentsTable';

import useAgentsTable from '@hooks/useAgentsTable';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useThemeStyles from '@hooks/useThemeStyles';

import {openAgentsPage} from '@libs/actions/Agent';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import {useEffect} from 'react';
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
    const {agents, selectedAgentKeys, setSelectedAgents, clearSelectedAgents, askForConfirmationToDelete, tableRef} = useAgentsTable();
    const hasAgents = agents.length > 0;
    const canSelectMultiple = shouldUseNarrowLayout ? isMobileSelectionModeEnabled : true;
    const shouldShowBulkActionsButton = shouldUseNarrowLayout ? canSelectMultiple : selectedAgentKeys.length > 0;

    useDocumentTitle(translate('agentsPage.title'));
    useEffect(() => openAgentsPage(), []);

    const newAgentButton = hasAgents ? (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AGENT_NEW.getRoute()))}
        >
            <Button.Icon src={icons.Plus} />
            <Button.Text>{translate('agentsPage.newAgent')}</Button.Text>
        </Button>
    ) : null;
    const emptyStateButtons = [
        {
            icon: icons.Plus,
            buttonText: translate('agentsPage.newAgent'),
            buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
            buttonAction: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.AGENT_NEW.getRoute())),
        },
    ];

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

    const goBackOrClearSelection = () => {
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
                <HeaderCentralPane
                    onBackButtonPress={goBackOrClearSelection}
                    isHeadline={!selectionModeHeader}
                    title={selectionModeHeader ? translate('common.selectMultiple') : translate('agentsPage.title')}
                    shouldDisplaySearchRouter
                >
                    {!shouldDisplayButtonsInSeparateLine && headerButtons}
                </HeaderCentralPane>
            </CollapsibleHeaderOnKeyboard>
            <AgentsTable
                ref={tableRef}
                agents={agents}
                headerComponent={agentsTableHeaderComponent}
                canSelectAgents
                selectedKeys={selectedAgentKeys}
                onRowSelectionChange={setSelectedAgents}
                shouldShowOwnerColumn
                emptyStateButtons={emptyStateButtons}
            />
        </ScreenWrapper>
    );
}

AgentsPage.displayName = 'AgentsPage';

export default AgentsPage;
