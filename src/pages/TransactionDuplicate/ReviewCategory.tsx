import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ReviewFields from './ReviewFields';

function ReviewCategory() {
    return (
        <ScreenWrapper testID={ReviewCategory.displayName}>
            <HeaderWithBackButton title="Review duplicates" />
            <ReviewFields
                stepNames={['1', '2', '3']}
                label="Choose which category to keep"
                options={['Home office', 'Travel']}
                index={1}
            />
        </ScreenWrapper>
    );
}

ReviewCategory.displayName = 'ReviewCategory';
export default ReviewCategory;
