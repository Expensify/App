import {use} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {ContentNavigationContext, ContentSubActionsContext} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {SubContext} from './SubContext';

const HOOK_NAME = 'useSubTrigger';

type UseSubTriggerResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtActiveLevel: boolean;
};

/** Sub-level trigger hook; opens the enclosing `<Sub>`. `<Sub.Trigger>` is the opinionated `MenuItem` shape. */
function useSubTrigger({disabled = false, text}: {disabled?: boolean; text?: string} = {}): UseSubTriggerResult {
    const subContext = use(SubContext);
    if (!subContext) {
        throw new Error(`${HOOK_NAME}() must be called inside <PopoverMenu.Sub>.`);
    }
    const navigation = use(ContentNavigationContext);
    if (!navigation) {
        throw new Error(`${HOOK_NAME}() must be called inside <PopoverMenu.Content>.`);
    }
    const subActions = use(ContentSubActionsContext);
    if (!subActions) {
        throw new Error(`${HOOK_NAME}() must be called inside <PopoverMenu.Content>.`);
    }

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
