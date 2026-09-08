import Header from '@components/Header';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StepCounterParams} from '@src/languages/params';

import type {ReactNode} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleProps = {
    /** Title of the header. */
    children: string;

    /** Subtitle of the header. */
    subtitle?: ReactNode;

    /** Title color. */
    titleColor?: string;

    /** Additional styles to apply to the title text. */
    titleStyles?: StyleProp<TextStyle>;

    /** Data to display a step counter in the header. When set, it replaces the subtitle. */
    stepCounter?: StepCounterParams;

    /** The URL link associated with the subtitle, if available. */
    subTitleLink?: string;

    /** Whether to skip focus of the first interactive element after the RHP transition (screen reader). */
    shouldSkipFocusAfterTransition?: boolean;

    /** Whether to use the taller headline style bar with the larger title font. */
    shouldUseHeadlineHeader: boolean;
};

function HeaderTitle({children, subtitle = '', titleColor, titleStyles, stepCounter, subTitleLink = '', shouldSkipFocusAfterTransition = false, shouldUseHeadlineHeader}: HeaderTitleProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    return (
        <Header
            title={children}
            subtitle={stepCounter ? translate('stepCounter', stepCounter.step, stepCounter.total, stepCounter.text) : subtitle}
            textStyles={[titleColor ? StyleUtils.getTextColorStyle(titleColor) : {}, shouldUseHeadlineHeader && styles.textHeadlineH2, titleStyles]}
            subTitleLink={subTitleLink}
            numberOfTitleLines={1}
            isScreenHeader
            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
        />
    );
}

export default HeaderTitle;
