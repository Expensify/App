import HeaderTitleComponent from '@components/HeaderTitle';

import useLocalize from '@hooks/useLocalize';

import type {StepCounterParams} from '@src/languages/params';

type HeaderTitleSubtitleProps = {
    /** Subtitle of the header. */
    subtitle?: string;

    /** Data to display a step counter in the header. When set, it replaces the subtitle. */
    stepCounter?: StepCounterParams;
};

function HeaderTitleSubtitle({subtitle = '', stepCounter}: HeaderTitleSubtitleProps) {
    const {translate} = useLocalize();

    const resolvedSubtitle = stepCounter ? translate('stepCounter', stepCounter.step, stepCounter.total, stepCounter.text) : subtitle;

    return resolvedSubtitle ? <HeaderTitleComponent.Subtitle>{resolvedSubtitle}</HeaderTitleComponent.Subtitle> : null;
}

export default HeaderTitleSubtitle;
