import useAnchoredInfoPopover from '@hooks/useAnchoredInfoPopover';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React, {createContext, useContext, useState} from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import Popover from './Popover';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type WorkspaceCardLabelProps = {
    /** Translated label shown in the header and as the popover title */
    title: string;

    /** Translated description shown in the popover body */
    description: string;

    /** Formatted value shown as the headline */
    displayValue: string;

    /** Optional style applied to the value headline */
    valueStyle?: StyleProp<TextStyle>;

    /** Optional content rendered to the right of the value (e.g. a settle balance button) */
    valueAccessory?: ReactNode;

    /** Optional content rendered below the header and value block (e.g. a settle date hint) */
    footer?: ReactNode;

    /** Optional content rendered inside the popover below the description. Consume `useWorkspaceCardLabelPopover` to close the popover from here. */
    children?: ReactNode;

    /** Additional style props applied to the header row */
    style?: StyleProp<ViewStyle>;

    /** Style applied to the outer container (e.g. `styles.flex1` to evenly distribute multiple labels across a row) */
    containerStyle?: StyleProp<ViewStyle>;
};

type WorkspaceCardLabelPopoverContextValue = {
    /** Closes the label's info popover */
    closePopover: () => void;
};

const WorkspaceCardLabelPopoverContext = createContext<WorkspaceCardLabelPopoverContextValue>({closePopover: () => {}});

/** Gives popover children (passed to `WorkspaceCardLabel`) access to close the popover. */
function useWorkspaceCardLabelPopover() {
    return useContext(WorkspaceCardLabelPopoverContext);
}

/**
 * Header + value + info tooltip used to surface a single card statistic (e.g. current balance, remaining limit).
 * Shared between the Expensify Card and company card balance sections so the tooltip/anchor logic lives in one place.
 */
function WorkspaceCardLabel({title, description, displayValue, valueStyle, valueAccessory, footer, children, style, containerStyle}: WorkspaceCardLabelProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    const [isVisible, setVisible] = useState(false);
    const {anchorRef, anchorPosition, contentPaddingStyle, outerStyle, innerContainerStyle} = useAnchoredInfoPopover(isVisible);

    // eslint-disable-next-line react/jsx-no-constructed-context-values -- React Compiler memoizes this, no manual useMemo needed
    const popoverContextValue: WorkspaceCardLabelPopoverContextValue = {closePopover: () => setVisible(false)};

    return (
        <View style={containerStyle}>
            <View style={styles.flex1}>
                <View
                    ref={anchorRef}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.mb1, style]}
                >
                    <Text style={[styles.mutedNormalTextLabel, styles.mr1]}>{title}</Text>
                    <PressableWithFeedback
                        accessibilityLabel={title}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        onPress={() => setVisible(true)}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE_CARDS_LIST.INFO_BUTTON}
                    >
                        <Icon
                            src={icons.Info}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                            fill={theme.icon}
                        />
                    </PressableWithFeedback>
                </View>
                <View style={[styles.flexRow, styles.flexWrap]}>
                    <Text style={[styles.shortTermsHeadline, valueStyle]}>{displayValue}</Text>
                    {valueAccessory}
                </View>
            </View>
            {footer}
            <Popover
                onClose={() => setVisible(false)}
                isVisible={isVisible}
                outerStyle={outerStyle}
                innerContainerStyle={innerContainerStyle}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <View style={contentPaddingStyle}>
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.textStrong, styles.mb2]}
                    >
                        {title}
                    </Text>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{description}</Text>
                    <WorkspaceCardLabelPopoverContext.Provider value={popoverContextValue}>{children}</WorkspaceCardLabelPopoverContext.Provider>
                </View>
            </Popover>
        </View>
    );
}

WorkspaceCardLabel.displayName = 'WorkspaceCardLabel';

export default WorkspaceCardLabel;
export {useWorkspaceCardLabelPopover};
