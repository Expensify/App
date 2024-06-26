import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import type DotLottieAnimation from './types';

const DotLottieAnimations = {
    Abracadabra: {
        file: require('@assets/animations/Abracadabra.lottie'),
        w: 375,
        h: 400,
    },
    FastMoney: {
        file: require('@assets/animations/FastMoney.lottie'),
        w: 375,
        h: 240,
    },
    Fireworks: {
        file: require('@assets/animations/Fireworks.lottie'),
        w: 360,
        h: 360,
    },
    Hands: {
        file: require('@assets/animations/Hands.lottie'),
        w: 375,
        h: 375,
    },
    PreferencesDJ: {
        file: require('@assets/animations/PreferencesDJ.lottie'),
        w: 375,
        h: 240,
        backgroundColor: colors.blue500,
    },
    ReviewingBankInfo: {
        file: require('@assets/animations/ReviewingBankInfo.lottie'),
        w: 280,
        h: 280,
    },
    WorkspacePlanet: {
        file: require('@assets/animations/WorkspacePlanet.lottie'),
        w: 375,
        h: 240,
        backgroundColor: colors.pink800,
    },
    SaveTheWorld: {
        file: require('@assets/animations/SaveTheWorld.lottie'),
        w: 375,
        h: 240,
    },
    Safe: {
        file: require('@assets/animations/Safe.lottie'),
        w: 625,
        h: 400,
        backgroundColor: colors.ice500,
    },
    Magician: {
        file: require('@assets/animations/Magician.lottie'),
        w: 853,
        h: 480,
    },
    Update: {
        file: require('@assets/animations/Update.lottie'),
        w: variables.updateAnimationW,
        h: variables.updateAnimationH,
    },
    Coin: {
        file: require('@assets/animations/Coin.lottie'),
        w: 375,
        h: 240,
        backgroundColor: colors.yellow600,
    },
    Desk: {
        file: require('@assets/animations/Desk.lottie'),
        w: 200,
        h: 120,
        backgroundColor: colors.blue700,
    },
    Plane: {
        file: require('@assets/animations/Plane.lottie'),
        w: 180,
        h: 200,
    },
} satisfies Record<string, DotLottieAnimation>;

export default DotLottieAnimations;
