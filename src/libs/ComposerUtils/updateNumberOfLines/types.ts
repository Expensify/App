import {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import ComposerProps from '../types';

type UpdateNumberOfLines = (props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => void;

export default UpdateNumberOfLines;
