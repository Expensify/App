import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';

function getOnboardingExitNavigationOptions(): LinkToOptions | undefined {
    return {forceReplace: true};
}

export default getOnboardingExitNavigationOptions;
