import { LottieViewProps } from "lottie-react-native";

type DotLottieAnimation = {
    name?: string,
    file: LottieViewProps['source'],
    w: number,
    h: number,
};

export default DotLottieAnimation;
