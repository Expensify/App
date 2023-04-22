import {useContext} from 'react';
import {WindowDimensionsContext} from '../providers/WindowDimensionsProvider';

export default function useWindowDimensions() {
    return useContext(WindowDimensionsContext);
}
