import type {RefObject} from 'react';
import type {View} from 'react-native';
import {useContent} from '@components/PopoverMenu/v2/content/ContentContext';
import useFocusableRow from '@components/PopoverMenu/v2/rows/useFocusableRow';
import {useSubContext} from './context';

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
    const content = useContent(HOOK_NAME);
    const {currentSubID} = content.state;
    const {exitSub} = content.actions;

    const isAtActiveLevel = currentSubID === subContext.subID;

    const row = useFocusableRow({
        componentName: HOOK_NAME,
        visible: isAtActiveLevel,
        onActivate: () => exitSub(subContext.parentSubID),
    });

    return {...row, isAtActiveLevel};
}

export default useSubBackButton;
export type {UseSubBackButtonResult};
