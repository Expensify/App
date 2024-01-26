import type {ThemeStyles} from '@styles/index';
import type {ThemeColors} from '@styles/theme/types';

type StyleUtilGenerator<StyleUtil = Record<string, unknown>> = (props: {theme: ThemeColors; styles: ThemeStyles}) => StyleUtil;

export default StyleUtilGenerator;
