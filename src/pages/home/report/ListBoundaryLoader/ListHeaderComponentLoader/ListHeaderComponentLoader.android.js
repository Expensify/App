import {View, ActivityIndicator} from 'react-native';
import styles, {stylesGenerator} from '../../../../../styles/styles';
import themeColors from '../../../../../styles/themes/default';

function ListHeaderComponentLoader() {
    return (
        <View style={[stylesGenerator.alignItemsCenter, styles.justifyContentCenter, styles.chatBottomLoader, styles.chatBottomLoaderAndroid]}>
            <ActivityIndicator
                color={themeColors.spinner}
                size="small"
            />
        </View>
    );
}

export default ListHeaderComponentLoader;
