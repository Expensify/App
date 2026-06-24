import type {RefObject} from 'react';
import type {View} from 'react-native';
import {useContent} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {useSubContext} from './context';

const HOOK_NAME = 'useSubTrigger';

type UseSubTriggerResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtActiveLevel: boolean;
};

function useSubTrigger({disabled = false, text}: {disabled?: boolean; text?: string} = {}): UseSubTriggerResult {
    const subContext = useSubContext(HOOK_NAME);
    const content = useContent(HOOK_NAME);
    const {currentSubID} = content.state;
    const {enterSub} = content.actions;

    const isAtActiveLevel = currentSubID === subContext.parentSubID;

    const row = useFocusableRow({
        componentName: HOOK_NAME,
        visible: isAtActiveLevel,
        isDisabled: disabled,
        text,
        onActivate: () => {
            if (disabled) {
                return;
            }
            enterSub(subContext.subID, subContext.level);
        },
    });

    return {...row, isAtActiveLevel};
}

export default useSubTrigger;
export type {UseSubTriggerResult};
