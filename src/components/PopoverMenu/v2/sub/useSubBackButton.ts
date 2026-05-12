import type {RefObject} from 'react';
import type {View} from 'react-native';
import {ContentNavigationContext, ContentSubActionsContext} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import useAssertedContext from '@hooks/useAssertedContext';
import {SubContext} from './SubContext';

const HOOK_NAME = 'useSubBackButton';

type UseSubBackButtonResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtActiveLevel: boolean;
};

/** Sub-level back-button hook; pops one sub on press. `<Sub.BackButton>` is the opinionated `MenuItem` shape. */
function useSubBackButton({text}: {text?: string} = {}): UseSubBackButtonResult {
    const subContext = useAssertedContext(SubContext, HOOK_NAME, '<PopoverMenu.Sub>');
    const navigation = useAssertedContext(ContentNavigationContext, HOOK_NAME, '<PopoverMenu.Content>');
    const subActions = useAssertedContext(ContentSubActionsContext, HOOK_NAME, '<PopoverMenu.Content>');

    const isAtActiveLevel = navigation.currentSubID === subContext.subID;

    const row = useFocusableRow({
        componentName: HOOK_NAME,
        visible: isAtActiveLevel,
        text,
        onActivate: () => subActions.exitSub(subContext.parentSubID),
    });

    return {...row, isAtActiveLevel};
}

export default useSubBackButton;
export type {UseSubBackButtonResult};
