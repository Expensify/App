import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** The theme of the app */
    preferredTheme: PropTypes.string,
};

const defaultProps = {
    preferredTheme: CONST.THEME.DEFAULT,
};

function ThemePage(props) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const localesToThemes = _.map(_.values(_.omit(CONST.THEME, 'DEFAULT', 'FALLBACK')), (theme) => ({
        value: theme,
        text: translate(`themePage.themes.${theme}.label`),
        keyForList: theme,
        isSelected: (props.preferredTheme || CONST.THEME.DEFAULT) === theme,
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ThemePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('themePage.theme')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />

            <Text style={[styles.mh5, styles.mv4]}>{translate('themePage.chooseThemeBelowOrSync')}</Text>

            <SelectionList
                sections={[{data: localesToThemes}]}
                onSelectRow={(theme) => User.updateTheme(theme.value)}
                initiallyFocusedOptionKey={_.find(localesToThemes, (theme) => theme.isSelected).keyForList}
            />
        </ScreenWrapper>
    );
}

ThemePage.displayName = 'ThemePage';
ThemePage.propTypes = propTypes;
ThemePage.defaultProps = defaultProps;

export default withOnyx({
    preferredTheme: {
        key: ONYXKEYS.PREFERRED_THEME,
    },
})(ThemePage);
