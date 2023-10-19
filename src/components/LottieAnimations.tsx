import { LottieViewProps } from "lottie-react-native";

const ExpensifyLounge = require('../../assets/animations/ExpensifyLounge.lottie');
const FastMoney = require('../../assets/animations/FastMoney.json');
const Fireworks = require('../../assets/animations/Fireworks.json');
const Hands = require('../../assets/animations/Hands.json');
const PreferencesDJ = require('../../assets/animations/PreferencesDJ.lottie');
const ReviewingBankInfo = require('../../assets/animations/ReviewingBankInfo.json');
const WorkspacePlanet = require('../../assets/animations/WorkspacePlanet.lottie');
const SaveTheWorld = require('../../assets/animations/SaveTheWorld.json');
const Safe = require('../../assets/animations/Safe.json');
const Magician = require('../../assets/animations/Magician.json');

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
    PreferencesDJ: {
        file: PreferencesDJ,
        w: 375,
        h: 240,
    },
    WorkspacePlanet: {
        file: WorkspacePlanet,
        w: 375,
        h: 240,
    },
}

export {type DotLottieAnimation, ExpensifyLounge, FastMoney, Fireworks, Hands, PreferencesDJ, ReviewingBankInfo, SaveTheWorld, WorkspacePlanet, Safe, Magician};
export default DotLottieAnimations;