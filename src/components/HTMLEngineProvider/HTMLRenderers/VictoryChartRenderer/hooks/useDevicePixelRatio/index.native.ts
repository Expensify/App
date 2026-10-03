import {PixelRatio} from 'react-native';

function useDevicePixelRatio(): number {
    return PixelRatio.get();
}

export default useDevicePixelRatio;
