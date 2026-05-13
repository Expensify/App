import React from 'react';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';

const GPS_TOOLTIP_HORIZONTAL_PADDING = 40;

function GPSTooltip({children}: React.PropsWithChildren) {
    const [isTracking = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});

    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();

    const {renderProductTrainingTooltip, shouldShowProductTrainingTooltip} = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.GPS_TOOLTIP, !!isTracking);

    return (
        <EducationalTooltip
            wrapperStyle={styles.productTrainingTooltipWrapper}
            shiftVertical={-12}
            maxWidth={windowWidth - GPS_TOOLTIP_HORIZONTAL_PADDING}
            renderTooltipContent={renderProductTrainingTooltip}
            shouldRender={shouldShowProductTrainingTooltip}
        >
            {children}
        </EducationalTooltip>
    );
}

export default GPSTooltip;
