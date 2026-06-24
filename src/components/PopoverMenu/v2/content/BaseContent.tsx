import React, {useId} from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import FloatingHost from '@components/Overlay/FloatingHost';
import {useRoot} from '@components/PopoverMenu/v2/root/RootContext';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import MenuTree from './MenuTree';
import type {MenuTreeController} from './MenuTree';

type BasePopoverProps = {
    children: ReactNode;
    anchorAlignment?: AnchorAlignment;
    containerStyles?: StyleProp<ViewStyle>;
    onExitComplete?: () => void;
    testID?: string;
};

type BaseContentProps = BasePopoverProps & {
    componentName: string;
    controller: MenuTreeController;
    maxHeightStyle?: ViewStyle;
    innerStyle?: StyleProp<ViewStyle>;
};

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

function BaseContent({
    children,
    componentName,
    controller,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    containerStyles,
    onExitComplete,
    testID,
    maxHeightStyle,
    innerStyle,
}: BaseContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    const {state, meta} = useRoot(componentName);
    const {isOpen, activeAnchor} = state;
    const {triggerID, contentID} = meta;
    const stackId = useId();

    if (!activeAnchor) {
        return null;
    }

    return (
        <FloatingHost
            isOpen={isOpen}
            anchor={activeAnchor.node}
            anchorRect={activeAnchor.rect}
            alignment={anchorAlignment}
            onDismiss={controller.actions.close}
            onExitComplete={onExitComplete}
            surfaceStyle={styles.popoverSurface}
            stackId={stackId}
            containFocus
        >
            <MenuTree
                controller={controller}
                contentID={contentID}
                triggerID={triggerID}
                testID={testID}
                innerStyle={[styles.compactPopoverMenuContentWidth, maxHeightStyle, innerStyle]}
                containerStyles={containerStyles}
            >
                {children}
            </MenuTree>
        </FloatingHost>
    );
}

export default BaseContent;
export type {BasePopoverProps};
