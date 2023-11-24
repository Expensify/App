import {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import ComposerProps from '@libs/ComposerUtils/types';
import Styles from '@styles/styles';

type UpdateNumberOfLines = (props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>, styles: typeof Styles) => void;

export default UpdateNumberOfLines;
