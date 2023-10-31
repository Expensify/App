import {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import ComposerProps from '@libs/ComposerUtils/types';
import {Styles} from '@styles/styles';

type UpdateNumberOfLines = (styles: Styles, props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => void;

export default UpdateNumberOfLines;
