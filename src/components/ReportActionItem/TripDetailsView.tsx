import {View} from 'react-native';
import Text from '@components/Text';

type TripDetailsViewProps = {
    /** The active IOUReport, used for Onyx subscription */
    iouReportID?: string;

    /** Whether we should display the horizontal rule below the component */
    shouldShowHorizontalRule: boolean;
};

function TripDetailsView({iouReportID, shouldShowHorizontalRule}: TripDetailsViewProps) {
    return (
        <View>
            <Text>
                Hello world ${iouReportID} ${shouldShowHorizontalRule}
            </Text>
        </View>
    );
}

export default TripDetailsView;
