import {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import ComposerProps from '@libs/ComposerUtils/types';

type UpdateNumberOfLines = (props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => void;

export default UpdateNumberOfLines;
