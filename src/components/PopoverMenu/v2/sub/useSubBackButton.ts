import {useContentNavigation, useContentSubActions} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';

import type {RefObject} from 'react';
import type {View} from 'react-native';

import {useSubContext} from './SubContext';

const HOOK_NAME = 'useSubBackButton';

type UseSubBackButtonResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtActiveLevel: boolean;
};

function useSubBackButton(): UseSubBackButtonResult {
    const subContext = useSubContext(HOOK_NAME);
    const navigation = useContentNavigation(HOOK_NAME);
    const subActions = useContentSubActions(HOOK_NAME);

    const isAtActiveLevel = navigation.currentSubID === subContext.subID;

    // No `text` — back buttons stay out of typeahead so "g" doesn't focus the back button on every drilled-in level.
    const row = useFocusableRow({
        componentName: HOOK_NAME,
        visible: isAtActiveLevel,
        onActivate: () => subActions.exitSub(subContext.parentSubID),
    });

    return {...row, isAtActiveLevel};
}

export default useSubBackButton;
export type {UseSubBackButtonResult};
