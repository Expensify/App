import type {RefObject} from 'react';
import type {View} from 'react-native';
import {ContentNavigationContext, ContentSubActionsContext} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import useAssertedContext from '@hooks/useAssertedContext';
import {SubContext} from './SubContext';

const HOOK_NAME = 'useSubTrigger';

type UseSubTriggerResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtActiveLevel: boolean;
};

function useSubTrigger({disabled = false, text}: {disabled?: boolean; text?: string} = {}): UseSubTriggerResult {
    const subContext = useAssertedContext(SubContext, HOOK_NAME, '<PopoverMenu.Sub>');
    const navigation = useAssertedContext(ContentNavigationContext, HOOK_NAME, '<PopoverMenu.Content>');
    const subActions = useAssertedContext(ContentSubActionsContext, HOOK_NAME, '<PopoverMenu.Content>');

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
