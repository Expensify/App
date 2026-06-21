import React from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import BaseContent from './BaseContent';
import type {ContentContextValue} from './ContentContext';
import SheetHost from './SheetHost';

type ResponsiveShellProps = {
    componentName: string;
    controller: ContentContextValue;
    isOpen: boolean;
    triggerID: string;
    contentID: string;
    containerStyles?: StyleProp<ViewStyle>;
    maxHeightStyle?: ViewStyle;
    anchorAlignment?: AnchorAlignment;
    onExitComplete?: () => void;
    testID?: string;
    children: ReactNode;
};

function ResponsiveShell({
    componentName,
    controller,
    isOpen,
    triggerID,
    contentID,
    containerStyles,
    maxHeightStyle,
    anchorAlignment,
    onExitComplete,
    testID,
    children,
}: ResponsiveShellProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives the responsive split.
    const {isSmallScreenWidth} = useResponsiveLayout();

    if (isSmallScreenWidth) {
        return (
            <SheetHost
                isOpen={isOpen}
                controller={controller}
                contentID={contentID}
                triggerID={triggerID}
                testID={testID}
                onExitComplete={onExitComplete}
                innerStyle={maxHeightStyle}
                containerStyles={containerStyles}
            >
                {children}
            </SheetHost>
        );
    }

    return (
        <BaseContent
            componentName={componentName}
            controller={controller}
            anchorAlignment={anchorAlignment}
            maxHeightStyle={maxHeightStyle}
            containerStyles={containerStyles}
            onExitComplete={onExitComplete}
            testID={testID}
        >
            {children}
        </BaseContent>
    );
}

export default ResponsiveShell;
export type {ResponsiveShellProps};
