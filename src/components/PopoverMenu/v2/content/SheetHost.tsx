import React from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {BottomDockedModal} from '@components/Modal/v2/variants';
import useThemeStyles from '@hooks/useThemeStyles';
import MenuTree from './MenuTree';
import type {MenuTreeController} from './MenuTree';

type SheetHostProps = {
    isOpen: boolean;
    controller: MenuTreeController;
    contentID: string;
    triggerID: string;
    testID?: string;
    onExitComplete?: () => void;
    innerStyle?: StyleProp<ViewStyle>;
    containerStyles?: StyleProp<ViewStyle>;
    children: ReactNode;
};

function SheetHost({isOpen, controller, contentID, triggerID, testID, onExitComplete, innerStyle, containerStyles, children}: SheetHostProps) {
    const styles = useThemeStyles();
    return (
        <BottomDockedModal.Root
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (open) {
                    return;
                }
                controller.actions.close();
            }}
        >
            <BottomDockedModal.Content
                onExitComplete={onExitComplete}
                innerStyle={styles.pv0}
            >
                <MenuTree
                    controller={controller}
                    contentID={contentID}
                    triggerID={triggerID}
                    testID={testID}
                    innerStyle={innerStyle}
                    containerStyles={containerStyles}
                >
                    {children}
                </MenuTree>
            </BottomDockedModal.Content>
        </BottomDockedModal.Root>
    );
}

export default SheetHost;
export type {SheetHostProps};
