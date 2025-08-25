import { useKeyboardHandler } from "react-native-keyboard-controller";
import type { View } from "react-native";
import { Dimensions, Platform } from "react-native";
import { useRef } from "react";
import { useSharedValue } from "react-native-reanimated";
import useSafeAreaPaddings from "@hooks/useSafeAreaPaddings";
import SplitListItem from "@components/SelectionList/SplitListItem";
import type { SelectionListHandle } from "@components/SelectionList/types";
import type UseDisplayFocusedInputUnderKeyboardType from "./types";

const useDisplayFocusedInputUnderKeyboard = () => {
    const screenHeight = Dimensions.get('window').height;
    const viewRef = useRef<View>(null);
    const bottomOffset = useRef<number>(0);
    const footerHeight = useRef<number>(0);
    const keyboardHeight = useSharedValue(0);
    const safeAreaPaddings = useSafeAreaPaddings();
    const listRef = useRef<SelectionListHandle>(null);
    const inputIndexIsFocused = useRef(0);


    useKeyboardHandler({
            onStart: (e) => {
                'worklet';
                
                keyboardHeight.value = e.height;
            },
            onMove: (e) => {
                'worklet';
    
                keyboardHeight.value = e.height;
            },
            onEnd: (e) => {
                'worklet';
    
                keyboardHeight.value = e.height;
            },
        });

    const scrollToFocusedInput = () => {
        if (!viewRef.current) {
            return;
        }
        viewRef.current.measureInWindow((x, y, width, height) => {
            if (keyboardHeight.value >= 1.0) {
                return;
            }
            bottomOffset.current = screenHeight - safeAreaPaddings.paddingBottom - safeAreaPaddings.paddingTop - height + footerHeight.current + Platform.select({ios: 28, default: 20}) + 20;
        });
    };

    return {
        listRef,
        inputIndexIsFocused,
        viewRef,
        footerHeight,
        bottomOffset,
        scrollToFocusedInput,
        SplitListItem
    } as unknown as UseDisplayFocusedInputUnderKeyboardType;
};

export default useDisplayFocusedInputUnderKeyboard;

