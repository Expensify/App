import {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import {ComposerProps} from '@components/Composer/types';

type UpdateNumberOfLines = (props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => void;

export default UpdateNumberOfLines;
