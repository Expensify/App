import Header from '@components/Header';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {StepCounterParams} from '@src/languages/params';

import type {ReactNode} from 'react';

import React from 'react';

type HeaderTitleProps = {
    /** Title of the header. */
    children: string;

    /** Subtitle of the header. */
    subtitle?: ReactNode;

    /** Title color. */
    titleColor?: string;

    /** Data to display a step counter in the header. When set, it replaces the subtitle. */
    stepCounter?: StepCounterParams;

    /** The URL link associated with the subtitle, if available. */
    subTitleLink?: string;

    /** Whether to skip focus of the first interactive element after the RHP transition (screen reader). */
    shouldSkipFocusAfterTransition?: boolean;

    shouldUseHeadlineHeader: boolean;
};

function HeaderTitle({children, subtitle = '', titleColor, stepCounter, subTitleLink = '', shouldSkipFocusAfterTransition = false, shouldUseHeadlineHeader}: HeaderTitleProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    return (
        <Header
            title={children}
            subtitle={stepCounter ? translate('stepCounter', stepCounter) : subtitle}
            textStyles={[titleColor ? StyleUtils.getTextColorStyle(titleColor) : {}, shouldUseHeadlineHeader && styles.textHeadlineH2]}
            subTitleLink={subTitleLink}
            numberOfTitleLines={1}
            isScreenHeader
            shouldSkipFocusAfterTransition={shouldSkipFocusAfterTransition}
        />
    );
}

export default HeaderTitle;
export type {HeaderTitleProps};
