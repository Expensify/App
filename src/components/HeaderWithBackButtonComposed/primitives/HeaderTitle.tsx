import HeaderTitleComponent from '@components/HeaderTitle';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StepCounterParams} from '@src/languages/params';

import type {StyleProp, TextStyle} from 'react-native';

type HeaderTitleProps = {
    /** Title of the header. */
    title: string;

    /** Subtitle of the header. */
    subtitle?: string;

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

function HeaderTitle({title, subtitle = '', titleColor, titleStyles, stepCounter, subTitleLink = '', shouldSkipFocusAfterTransition = false, shouldUseHeadlineHeader}: HeaderTitleProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const resolvedSubtitle = stepCounter ? translate('stepCounter', stepCounter.step, stepCounter.total, stepCounter.text) : subtitle;

    return (
        <HeaderTitleComponent
            title={title}
            dialogTitle={''}
            textStyles={[titleColor ? StyleUtils.getTextColorStyle(titleColor) : {}, shouldUseHeadlineHeader && styles.textHeadlineH2, titleStyles]}
            numberOfTitleLines={1}
            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
        >
            {!!resolvedSubtitle && <HeaderTitleComponent.Subtitle>{resolvedSubtitle}</HeaderTitleComponent.Subtitle>}
            {!!subTitleLink && <HeaderTitleComponent.SubtitleLink>{subTitleLink}</HeaderTitleComponent.SubtitleLink>}
        </HeaderTitleComponent>
    );
}

export default HeaderTitle;
