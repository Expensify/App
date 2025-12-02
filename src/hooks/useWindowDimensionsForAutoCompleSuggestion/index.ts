// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';

function useWindowDimensionsForAutoCompleSuggestion() {
    const {width, height} = useWindowDimensions();

    return {width, height};
}

export default useWindowDimensionsForAutoCompleSuggestion;
