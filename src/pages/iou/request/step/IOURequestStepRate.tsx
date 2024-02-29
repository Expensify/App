import React from 'react';
import {withOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import type {Route} from '@src/ROUTES';

type Props = {
    // eslint-disable-next-line react/no-unused-prop-types
    lastSelectedDistanceRate: string;
    /** The route object passed to this screen */
    route: {
        /** The params passed to this screen */
        params: {
            /** The route to go back to */
            backTo: Route;
        };
    };
};

const mockRates = [
    {text: 'Default Rate', alternateText: '$0.656 / mile', keyForList: 'DefaultRate'},
    {text: 'Custom Rate', alternateText: '$0.700 / mile', keyForList: 'CustomRate'},
];

function IOURequestStepRate({
    route: {
        params: {backTo},
    },
}: Props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <StepScreenWrapper
            headerTitle={translate('common.rate')}
            onBackButtonPress={() => Navigation.goBack(backTo)}
            shouldShowWrapper={Boolean(backTo)}
            testID="rate"
        >
            <Text style={[styles.mh5, styles.mv4]}>{translate('iou.chooseARate')}</Text>

            <SelectionList
                sections={[{data: mockRates}]}
                ListItem={RadioListItem}
                onSelectRow={() => {}}
                initiallyFocusedOptionKey="DefaultRate"
            />
        </StepScreenWrapper>
    );
}

IOURequestStepRate.displayName = 'IOURequestStepRate';

// export default withOnyx({
//     lastSelectedDistanceRate: {
//         key: 'ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATE',
//     },
// })(IOURequestStepRate);

export default IOURequestStepRate;
