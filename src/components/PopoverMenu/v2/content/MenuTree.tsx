import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import CompactMenuContext from '@components/CompactMenuContext';
import CONST from '@src/CONST';
import {ContentContext} from './ContentContext';
import type {ContentContextValue} from './ContentContext';
import DismissButton from './DismissButton';

type MenuTreeProps = {
    controller: ContentContextValue;
    contentID: string;
    triggerID: string;
    containerStyles?: StyleProp<ViewStyle>;
    innerStyle?: StyleProp<ViewStyle>;
    testID?: string;
    children: ReactNode;
};

function MenuTree({controller, contentID, triggerID, containerStyles, innerStyle, testID, children}: MenuTreeProps) {
    return (
        <CompactMenuContext value>
            <ContentContext value={controller}>
                <View
                    role={CONST.ROLE.MENU}
                    aria-orientation="vertical"
                    nativeID={contentID}
                    accessibilityLabelledBy={triggerID}
                    testID={testID}
                    style={[innerStyle, containerStyles]}
                >
                    <DismissButton onPress={controller.actions.close} />
                    {children}
                </View>
            </ContentContext>
        </CompactMenuContext>
    );
}

export default MenuTree;
export type {ContentContextValue as MenuTreeController, MenuTreeProps};
