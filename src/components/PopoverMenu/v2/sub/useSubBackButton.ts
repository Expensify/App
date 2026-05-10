import {use} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {ContentNavigationContext, ContentSubActionsContext} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
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
function useSubBackButton(): UseSubBackButtonResult {
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

    const isAtActiveLevel = navigation.currentSubID === subContext.subID;

    const row = useFocusableRow({
        componentName: HOOK_NAME,
        visible: isAtActiveLevel,
        onActivate: () => subActions.exitSub(subContext.parentSubID),
    });

    return {...row, isAtActiveLevel};
}

export default useSubBackButton;
export type {UseSubBackButtonResult};
