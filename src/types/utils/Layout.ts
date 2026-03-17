type Dimensions = {
    width: number;
    height: number;
};

type Location = {
    x: number;
    y: number;
};

type Bounds = Dimensions & Location;

export type {Dimensions, Location, Bounds};
