import {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import ComposerProps from '@libs/ComposerUtils/types';
import {type ThemeStyles} from '@styles/index';

type UpdateNumberOfLines = (props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>, styles: ThemeStyles) => void;

export default UpdateNumberOfLines;
