/** Chart header ⋮ menu for a Compliance chart that lets the user pick whose violations it counts, above the chart's actions. */
import CompactMenuContext from '@components/CompactMenuContext';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import FilterPopupButton from '@components/Search/FilterDropdowns/FilterPopupButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import Tooltip from '@components/Tooltip/PopoverAnchorTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import INSIGHTS_CONTROL_ANCHOR_ALIGNMENT from '@pages/Insights/controls/insightsControls';
import type {InsightsViolationStage} from '@pages/Insights/dashboardSpecs';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {InsightsGraphKey} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React, {useState} from 'react';
import {View} from 'react-native';

type InsightsChartMenuAction = {
    text: string;
    icon: IconAsset;
    sentryLabel: SentryLabel;
    onSelected: () => void;
};

type InsightsChartMenuProps = {
    /** Chart the menu belongs to, used in the trigger's test ID */
    graphKey: InsightsGraphKey;

    /** Stage whose violations the chart counts */
    violationStage: InsightsViolationStage;

    /** Stores the stage the user applies */
    onViolationStageChange: (stage: InsightsViolationStage) => void;

    /** Rows listed under the stage row, such as View on Spend and Download CSV */
    actions: InsightsChartMenuAction[];
};

function InsightsChartMenu({graphKey, violationStage, onViolationStageChange, actions}: InsightsChartMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- matches the icon size Search's Display popup picks for the bottom-docked sheet
    const {isSmallScreenWidth} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['ThreeDots']);
    // The popover keeps its content mounted between openings, so the stage list is closed again each time the menu opens
    const [isPickingStage, setIsPickingStage] = useState(false);

    const stageItems: Array<SingleSelectItem<InsightsViolationStage>> = Object.values(CONST.INSIGHTS.VIOLATION_STAGE).map((stage) => ({
        text: translate(`insightsPage.violationStage.${stage}`),
        value: stage,
    }));
    const selectedStageItem = stageItems.find((item) => item.value === violationStage);
    const stageLabel = translate('insightsPage.violationStage.label');

    const renderPopover = ({closeOverlay}: PopoverComponentProps) => {
        if (isPickingStage) {
            return (
                <SingleSelectPopup
                    label={stageLabel}
                    items={stageItems}
                    value={selectedStageItem}
                    defaultValue={CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED}
                    onBackButtonPress={() => setIsPickingStage(false)}
                    closeOverlay={closeOverlay}
                    onChange={(item) => onViolationStageChange(item?.value ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED)}
                    applySentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_APPLY.VIOLATION_STAGE}
                    resetSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CONTROL_POPUP_RESET.VIOLATION_STAGE}
                />
            );
        }

        return (
            <View style={styles.pv4}>
                <MenuItemField
                    name={stageLabel}
                    value={selectedStageItem?.text}
                    onPress={() => setIsPickingStage(true)}
                    sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CHART_MENU_VIOLATION_STAGE}
                />
                {actions.length > 0 && <View style={[styles.sectionDividerLine, styles.mh4, styles.mv2]} />}
                <CompactMenuContext.Provider value>
                    {actions.map((action) => (
                        <MenuItem.Root
                            key={action.text}
                            onPress={() => {
                                closeOverlay();
                                action.onSelected();
                            }}
                            sentryLabel={action.sentryLabel}
                        >
                            <MenuItem.Row>
                                <MenuItem.Leading>{isSmallScreenWidth ? <MenuItem.Icon src={action.icon} /> : <MenuItem.IconNarrow src={action.icon} />}</MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>{action.text}</MenuItem.Title>
                                </MenuItem.Content>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    ))}
                </CompactMenuContext.Provider>
            </View>
        );
    };

    return (
        <FilterPopupButton
            popoverAnchorAlignment={INSIGHTS_CONTROL_ANCHOR_ALIGNMENT}
            PopoverComponent={renderPopover}
            // Mirrors WidgetHeaderMenu's trigger, since ThreeDotsMenu can only open a PopoverMenu, which has no Reset/Apply sub-view
            renderButton={({ref, onPress}) => (
                <Tooltip text={translate('common.more')}>
                    <PressableWithoutFeedback
                        ref={ref}
                        onPress={() => {
                            setIsPickingStage(false);
                            onPress();
                        }}
                        style={[styles.touchableButtonImage, styles.threeDotsMenuIconWidth, styles.getWidgetHeaderMenuButtonStyle(variables.componentSizeSmall)]}
                        hoverStyle={styles.widgetHeaderMenuButtonHovered}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.more')}
                        sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CHART_MENU}
                        testID={`insightsChartMenu-${graphKey}`}
                    >
                        <Icon
                            src={icons.ThreeDots}
                            fill={theme.icon}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            )}
        />
    );
}

export default InsightsChartMenu;
export type {InsightsChartMenuAction};
