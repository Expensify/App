/**
 * Popover limit-type picker for inline editing an Expensify card from the workspace cards table.
 */
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {shouldShowExpensifyCardFixedLimitType} from '@libs/CardUtils';
import {canMemberRead, getApprovalWorkflow} from '@libs/PolicyUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, Policy} from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';

import type {OnyxEntry} from 'react-native-onyx';

import {emailSelector} from '@selectors/Session';
import React, {useRef} from 'react';
import {View} from 'react-native';

import type PopoverWithMeasuredContentProps from './PopoverWithMeasuredContent/types';
import type {ListItem} from './SelectionList/types';

import Icon from './Icon';
import PopoverWithMeasuredContent from './PopoverWithMeasuredContent';
import RenderHTML from './RenderHTML';
import SelectionList from './SelectionList';
import SingleSelectListItem from './SelectionList/ListItem/SingleSelectListItem';

const DEFAULT_ANCHOR_ALIGNMENT = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};

type LimitTypeListItem = ListItem<CardLimitType> & {
    value: CardLimitType;
};

type WorkspaceExpensifyCardLimitTypePickerModalProps = {
    /** Callback to close the modal */
    onClose: () => void;

    /** The policy whose approval workflow gates the Smart Limit option */
    policy: OnyxEntry<Policy>;

    /** The card whose limit type is being edited */
    card: Card;

    /** Currently selected limit type */
    selectedLimitType?: CardLimitType;

    /** Called when the user confirms a limit type selection */
    onSelected?: (limitType: CardLimitType) => void;
} & Omit<PopoverWithMeasuredContentProps, 'anchorRef' | 'children' | 'onClose'>;

function WorkspaceExpensifyCardLimitTypePickerModal({
    isVisible,
    onClose,
    anchorPosition,
    policy,
    card,
    selectedLimitType,
    onSelected,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    shouldMeasureAnchorPositionFromTop = false,
}: WorkspaceExpensifyCardLimitTypePickerModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {isInLandscapeMode} = useResponsiveLayout();
    const {environmentURL} = useEnvironment();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Lock']);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const anchorRef = useRef<View>(null);

    const areApprovalsConfigured = getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const canReadWorkflows = canMemberRead(policy, currentUserLogin ?? '', CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
    const workspaceWorkflowsPageURL = canReadWorkflows ? `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy?.id)}` : undefined;
    const shouldShowFixedOption = shouldShowExpensifyCardFixedLimitType(card);

    const availableLimitTypeItems: LimitTypeListItem[] = [
        {
            value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            text: translate('workspace.card.issueNewCard.smartLimit'),
            alternateText: areApprovalsConfigured ? translate('workspace.card.issueNewCard.smartLimitDescription') : undefined,
            alternateTextComponent: areApprovalsConfigured ? undefined : (
                <RenderHTML html={translate('workspace.card.issueNewCard.smartLimitDisabledDescription', workspaceWorkflowsPageURL)} />
            ),
            rightElement: areApprovalsConfigured ? undefined : (
                <Icon
                    src={expensifyIcons.Lock}
                    fill={theme.icon}
                />
            ),
            shouldHideSelectionButton: !areApprovalsConfigured,
            keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            isSelected: selectedLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            isDisabled: !areApprovalsConfigured,
            titleStyles: areApprovalsConfigured ? undefined : {color: theme.heading},
        },
        {
            value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            text: translate('workspace.card.issueNewCard.monthly'),
            alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
            keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            isSelected: selectedLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
        },
        ...(shouldShowFixedOption
            ? [
                  {
                      value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                      text: translate('workspace.card.issueNewCard.fixedAmount'),
                      alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                      keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                      isSelected: selectedLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                  } satisfies LimitTypeListItem,
              ]
            : []),
        ...(card.nameValuePairs?.isVirtual
            ? [
                  {
                      value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
                      text: translate('workspace.card.issueNewCard.singleUse'),
                      alternateText: translate('workspace.card.issueNewCard.singleUseDescription'),
                      keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
                      isSelected: selectedLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SINGLE_USE,
                  } satisfies LimitTypeListItem,
              ]
            : []),
    ];

    const selectLimitType = (item: LimitTypeListItem) => {
        onSelected?.(item.value);
        onClose();
    };

    const popoverHeight = styles.getSelectionListPopoverHeight({
        itemCount: availableLimitTypeItems.length || 1,
        itemHeight: variables.optionRowHeight,
        windowHeight,
        isInLandscapeMode,
        hasButton: false,
        // Top padding plus one extra line so a wrapping Smart Limit description is not clipped.
        extraHeight: styles.pt4.paddingTop + variables.lineHeightNormal,
    }).height;

    return (
        <PopoverWithMeasuredContent
            anchorRef={anchorRef}
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            popoverDimensions={{
                width: CONST.POPOVER_DROPDOWN_WIDTH,
                height: popoverHeight,
            }}
            anchorAlignment={anchorAlignment}
            innerContainerStyle={StyleUtils.getWidthStyle(CONST.POPOVER_DROPDOWN_WIDTH)}
            restoreFocusType={CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE}
            shouldSwitchPositionIfOverflow
            shouldEnableNewFocusManagement
            shouldMeasureAnchorPositionFromTop={shouldMeasureAnchorPositionFromTop}
            shouldSkipRemeasurement
            shouldDisplayBelowModals
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={[StyleUtils.getHeight(popoverHeight), styles.flexColumn, styles.pt4]}>
                <SelectionList
                    data={availableLimitTypeItems}
                    ListItem={SingleSelectListItem}
                    onSelectRow={selectLimitType}
                    shouldSingleExecuteRowSelect
                    shouldStopPropagation
                    initiallyFocusedItemKey={availableLimitTypeItems.find((item) => item.isSelected)?.keyForList}
                    alternateNumberOfSupportedLines={2}
                    style={{contentContainerStyle: [styles.pb0]}}
                />
            </View>
        </PopoverWithMeasuredContent>
    );
}

export default WorkspaceExpensifyCardLimitTypePickerModal;
