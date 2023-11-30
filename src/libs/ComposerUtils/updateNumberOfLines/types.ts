import {NativeSyntheticEvent, TextInputContentSizeChangeEventData} from 'react-native';
import {ComposerProps} from '@components/Composer/types';
import themeStyles from '@styles/styles';

type UpdateNumberOfLines = (props: ComposerProps, event: NativeSyntheticEvent<TextInputContentSizeChangeEventData>, styles: typeof themeStyles) => void;

export default UpdateNumberOfLines;
