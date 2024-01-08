import type {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import type {ComposerProps} from '@components/Composer/types';
import type {ThemeStyles} from '@styles/index';

type UpdateNumberOfLines = (props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>, styles: ThemeStyles) => void;

export default UpdateNumberOfLines;
