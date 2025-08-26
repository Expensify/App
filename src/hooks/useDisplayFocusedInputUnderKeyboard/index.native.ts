import { useKeyboardHandler } from "react-native-keyboard-controller";
import type { View } from "react-native";
import { Dimensions, Platform } from "react-native";
import { useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import useSafeAreaPaddings from "@hooks/useSafeAreaPaddings";
import SplitListItem from "@components/SelectionList/SplitListItem";
import type { SelectionListHandle } from "@components/SelectionList/types";
import type UseDisplayFocusedInputUnderKeyboardType from "./types";
import {MARGIN_FROM_INPUT_IOS, MARGIN_FROM_INPUT_ANDROID, FOOTER_BOTTOM_MARGIN} from "./const";

const useDisplayFocusedInputUnderKeyboard = (): UseDisplayFocusedInputUnderKeyboardType => {
    const screenHeight = Dimensions.get('window').height;
    const viewRef = useRef<View>(null);
    const bottomOffset = useRef(0);
    const footerRef = useRef<View>(null);
    const keyboardHeight = useSharedValue(0);
    const safeAreaPaddings = useSafeAreaPaddings();
    const listRef = useRef<SelectionListHandle>(null);


    useKeyboardHandler({
            onStart: (e) => {
                'worklet';
                
                keyboardHeight.set(e.height);
            },
            onMove: (e) => {
                'worklet';
    
                keyboardHeight.set(e.height);
            },
            onEnd: (e) => {
                'worklet';
    
                keyboardHeight.set(e.height);
            },
        });

    const scrollToFocusedInput = () => {
        if (!viewRef.current) {
            return;
        }
        viewRef.current.measureInWindow((x, y, width, height) => {
            footerRef.current?.measureInWindow((fx, fy, fwidth, fheight) => {
                const keyboardHeightValue = keyboardHeight.get();
                if (keyboardHeightValue >= 1.0) {
                    return;
                }
                bottomOffset.current = screenHeight - safeAreaPaddings.paddingBottom - safeAreaPaddings.paddingTop - height + fheight + Platform.select({ios: MARGIN_FROM_INPUT_IOS, default: MARGIN_FROM_INPUT_ANDROID}) + FOOTER_BOTTOM_MARGIN;
            });
        });
    };

    return {
        listRef,
        viewRef,
        footerRef,
        bottomOffset,
        scrollToFocusedInput,
        SplitListItem
    };
};

export default useDisplayFocusedInputUnderKeyboard;

