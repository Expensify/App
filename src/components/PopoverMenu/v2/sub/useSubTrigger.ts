import {use} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {ContentNavigationContext, ContentSubActionsContext} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {SubContext} from './SubContext';

type UseSubTriggerResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtParentLevel: boolean;
};

/** Sub-level analogue of `usePopoverTrigger()`; opens the enclosing `<Sub>`. `<Sub.Trigger>` is the opinionated `MenuItem` shape. */
function useSubTrigger({disabled = false}: {disabled?: boolean} = {}): UseSubTriggerResult {
    const subContext = use(SubContext);
    if (!subContext) {
        throw new Error('useSubTrigger() must be called inside <PopoverMenu.Sub>.');
    }
    const navigation = use(ContentNavigationContext);
    const subActions = use(ContentSubActionsContext);
    if (!navigation || !subActions) {
        throw new Error('useSubTrigger() must be called inside <PopoverMenu.Content>.');
    }

    const isAtParentLevel = navigation.currentSubID === subContext.parentSubID;

    const row = useFocusableRow({
        componentName: 'useSubTrigger',
        visible: isAtParentLevel,
        isDisabled: disabled,
        onActivate: () => {
            if (disabled) {
                return;
            }
            subActions.enterSub(subContext.subID);
        },
    });

    return {...row, isAtParentLevel};
}

export default useSubTrigger;
export type {UseSubTriggerResult};
