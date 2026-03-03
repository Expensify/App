type StitchLayout = {
    width: number;
    height: number;
    horizontal: boolean;
};

function calculateStitchLayout(w1: number, h1: number, w2: number, h2: number): StitchLayout {
    const horizontal = !(w1 > h1 || w2 > h2);
    return {
        width: horizontal ? w1 + w2 : Math.max(w1, w2),
        height: horizontal ? Math.max(h1, h2) : h1 + h2,
        horizontal,
    };
}

export default calculateStitchLayout;
