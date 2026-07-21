import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {StepCounterParams} from '@src/languages/params';

import {View} from 'react-native';

type HeaderProgressBarProps = {
    /** 0 - 100 number indicating the current progress of the progress bar. */
    percentageProgress: number;

    /** Data to display a step counter, used to build the progress bar's accessibility label. */
    stepCounter?: StepCounterParams;
};

function HeaderProgressBar({percentageProgress, stepCounter}: HeaderProgressBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const progressBarLabel = stepCounter ? `${translate('common.progressBarLabel')}, ${translate('stepCounter', stepCounter)}` : undefined;

    return (
        <>
            {/* Reserves as much space for the middle content as possible */}
            <View style={styles.flexGrow1} />
            {/* Uses absolute positioning so that it's always centered instead of being affected by the
                presence or absence of back/close buttons to the left/right of it */}
            <View style={styles.headerProgressBarContainer}>
                <View
                    style={styles.headerProgressBar}
                    accessible={!!progressBarLabel}
                    accessibilityLabel={progressBarLabel}
                    role={CONST.ROLE.PROGRESSBAR}
                    aria-valuetext={progressBarLabel}
                >
                    <View
                        aria-hidden
                        style={[{width: `${percentageProgress}%`}, styles.headerProgressBarFill]}
                    />
                </View>
            </View>
        </>
    );
}

export default HeaderProgressBar;
export type {HeaderProgressBarProps};
