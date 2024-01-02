import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TagPicker from '@components/TagPicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

type Tag = {
    tag: string;
};

type SelectTagProp = {
    searchText: string;
};

type EditRequestTagPageProps = {
    defaultTag?: string;
    policyID?: string;
    tagName?: string;
    onSubmit: (tag: Tag) => void;
};

function EditRequestTagPage({defaultTag, policyID, tagName, onSubmit}: EditRequestTagPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const selectTag = (tag: SelectTagProp) => {
        onSubmit({tag: tag.searchText});
    };

    return (
        // @ts-expect-error TODO: Remove once ScreenWrapper () is migrated
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditRequestTagPage.displayName}
        >
            {/** @ts-expect-error TODO: Remove once ScreenWrapper () is migrated */}
            {({insets}) => (
                <HeaderWithBackButton title={tagName ?? translate('common.tag')}>
                    <Text style={[styles.ph5, styles.pv3]}>{translate('iou.tagSelection', {tagName: tagName ?? translate('common.tag')})}</Text>
                    <TagPicker
                        // @ts-expect-error TODO: Remove once TagPicker () is migrated
                        selectedTag={defaultTag}
                        tag={tagName}
                        policyID={policyID}
                        shouldShowDisabledAndSelectedOption
                        insets={insets}
                        onSubmit={selectTag}
                    />
                </HeaderWithBackButton>
            )}
        </ScreenWrapper>
    );
}

EditRequestTagPage.displayName = 'EditRequestTagPage';

export default EditRequestTagPage;
