import _ from 'underscore';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import SelectionList from '../../../components/SelectionList';
import styles from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import compose from '../../../libs/compose';
import Text from '../../../components/Text';
import * as User from '../../../libs/actions/User';

const propTypes = {
    ...withLocalizePropTypes,

    /** The theme of the app */
    preferredTheme: PropTypes.string,
};

const defaultProps = {
    preferredTheme: CONST.THEME.DEFAULT,
};

function ThemePage(props) {
    const localesToThemes = _.map(props.translate('themePage.themes'), (theme, key) => ({
        value: key,
        text: theme.label,
        keyForList: key,
        isSelected: (props.preferredTheme || CONST.THEME.DEFAULT) === key,
    }));

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('themePage.theme')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />

            <Text style={[styles.mh5, styles.mv4]}>{props.translate('themePage.chooseThemeBelowOrSync')}</Text>

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

export default compose(
    withLocalize,
    withOnyx({
        preferredTheme: {
            key: ONYXKEYS.PREFERRED_THEME,
        },
    }),
)(ThemePage);
