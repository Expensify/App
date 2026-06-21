import type {RefObject} from 'react';
import type {View} from 'react-native';
import {useContentNavigation, useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {useSubContext} from './SubContext';

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
    const navigation = useContentNavigation(HOOK_NAME);
    const subActions = useContentSubActions(HOOK_NAME);

    const isAtActiveLevel = navigation.currentSubID === subContext.parentSubID;

    const row = useFocusableRow({
        componentName: HOOK_NAME,
        visible: isAtActiveLevel,
        isDisabled: disabled,
        text,
        onActivate: () => {
            if (disabled) {
                return;
            }
            subActions.enterSub(subContext.subID);
        },
    });

    return {...row, isAtActiveLevel};
}

export default useSubTrigger;
export type {UseSubTriggerResult};
