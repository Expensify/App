// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import type GetHighResolutionInfoWrapperStyle from './types';

const getHighResolutionInfoWrapperStyle: GetHighResolutionInfoWrapperStyle = (isUploaded) => ({
    ...spacing.ph5,
    ...spacing.pt5,
    ...(isUploaded ? spacing.pb5 : spacing.mbn1),
});

export default getHighResolutionInfoWrapperStyle;
