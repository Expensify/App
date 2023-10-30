import { LottieViewProps } from "lottie-react-native";

const ExpensifyLounge = require('@assets/animations/ExpensifyLounge.lottie');
const FastMoney = require('@assets/animations/FastMoney.lottie');
const Fireworks = require('@assets/animations/Fireworks.lottie');
const Hands = require('@assets/animations/Hands.lottie');
const PreferencesDJ = require('@assets/animations/PreferencesDJ.lottie');
const ReviewingBankInfo = require('@assets/animations/ReviewingBankInfo.lottie');
const WorkspacePlanet = require('@assets/animations/WorkspacePlanet.lottie');
const SaveTheWorld = require('@assets/animations/SaveTheWorld.lottie');
const Safe = require('@assets/animations/Safe.lottie');
const Magician = require('@assets/animations/Magician.lottie');

type DotLottieAnimation = {
    name?: string,
    file: LottieViewProps['source'],
    w: number,
    h: number,
};

const DotLottieAnimations: Record<string, DotLottieAnimation> = {
    ExpensifyLounge: {
        file: ExpensifyLounge,
        w: 1920,
        h: 1080,
    },
    FastMoney: {
        file: FastMoney,
        w: 375,
        h: 240,
    },
    Fireworks: {
        file: Fireworks,
        w: 360,
        h: 360,
    },
    Hands: {
        file: Hands,
        w: 375,
        h: 375,
    },
    PreferencesDJ: {
        file: PreferencesDJ,
        w: 375,
        h: 240,
    },
    ReviewingBankInfo: {
        file: ReviewingBankInfo,
        w: 280,
        h: 280,
    },
    WorkspacePlanet: {
        file: WorkspacePlanet,
        w: 375,
        h: 240,
    },
    SaveTheWorld: {
        file: SaveTheWorld,
        w: 375,
        h: 240,
    },
    Safe: {
        file: Safe,
        w: 625,
        h: 400,
    },
    Magician: {
        file: Magician,
        w: 853,
        h: 480,
    },
}

export {type DotLottieAnimation, ExpensifyLounge, FastMoney, Fireworks, Hands, PreferencesDJ, ReviewingBankInfo, SaveTheWorld, WorkspacePlanet, Safe, Magician};
export default DotLottieAnimations;