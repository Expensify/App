import {Platform} from 'react-native';
import type {PlatformIOSStatic} from 'react-native';

export default function getIsPad() {
    return (Platform as PlatformIOSStatic).isPad;
}
