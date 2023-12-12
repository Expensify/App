import PropTypes from 'prop-types';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Transaction default tag value */
    defaultTag: PropTypes.string.isRequired,

    /** The policyID we are getting tags for */
    policyID: PropTypes.string.isRequired,

    /** The tag name to which the default tag belongs to */
    tagName: PropTypes.string.isRequired,

    /** Callback to fire when the Save button is pressed  */
    onSubmit: PropTypes.func.isRequired,
};

function EditRequestTagPage({defaultTag, policyID, tagName, onSubmit}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const selectTag = (tag) => {
        onSubmit({tag: tag.searchText});
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestTagPage.displayName}
        >
            {({insets}) => (
                <>
                    <HeaderWithBackButton
                        title={tagName || translate('common.tag')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection', {tagName: tagName || translate('common.tag')})}</Text>
                    <TagPicker
                        selectedTag={defaultTag}
                        tag={tagName}
                        policyID={policyID}
                        shouldShowDisabledAndSelectedOption
                        insets={insets}
                        onSubmit={selectTag}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

EditRequestTagPage.propTypes = propTypes;
EditRequestTagPage.displayName = 'EditRequestTagPage';

export default EditRequestTagPage;
