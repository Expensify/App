type NAICSItem = {
    id: number;
    value: string;
    options: NAICSItem[];
};

type NAICSItemWithoutOptions = Omit<NAICSItem, 'options'>;

const NAICS: NAICSItem[] = [
    {
        id: 11,
        value: 'Agriculture, Forestry, Fishing and Hunting',
        options: [
            {
                id: 111,
                value: 'Crop Production',
                options: [
                    {
                        id: 1111,
                        value: 'Oilseed and Grain Farming',
                        options: [
                            {
                                id: 11111,
                                value: 'Soybean Farming',
                                options: [
                                    {
                                        id: 111110,
                                        value: 'Soybean Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11112,
                                value: 'Oilseed (except Soybean) Farming',
                                options: [
                                    {
                                        id: 111120,
                                        value: 'Oilseed (except Soybean) Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11113,
                                value: 'Dry Pea and Bean Farming',
                                options: [
                                    {
                                        id: 111130,
                                        value: 'Dry Pea and Bean Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11114,
                                value: 'Wheat Farming',
                                options: [
                                    {
                                        id: 111140,
                                        value: 'Wheat Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11115,
                                value: 'Corn Farming',
                                options: [
                                    {
                                        id: 111150,
                                        value: 'Corn Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11116,
                                value: 'Rice Farming',
                                options: [
                                    {
                                        id: 111160,
                                        value: 'Rice Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11119,
                                value: 'Other Grain Farming',
                                options: [
                                    {
                                        id: 111191,
                                        value: 'Oilseed and Grain Combination Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111199,
                                        value: 'All Other Grain Farming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1112,
                        value: 'Vegetable and Melon Farming',
                        options: [
                            {
                                id: 11121,
                                value: 'Vegetable and Melon Farming',
                                options: [
                                    {
                                        id: 111211,
                                        value: 'Potato Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111219,
                                        value: 'Other Vegetable (except Potato) and Melon Farming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1113,
                        value: 'Fruit and Tree Nut Farming',
                        options: [
                            {
                                id: 11131,
                                value: 'Orange Groves',
                                options: [
                                    {
                                        id: 111310,
                                        value: 'Orange Groves',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11132,
                                value: 'Citrus (except Orange) Groves',
                                options: [
                                    {
                                        id: 111320,
                                        value: 'Citrus (except Orange) Groves',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11133,
                                value: 'Noncitrus Fruit and Tree Nut Farming',
                                options: [
                                    {
                                        id: 111331,
                                        value: 'Apple Orchards',
                                        options: [],
                                    },
                                    {
                                        id: 111332,
                                        value: 'Grape Vineyards',
                                        options: [],
                                    },
                                    {
                                        id: 111333,
                                        value: 'Strawberry Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111334,
                                        value: 'Berry (except Strawberry) Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111335,
                                        value: 'Tree Nut Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111336,
                                        value: 'Fruit and Tree Nut Combination Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111339,
                                        value: 'Other Noncitrus Fruit Farming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1114,
                        value: 'Greenhouse, Nursery, and Floriculture Production',
                        options: [
                            {
                                id: 11141,
                                value: 'Food Crops Grown Under Cover',
                                options: [
                                    {
                                        id: 111411,
                                        value: 'Mushroom Production',
                                        options: [],
                                    },
                                    {
                                        id: 111419,
                                        value: 'Other Food Crops Grown Under Cover',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11142,
                                value: 'Nursery and Floriculture Production',
                                options: [
                                    {
                                        id: 111421,
                                        value: 'Nursery and Tree Production',
                                        options: [],
                                    },
                                    {
                                        id: 111422,
                                        value: 'Floriculture Production',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1119,
                        value: 'Other Crop Farming',
                        options: [
                            {
                                id: 11191,
                                value: 'Tobacco Farming',
                                options: [
                                    {
                                        id: 111910,
                                        value: 'Tobacco Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11192,
                                value: 'Cotton Farming',
                                options: [
                                    {
                                        id: 111920,
                                        value: 'Cotton Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11193,
                                value: 'Sugarcane Farming',
                                options: [
                                    {
                                        id: 111930,
                                        value: 'Sugarcane Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11194,
                                value: 'Hay Farming',
                                options: [
                                    {
                                        id: 111940,
                                        value: 'Hay Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11199,
                                value: 'All Other Crop Farming',
                                options: [
                                    {
                                        id: 111991,
                                        value: 'Sugar Beet Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111992,
                                        value: 'Peanut Farming',
                                        options: [],
                                    },
                                    {
                                        id: 111998,
                                        value: 'All Other Miscellaneous Crop Farming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 112,
                value: 'Animal Production and Aquaculture',
                options: [
                    {
                        id: 1121,
                        value: 'Cattle Ranching and Farming',
                        options: [
                            {
                                id: 11211,
                                value: 'Beef Cattle Ranching and Farming, including Feedlots',
                                options: [
                                    {
                                        id: 112111,
                                        value: 'Beef Cattle Ranching and Farming',
                                        options: [],
                                    },
                                    {
                                        id: 112112,
                                        value: 'Cattle Feedlots',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11212,
                                value: 'Dairy Cattle and Milk Production',
                                options: [
                                    {
                                        id: 112120,
                                        value: 'Dairy Cattle and Milk Production',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11213,
                                value: 'Dual-Purpose Cattle Ranching and Farming',
                                options: [
                                    {
                                        id: 112130,
                                        value: 'Dual-Purpose Cattle Ranching and Farming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1122,
                        value: 'Hog and Pig Farming',
                        options: [
                            {
                                id: 11221,
                                value: 'Hog and Pig Farming',
                                options: [
                                    {
                                        id: 112210,
                                        value: 'Hog and Pig Farming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1123,
                        value: 'Poultry and Egg Production',
                        options: [
                            {
                                id: 11231,
                                value: 'Chicken Egg Production',
                                options: [
                                    {
                                        id: 112310,
                                        value: 'Chicken Egg Production',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11232,
                                value: 'Broilers and Other Meat Type Chicken Production',
                                options: [
                                    {
                                        id: 112320,
                                        value: 'Broilers and Other Meat Type Chicken Production',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11233,
                                value: 'Turkey Production',
                                options: [
                                    {
                                        id: 112330,
                                        value: 'Turkey Production',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11234,
                                value: 'Poultry Hatcheries',
                                options: [
                                    {
                                        id: 112340,
                                        value: 'Poultry Hatcheries',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11239,
                                value: 'Other Poultry Production',
                                options: [
                                    {
                                        id: 112390,
                                        value: 'Other Poultry Production',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1124,
                        value: 'Sheep and Goat Farming',
                        options: [
                            {
                                id: 11241,
                                value: 'Sheep Farming',
                                options: [
                                    {
                                        id: 112410,
                                        value: 'Sheep Farming',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11242,
                                value: 'Goat Farming',
                                options: [
                                    {
                                        id: 112420,
                                        value: 'Goat Farming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1125,
                        value: 'Aquaculture',
                        options: [
                            {
                                id: 11251,
                                value: 'Aquaculture',
                                options: [
                                    {
                                        id: 112511,
                                        value: 'Finfish Farming and Fish Hatcheries',
                                        options: [],
                                    },
                                    {
                                        id: 112512,
                                        value: 'Shellfish Farming',
                                        options: [],
                                    },
                                    {
                                        id: 112519,
                                        value: 'Other Aquaculture',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1129,
                        value: 'Other Animal Production',
                        options: [
                            {
                                id: 11291,
                                value: 'Apiculture',
                                options: [
                                    {
                                        id: 112910,
                                        value: 'Apiculture',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11292,
                                value: 'Horses and Other Equine Production',
                                options: [
                                    {
                                        id: 112920,
                                        value: 'Horses and Other Equine Production',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11293,
                                value: 'Fur-Bearing Animal and Rabbit Production',
                                options: [
                                    {
                                        id: 112930,
                                        value: 'Fur-Bearing Animal and Rabbit Production',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 11299,
                                value: 'All Other Animal Production',
                                options: [
                                    {
                                        id: 112990,
                                        value: 'All Other Animal Production',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 113,
                value: 'Forestry and Logging',
                options: [
                    {
                        id: 1131,
                        value: 'Timber Tract Operations',
                        options: [
                            {
                                id: 11311,
                                value: 'Timber Tract Operations',
                                options: [
                                    {
                                        id: 113110,
                                        value: 'Timber Tract Operations',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1132,
                        value: 'Forest Nurseries and Gathering of Forest Products',
                        options: [
                            {
                                id: 11321,
                                value: 'Forest Nurseries and Gathering of Forest Products',
                                options: [
                                    {
                                        id: 113210,
                                        value: 'Forest Nurseries and Gathering of Forest Products',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1133,
                        value: 'Logging',
                        options: [
                            {
                                id: 11331,
                                value: 'Logging',
                                options: [
                                    {
                                        id: 113310,
                                        value: 'Logging',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 114,
                value: 'Fishing, Hunting and Trapping',
                options: [
                    {
                        id: 1141,
                        value: 'Fishing',
                        options: [
                            {
                                id: 11411,
                                value: 'Fishing',
                                options: [
                                    {
                                        id: 114111,
                                        value: 'Finfish Fishing',
                                        options: [],
                                    },
                                    {
                                        id: 114112,
                                        value: 'Shellfish Fishing',
                                        options: [],
                                    },
                                    {
                                        id: 114119,
                                        value: 'Other Marine Fishing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1142,
                        value: 'Hunting and Trapping',
                        options: [
                            {
                                id: 11421,
                                value: 'Hunting and Trapping',
                                options: [
                                    {
                                        id: 114210,
                                        value: 'Hunting and Trapping',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 115,
                value: 'Support Activities for Agriculture and Forestry',
                options: [
                    {
                        id: 1151,
                        value: 'Support Activities for Crop Production',
                        options: [
                            {
                                id: 11511,
                                value: 'Support Activities for Crop Production',
                                options: [
                                    {
                                        id: 115111,
                                        value: 'Cotton Ginning',
                                        options: [],
                                    },
                                    {
                                        id: 115112,
                                        value: 'Soil Preparation, Planting, and Cultivating',
                                        options: [],
                                    },
                                    {
                                        id: 115113,
                                        value: 'Crop Harvesting, Primarily by Machine',
                                        options: [],
                                    },
                                    {
                                        id: 115114,
                                        value: 'Postharvest Crop Activities (except Cotton Ginning)',
                                        options: [],
                                    },
                                    {
                                        id: 115115,
                                        value: 'Farm Labor Contractors and Crew Leaders',
                                        options: [],
                                    },
                                    {
                                        id: 115116,
                                        value: 'Farm Management Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1152,
                        value: 'Support Activities for Animal Production',
                        options: [
                            {
                                id: 11521,
                                value: 'Support Activities for Animal Production',
                                options: [
                                    {
                                        id: 115210,
                                        value: 'Support Activities for Animal Production',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 1153,
                        value: 'Support Activities for Forestry',
                        options: [
                            {
                                id: 11531,
                                value: 'Support Activities for Forestry',
                                options: [
                                    {
                                        id: 115310,
                                        value: 'Support Activities for Forestry',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 21,
        value: 'Mining, Quarrying, and Oil and Gas Extraction',
        options: [
            {
                id: 211,
                value: 'Oil and Gas Extraction',
                options: [
                    {
                        id: 2111,
                        value: 'Oil and Gas Extraction',
                        options: [
                            {
                                id: 21112,
                                value: 'Crude Petroleum Extraction',
                                options: [
                                    {
                                        id: 211120,
                                        value: 'Crude Petroleum Extraction',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 21113,
                                value: 'Natural Gas Extraction',
                                options: [
                                    {
                                        id: 211130,
                                        value: 'Natural Gas Extraction',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 212,
                value: 'Mining (except Oil and Gas)',
                options: [
                    {
                        id: 2121,
                        value: 'Coal Mining',
                        options: [
                            {
                                id: 21211,
                                value: 'Coal Mining',
                                options: [
                                    {
                                        id: 212111,
                                        value: 'Bituminous Coal and Lignite Surface Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212112,
                                        value: 'Bituminous Coal Underground Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212113,
                                        value: 'Anthracite Mining',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2122,
                        value: 'Metal Ore Mining',
                        options: [
                            {
                                id: 21221,
                                value: 'Iron Ore Mining',
                                options: [
                                    {
                                        id: 212210,
                                        value: 'Iron Ore Mining',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 21222,
                                value: 'Gold Ore and Silver Ore Mining',
                                options: [
                                    {
                                        id: 212221,
                                        value: 'Gold Ore Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212222,
                                        value: 'Silver Ore Mining',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 21223,
                                value: 'Copper, Nickel, Lead, and Zinc Mining',
                                options: [
                                    {
                                        id: 212230,
                                        value: 'Copper, Nickel, Lead, and Zinc Mining',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 21229,
                                value: 'Other Metal Ore Mining',
                                options: [
                                    {
                                        id: 212291,
                                        value: 'Uranium-Radium-Vanadium Ore Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212299,
                                        value: 'All Other Metal Ore Mining',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2123,
                        value: 'Nonmetallic Mineral Mining and Quarrying',
                        options: [
                            {
                                id: 21231,
                                value: 'Stone Mining and Quarrying',
                                options: [
                                    {
                                        id: 212311,
                                        value: 'Dimension Stone Mining and Quarrying',
                                        options: [],
                                    },
                                    {
                                        id: 212312,
                                        value: 'Crushed and Broken Limestone Mining and Quarrying',
                                        options: [],
                                    },
                                    {
                                        id: 212313,
                                        value: 'Crushed and Broken Granite Mining and Quarrying',
                                        options: [],
                                    },
                                    {
                                        id: 212319,
                                        value: 'Other Crushed and Broken Stone Mining and Quarrying',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 21232,
                                value: 'Sand, Gravel, Clay, and Ceramic and Refractory Minerals Mining and Quarrying',
                                options: [
                                    {
                                        id: 212321,
                                        value: 'Construction Sand and Gravel Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212322,
                                        value: 'Industrial Sand Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212324,
                                        value: 'Kaolin and Ball Clay Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212325,
                                        value: 'Clay and Ceramic and Refractory Minerals Mining',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 21239,
                                value: 'Other Nonmetallic Mineral Mining and Quarrying',
                                options: [
                                    {
                                        id: 212391,
                                        value: 'Potash, Soda, and Borate Mineral Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212392,
                                        value: 'Phosphate Rock Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212393,
                                        value: 'Other Chemical and Fertilizer Mineral Mining',
                                        options: [],
                                    },
                                    {
                                        id: 212399,
                                        value: 'All Other Nonmetallic Mineral Mining',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 213,
                value: 'Support Activities for Mining',
                options: [
                    {
                        id: 2131,
                        value: 'Support Activities for Mining',
                        options: [
                            {
                                id: 21311,
                                value: 'Support Activities for Mining',
                                options: [
                                    {
                                        id: 213111,
                                        value: 'Drilling Oil and Gas Wells',
                                        options: [],
                                    },
                                    {
                                        id: 213112,
                                        value: 'Support Activities for Oil and Gas Operations',
                                        options: [],
                                    },
                                    {
                                        id: 213113,
                                        value: 'Support Activities for Coal Mining',
                                        options: [],
                                    },
                                    {
                                        id: 213114,
                                        value: 'Support Activities for Metal Mining',
                                        options: [],
                                    },
                                    {
                                        id: 213115,
                                        value: 'Support Activities for Nonmetallic Minerals (except Fuels) Mining',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 22,
        value: 'Utilities',
        options: [
            {
                id: 221,
                value: 'Utilities',
                options: [
                    {
                        id: 2211,
                        value: 'Electric Power Generation, Transmission and Distribution',
                        options: [
                            {
                                id: 22111,
                                value: 'Electric Power Generation',
                                options: [
                                    {
                                        id: 221111,
                                        value: 'Hydroelectric Power Generation',
                                        options: [],
                                    },
                                    {
                                        id: 221112,
                                        value: 'Fossil Fuel Electric Power Generation',
                                        options: [],
                                    },
                                    {
                                        id: 221113,
                                        value: 'Nuclear Electric Power Generation',
                                        options: [],
                                    },
                                    {
                                        id: 221114,
                                        value: 'Solar Electric Power Generation',
                                        options: [],
                                    },
                                    {
                                        id: 221115,
                                        value: 'Wind Electric Power Generation',
                                        options: [],
                                    },
                                    {
                                        id: 221116,
                                        value: 'Geothermal Electric Power Generation',
                                        options: [],
                                    },
                                    {
                                        id: 221117,
                                        value: 'Biomass Electric Power Generation',
                                        options: [],
                                    },
                                    {
                                        id: 221118,
                                        value: 'Other Electric Power Generation',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 22112,
                                value: 'Electric Power Transmission, Control, and Distribution',
                                options: [
                                    {
                                        id: 221121,
                                        value: 'Electric Bulk Power Transmission and Control',
                                        options: [],
                                    },
                                    {
                                        id: 221122,
                                        value: 'Electric Power Distribution',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2212,
                        value: 'Natural Gas Distribution',
                        options: [
                            {
                                id: 22121,
                                value: 'Natural Gas Distribution',
                                options: [
                                    {
                                        id: 221210,
                                        value: 'Natural Gas Distribution',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2213,
                        value: 'Water, Sewage and Other Systems',
                        options: [
                            {
                                id: 22131,
                                value: 'Water Supply and Irrigation Systems',
                                options: [
                                    {
                                        id: 221310,
                                        value: 'Water Supply and Irrigation Systems',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 22132,
                                value: 'Sewage Treatment Facilities',
                                options: [
                                    {
                                        id: 221320,
                                        value: 'Sewage Treatment Facilities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 22133,
                                value: 'Steam and Air-Conditioning Supply',
                                options: [
                                    {
                                        id: 221330,
                                        value: 'Steam and Air-Conditioning Supply',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 23,
        value: 'Construction',
        options: [
            {
                id: 236,
                value: 'Construction of Buildings',
                options: [
                    {
                        id: 2361,
                        value: 'Residential Building Construction',
                        options: [
                            {
                                id: 23611,
                                value: 'Residential Building Construction',
                                options: [
                                    {
                                        id: 236115,
                                        value: 'New Single-Family Housing Construction (except For-Sale Builders)',
                                        options: [],
                                    },
                                    {
                                        id: 236116,
                                        value: 'New Multifamily Housing Construction (except For-Sale Builders)',
                                        options: [],
                                    },
                                    {
                                        id: 236117,
                                        value: 'New Housing For-Sale Builders',
                                        options: [],
                                    },
                                    {
                                        id: 236118,
                                        value: 'Residential Remodelers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2362,
                        value: 'Nonresidential Building Construction',
                        options: [
                            {
                                id: 23621,
                                value: 'Industrial Building Construction',
                                options: [
                                    {
                                        id: 236210,
                                        value: 'Industrial Building Construction',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23622,
                                value: 'Commercial and Institutional Building Construction',
                                options: [
                                    {
                                        id: 236220,
                                        value: 'Commercial and Institutional Building Construction',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 237,
                value: 'Heavy and Civil Engineering Construction',
                options: [
                    {
                        id: 2371,
                        value: 'Utility System Construction',
                        options: [
                            {
                                id: 23711,
                                value: 'Water and Sewer Line and Related Structures Construction',
                                options: [
                                    {
                                        id: 237110,
                                        value: 'Water and Sewer Line and Related Structures Construction',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23712,
                                value: 'Oil and Gas Pipeline and Related Structures Construction',
                                options: [
                                    {
                                        id: 237120,
                                        value: 'Oil and Gas Pipeline and Related Structures Construction',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23713,
                                value: 'Power and Communication Line and Related Structures Construction',
                                options: [
                                    {
                                        id: 237130,
                                        value: 'Power and Communication Line and Related Structures Construction',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2372,
                        value: 'Land Subdivision',
                        options: [
                            {
                                id: 23721,
                                value: 'Land Subdivision',
                                options: [
                                    {
                                        id: 237210,
                                        value: 'Land Subdivision',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2373,
                        value: 'Highway, Street, and Bridge Construction',
                        options: [
                            {
                                id: 23731,
                                value: 'Highway, Street, and Bridge Construction',
                                options: [
                                    {
                                        id: 237310,
                                        value: 'Highway, Street, and Bridge Construction',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2379,
                        value: 'Other Heavy and Civil Engineering Construction',
                        options: [
                            {
                                id: 23799,
                                value: 'Other Heavy and Civil Engineering Construction',
                                options: [
                                    {
                                        id: 237990,
                                        value: 'Other Heavy and Civil Engineering Construction',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 238,
                value: 'Specialty Trade Contractors',
                options: [
                    {
                        id: 2381,
                        value: 'Foundation, Structure, and Building Exterior Contractors',
                        options: [
                            {
                                id: 23811,
                                value: 'Poured Concrete Foundation and Structure Contractors',
                                options: [
                                    {
                                        id: 238110,
                                        value: 'Poured Concrete Foundation and Structure Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23812,
                                value: 'Structural Steel and Precast Concrete Contractors',
                                options: [
                                    {
                                        id: 238120,
                                        value: 'Structural Steel and Precast Concrete Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23813,
                                value: 'Framing Contractors',
                                options: [
                                    {
                                        id: 238130,
                                        value: 'Framing Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23814,
                                value: 'Masonry Contractors',
                                options: [
                                    {
                                        id: 238140,
                                        value: 'Masonry Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23815,
                                value: 'Glass and Glazing Contractors',
                                options: [
                                    {
                                        id: 238150,
                                        value: 'Glass and Glazing Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23816,
                                value: 'Roofing Contractors',
                                options: [
                                    {
                                        id: 238160,
                                        value: 'Roofing Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23817,
                                value: 'Siding Contractors',
                                options: [
                                    {
                                        id: 238170,
                                        value: 'Siding Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23819,
                                value: 'Other Foundation, Structure, and Building Exterior Contractors',
                                options: [
                                    {
                                        id: 238190,
                                        value: 'Other Foundation, Structure, and Building Exterior Contractors',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2382,
                        value: 'Building Equipment Contractors',
                        options: [
                            {
                                id: 23821,
                                value: 'Electrical Contractors and Other Wiring Installation Contractors',
                                options: [
                                    {
                                        id: 238210,
                                        value: 'Electrical Contractors and Other Wiring Installation Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23822,
                                value: 'Plumbing, Heating, and Air-Conditioning Contractors',
                                options: [
                                    {
                                        id: 238220,
                                        value: 'Plumbing, Heating, and Air-Conditioning Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23829,
                                value: 'Other Building Equipment Contractors',
                                options: [
                                    {
                                        id: 238290,
                                        value: 'Other Building Equipment Contractors',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2383,
                        value: 'Building Finishing Contractors',
                        options: [
                            {
                                id: 23831,
                                value: 'Drywall and Insulation Contractors',
                                options: [
                                    {
                                        id: 238310,
                                        value: 'Drywall and Insulation Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23832,
                                value: 'Painting and Wall Covering Contractors',
                                options: [
                                    {
                                        id: 238320,
                                        value: 'Painting and Wall Covering Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23833,
                                value: 'Flooring Contractors',
                                options: [
                                    {
                                        id: 238330,
                                        value: 'Flooring Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23834,
                                value: 'Tile and Terrazzo Contractors',
                                options: [
                                    {
                                        id: 238340,
                                        value: 'Tile and Terrazzo Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23835,
                                value: 'Finish Carpentry Contractors',
                                options: [
                                    {
                                        id: 238350,
                                        value: 'Finish Carpentry Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23839,
                                value: 'Other Building Finishing Contractors',
                                options: [
                                    {
                                        id: 238390,
                                        value: 'Other Building Finishing Contractors',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 2389,
                        value: 'Other Specialty Trade Contractors',
                        options: [
                            {
                                id: 23891,
                                value: 'Site Preparation Contractors',
                                options: [
                                    {
                                        id: 238910,
                                        value: 'Site Preparation Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 23899,
                                value: 'All Other Specialty Trade Contractors',
                                options: [
                                    {
                                        id: 238990,
                                        value: 'All Other Specialty Trade Contractors',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 31,
        value: 'Manufacturing',
        options: [
            {
                id: 311,
                value: 'Food Manufacturing',
                options: [
                    {
                        id: 3111,
                        value: 'Animal Food Manufacturing',
                        options: [
                            {
                                id: 31111,
                                value: 'Animal Food Manufacturing',
                                options: [
                                    {
                                        id: 311111,
                                        value: 'Dog and Cat Food Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311119,
                                        value: 'Other Animal Food Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3112,
                        value: 'Grain and Oilseed Milling',
                        options: [
                            {
                                id: 31121,
                                value: 'Flour Milling and Malt Manufacturing',
                                options: [
                                    {
                                        id: 311211,
                                        value: 'Flour Milling',
                                        options: [],
                                    },
                                    {
                                        id: 311212,
                                        value: 'Rice Milling',
                                        options: [],
                                    },
                                    {
                                        id: 311213,
                                        value: 'Malt Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31122,
                                value: 'Starch and Vegetable Fats and Oils Manufacturing',
                                options: [
                                    {
                                        id: 311221,
                                        value: 'Wet Corn Milling',
                                        options: [],
                                    },
                                    {
                                        id: 311224,
                                        value: 'Soybean and Other Oilseed Processing',
                                        options: [],
                                    },
                                    {
                                        id: 311225,
                                        value: 'Fats and Oils Refining and Blending',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31123,
                                value: 'Breakfast Cereal Manufacturing',
                                options: [
                                    {
                                        id: 311230,
                                        value: 'Breakfast Cereal Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3113,
                        value: 'Sugar and Confectionery Product Manufacturing',
                        options: [
                            {
                                id: 31131,
                                value: 'Sugar Manufacturing',
                                options: [
                                    {
                                        id: 311313,
                                        value: 'Beet Sugar Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311314,
                                        value: 'Cane Sugar Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31134,
                                value: 'Nonchocolate Confectionery Manufacturing',
                                options: [
                                    {
                                        id: 311340,
                                        value: 'Nonchocolate Confectionery Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31135,
                                value: 'Chocolate and Confectionery Manufacturing',
                                options: [
                                    {
                                        id: 311351,
                                        value: 'Chocolate and Confectionery Manufacturing from Cacao Beans',
                                        options: [],
                                    },
                                    {
                                        id: 311352,
                                        value: 'Confectionery Manufacturing from Purchased Chocolate',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3114,
                        value: 'Fruit and Vegetable Preserving and Specialty Food Manufacturing',
                        options: [
                            {
                                id: 31141,
                                value: 'Frozen Food Manufacturing',
                                options: [
                                    {
                                        id: 311411,
                                        value: 'Frozen Fruit, Juice, and Vegetable Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311412,
                                        value: 'Frozen Specialty Food Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31142,
                                value: 'Fruit and Vegetable Canning, Pickling, and Drying',
                                options: [
                                    {
                                        id: 311421,
                                        value: 'Fruit and Vegetable Canning',
                                        options: [],
                                    },
                                    {
                                        id: 311422,
                                        value: 'Specialty Canning',
                                        options: [],
                                    },
                                    {
                                        id: 311423,
                                        value: 'Dried and Dehydrated Food Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3115,
                        value: 'Dairy Product Manufacturing',
                        options: [
                            {
                                id: 31151,
                                value: 'Dairy Product (except Frozen) Manufacturing',
                                options: [
                                    {
                                        id: 311511,
                                        value: 'Fluid Milk Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311512,
                                        value: 'Creamery Butter Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311513,
                                        value: 'Cheese Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311514,
                                        value: 'Dry, Condensed, and Evaporated Dairy Product Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31152,
                                value: 'Ice Cream and Frozen Dessert Manufacturing',
                                options: [
                                    {
                                        id: 311520,
                                        value: 'Ice Cream and Frozen Dessert Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3116,
                        value: 'Animal Slaughtering and Processing',
                        options: [
                            {
                                id: 31161,
                                value: 'Animal Slaughtering and Processing',
                                options: [
                                    {
                                        id: 311611,
                                        value: 'Animal (except Poultry) Slaughtering',
                                        options: [],
                                    },
                                    {
                                        id: 311612,
                                        value: 'Meat Processed from Carcasses',
                                        options: [],
                                    },
                                    {
                                        id: 311613,
                                        value: 'Rendering and Meat Byproduct Processing',
                                        options: [],
                                    },
                                    {
                                        id: 311615,
                                        value: 'Poultry Processing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3117,
                        value: 'Seafood Product Preparation and Packaging',
                        options: [
                            {
                                id: 31171,
                                value: 'Seafood Product Preparation and Packaging',
                                options: [
                                    {
                                        id: 311710,
                                        value: 'Seafood Product Preparation and Packaging',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3118,
                        value: 'Bakeries and Tortilla Manufacturing',
                        options: [
                            {
                                id: 31181,
                                value: 'Bread and Bakery Product Manufacturing',
                                options: [
                                    {
                                        id: 311811,
                                        value: 'Retail Bakeries',
                                        options: [],
                                    },
                                    {
                                        id: 311812,
                                        value: 'Commercial Bakeries',
                                        options: [],
                                    },
                                    {
                                        id: 311813,
                                        value: 'Frozen Cakes, Pies, and Other Pastries Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31182,
                                value: 'Cookie, Cracker, and Pasta Manufacturing',
                                options: [
                                    {
                                        id: 311821,
                                        value: 'Cookie and Cracker Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311824,
                                        value: 'Dry Pasta, Dough, and Flour Mixes Manufacturing from Purchased Flour',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31183,
                                value: 'Tortilla Manufacturing',
                                options: [
                                    {
                                        id: 311830,
                                        value: 'Tortilla Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3119,
                        value: 'Other Food Manufacturing',
                        options: [
                            {
                                id: 31191,
                                value: 'Snack Food Manufacturing',
                                options: [
                                    {
                                        id: 311911,
                                        value: 'Roasted Nuts and Peanut Butter Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311919,
                                        value: 'Other Snack Food Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31192,
                                value: 'Coffee and Tea Manufacturing',
                                options: [
                                    {
                                        id: 311920,
                                        value: 'Coffee and Tea Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31193,
                                value: 'Flavoring Syrup and Concentrate Manufacturing',
                                options: [
                                    {
                                        id: 311930,
                                        value: 'Flavoring Syrup and Concentrate Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31194,
                                value: 'Seasoning and Dressing Manufacturing',
                                options: [
                                    {
                                        id: 311941,
                                        value: 'Mayonnaise, Dressing, and Other Prepared Sauce Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311942,
                                        value: 'Spice and Extract Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31199,
                                value: 'All Other Food Manufacturing',
                                options: [
                                    {
                                        id: 311991,
                                        value: 'Perishable Prepared Food Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 311999,
                                        value: 'All Other Miscellaneous Food Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 312,
                value: 'Beverage and Tobacco Product Manufacturing',
                options: [
                    {
                        id: 3121,
                        value: 'Beverage Manufacturing',
                        options: [
                            {
                                id: 31211,
                                value: 'Soft Drink and Ice Manufacturing',
                                options: [
                                    {
                                        id: 312111,
                                        value: 'Soft Drink Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 312112,
                                        value: 'Bottled Water Manufacturing',
                                        options: [],
                                    },
                                    {
                                        id: 312113,
                                        value: 'Ice Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31212,
                                value: 'Breweries',
                                options: [
                                    {
                                        id: 312120,
                                        value: 'Breweries',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31213,
                                value: 'Wineries',
                                options: [
                                    {
                                        id: 312130,
                                        value: 'Wineries',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31214,
                                value: 'Distilleries',
                                options: [
                                    {
                                        id: 312140,
                                        value: 'Distilleries',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3122,
                        value: 'Tobacco Manufacturing',
                        options: [
                            {
                                id: 31223,
                                value: 'Tobacco Manufacturing',
                                options: [
                                    {
                                        id: 312230,
                                        value: 'Tobacco Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 313,
                value: 'Textile Mills',
                options: [
                    {
                        id: 3131,
                        value: 'Fiber, Yarn, and Thread Mills',
                        options: [
                            {
                                id: 31311,
                                value: 'Fiber, Yarn, and Thread Mills',
                                options: [
                                    {
                                        id: 313110,
                                        value: 'Fiber, Yarn, and Thread Mills',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3132,
                        value: 'Fabric Mills',
                        options: [
                            {
                                id: 31321,
                                value: 'Broadwoven Fabric Mills',
                                options: [
                                    {
                                        id: 313210,
                                        value: 'Broadwoven Fabric Mills',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31322,
                                value: 'Narrow Fabric Mills and Schiffli Machine Embroidery',
                                options: [
                                    {
                                        id: 313220,
                                        value: 'Narrow Fabric Mills and Schiffli Machine Embroidery',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31323,
                                value: 'Nonwoven Fabric Mills',
                                options: [
                                    {
                                        id: 313230,
                                        value: 'Nonwoven Fabric Mills',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31324,
                                value: 'Knit Fabric Mills',
                                options: [
                                    {
                                        id: 313240,
                                        value: 'Knit Fabric Mills',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3133,
                        value: 'Textile and Fabric Finishing and Fabric Coating Mills',
                        options: [
                            {
                                id: 31331,
                                value: 'Textile and Fabric Finishing Mills',
                                options: [
                                    {
                                        id: 313310,
                                        value: 'Textile and Fabric Finishing Mills',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31332,
                                value: 'Fabric Coating Mills',
                                options: [
                                    {
                                        id: 313320,
                                        value: 'Fabric Coating Mills',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 314,
                value: 'Textile Product Mills',
                options: [
                    {
                        id: 3141,
                        value: 'Textile Furnishings Mills',
                        options: [
                            {
                                id: 31411,
                                value: 'Carpet and Rug Mills',
                                options: [
                                    {
                                        id: 314110,
                                        value: 'Carpet and Rug Mills',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31412,
                                value: 'Curtain and Linen Mills',
                                options: [
                                    {
                                        id: 314120,
                                        value: 'Curtain and Linen Mills',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3149,
                        value: 'Other Textile Product Mills',
                        options: [
                            {
                                id: 31491,
                                value: 'Textile Bag and Canvas Mills',
                                options: [
                                    {
                                        id: 314910,
                                        value: 'Textile Bag and Canvas Mills',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31499,
                                value: 'All Other Textile Product Mills',
                                options: [
                                    {
                                        id: 314994,
                                        value: 'Rope, Cordage, Twine, Tire Cord, and Tire Fabric Mills',
                                        options: [],
                                    },
                                    {
                                        id: 314999,
                                        value: 'All Other Miscellaneous Textile Product Mills',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 315,
                value: 'Apparel Manufacturing',
                options: [
                    {
                        id: 3151,
                        value: 'Apparel Knitting Mills',
                        options: [
                            {
                                id: 31511,
                                value: 'Hosiery and Sock Mills',
                                options: [
                                    {
                                        id: 315110,
                                        value: 'Hosiery and Sock Mills',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31519,
                                value: 'Other Apparel Knitting Mills',
                                options: [
                                    {
                                        id: 315190,
                                        value: 'Other Apparel Knitting Mills',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3152,
                        value: 'Cut and Sew Apparel Manufacturing',
                        options: [
                            {
                                id: 31521,
                                value: 'Cut and Sew Apparel Contractors',
                                options: [
                                    {
                                        id: 315210,
                                        value: 'Cut and Sew Apparel Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31522,
                                value: 'Men’s and Boys’ Cut and Sew Apparel Manufacturing',
                                options: [
                                    {
                                        id: 315220,
                                        value: 'Men’s and Boys’ Cut and Sew Apparel Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31524,
                                value: 'Women’s, Girls’, and Infants’ Cut and Sew Apparel Manufacturing',
                                options: [
                                    {
                                        id: 315240,
                                        value: 'Women’s, Girls’, and Infants’ Cut and Sew Apparel Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 31528,
                                value: 'Other Cut and Sew Apparel Manufacturing',
                                options: [
                                    {
                                        id: 315280,
                                        value: 'Other Cut and Sew Apparel Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3159,
                        value: 'Apparel Accessories and Other Apparel Manufacturing',
                        options: [
                            {
                                id: 31599,
                                value: 'Apparel Accessories and Other Apparel Manufacturing',
                                options: [
                                    {
                                        id: 315990,
                                        value: 'Apparel Accessories and Other Apparel Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 316,
                value: 'Leather and Allied Product Manufacturing',
                options: [
                    {
                        id: 3161,
                        value: 'Leather and Hide Tanning and Finishing',
                        options: [
                            {
                                id: 31611,
                                value: 'Leather and Hide Tanning and Finishing',
                                options: [
                                    {
                                        id: 316110,
                                        value: 'Leather and Hide Tanning and Finishing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3162,
                        value: 'Footwear Manufacturing',
                        options: [
                            {
                                id: 31621,
                                value: 'Footwear Manufacturing',
                                options: [
                                    {
                                        id: 316210,
                                        value: 'Footwear Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 3169,
                        value: 'Other Leather and Allied Product Manufacturing',
                        options: [
                            {
                                id: 31699,
                                value: 'Other Leather and Allied Product Manufacturing',
                                options: [
                                    {
                                        id: 316992,
                                        value: "Women's Handbag and Purse Manufacturing",
                                        options: [],
                                    },
                                    {
                                        id: 316998,
                                        value: 'All Other Leather Good and Allied Product Manufacturing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 321,
        value: 'Wood Product Manufacturing',
        options: [
            {
                id: 3211,
                value: 'Sawmills and Wood Preservation',
                options: [
                    {
                        id: 32111,
                        value: 'Sawmills and Wood Preservation',
                        options: [
                            {
                                id: 321113,
                                value: 'Sawmills',
                                options: [],
                            },
                            {
                                id: 321114,
                                value: 'Wood Preservation',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3212,
                value: 'Veneer, Plywood, and Engineered Wood Product Manufacturing',
                options: [
                    {
                        id: 32121,
                        value: 'Veneer, Plywood, and Engineered Wood Product Manufacturing',
                        options: [
                            {
                                id: 321211,
                                value: 'Hardwood Veneer and Plywood Manufacturing',
                                options: [],
                            },
                            {
                                id: 321212,
                                value: 'Softwood Veneer and Plywood Manufacturing',
                                options: [],
                            },
                            {
                                id: 321213,
                                value: 'Engineered Wood Member (except Truss) Manufacturing',
                                options: [],
                            },
                            {
                                id: 321214,
                                value: 'Truss Manufacturing',
                                options: [],
                            },
                            {
                                id: 321219,
                                value: 'Reconstituted Wood Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3219,
                value: 'Other Wood Product Manufacturing',
                options: [
                    {
                        id: 32191,
                        value: 'Millwork',
                        options: [
                            {
                                id: 321911,
                                value: 'Wood Window and Door Manufacturing',
                                options: [],
                            },
                            {
                                id: 321912,
                                value: 'Cut Stock, Resawing Lumber, and Planing',
                                options: [],
                            },
                            {
                                id: 321918,
                                value: 'Other Millwork (including Flooring)',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32192,
                        value: 'Wood Container and Pallet Manufacturing',
                        options: [
                            {
                                id: 321920,
                                value: 'Wood Container and Pallet Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32199,
                        value: 'All Other Wood Product Manufacturing',
                        options: [
                            {
                                id: 321991,
                                value: 'Manufactured Home (Mobile Home) Manufacturing',
                                options: [],
                            },
                            {
                                id: 321992,
                                value: 'Prefabricated Wood Building Manufacturing',
                                options: [],
                            },
                            {
                                id: 321999,
                                value: 'All Other Miscellaneous Wood Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 322,
        value: 'Paper Manufacturing',
        options: [
            {
                id: 3221,
                value: 'Pulp, Paper, and Paperboard Mills',
                options: [
                    {
                        id: 32211,
                        value: 'Pulp Mills',
                        options: [
                            {
                                id: 322110,
                                value: 'Pulp Mills',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32212,
                        value: 'Paper Mills',
                        options: [
                            {
                                id: 322121,
                                value: 'Paper (except Newsprint) Mills',
                                options: [],
                            },
                            {
                                id: 322122,
                                value: 'Newsprint Mills',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32213,
                        value: 'Paperboard Mills',
                        options: [
                            {
                                id: 322130,
                                value: 'Paperboard Mills',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3222,
                value: 'Converted Paper Product Manufacturing',
                options: [
                    {
                        id: 32221,
                        value: 'Paperboard Container Manufacturing',
                        options: [
                            {
                                id: 322211,
                                value: 'Corrugated and Solid Fiber Box Manufacturing',
                                options: [],
                            },
                            {
                                id: 322212,
                                value: 'Folding Paperboard Box Manufacturing',
                                options: [],
                            },
                            {
                                id: 322219,
                                value: 'Other Paperboard Container Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32222,
                        value: 'Paper Bag and Coated and Treated Paper Manufacturing',
                        options: [
                            {
                                id: 322220,
                                value: 'Paper Bag and Coated and Treated Paper Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32223,
                        value: 'Stationery Product Manufacturing',
                        options: [
                            {
                                id: 322230,
                                value: 'Stationery Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32229,
                        value: 'Other Converted Paper Product Manufacturing',
                        options: [
                            {
                                id: 322291,
                                value: 'Sanitary Paper Product Manufacturing',
                                options: [],
                            },
                            {
                                id: 322299,
                                value: 'All Other Converted Paper Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 323,
        value: 'Printing and Related Support Activities',
        options: [
            {
                id: 3231,
                value: 'Printing and Related Support Activities',
                options: [
                    {
                        id: 32311,
                        value: 'Printing',
                        options: [
                            {
                                id: 323111,
                                value: 'Commercial Printing (except Screen and Books)',
                                options: [],
                            },
                            {
                                id: 323113,
                                value: 'Commercial Screen Printing',
                                options: [],
                            },
                            {
                                id: 323117,
                                value: 'Books Printing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32312,
                        value: 'Support Activities for Printing',
                        options: [
                            {
                                id: 323120,
                                value: 'Support Activities for Printing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 324,
        value: 'Petroleum and Coal Products Manufacturing',
        options: [
            {
                id: 3241,
                value: 'Petroleum and Coal Products Manufacturing',
                options: [
                    {
                        id: 32411,
                        value: 'Petroleum Refineries',
                        options: [
                            {
                                id: 324110,
                                value: 'Petroleum Refineries',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32412,
                        value: 'Asphalt Paving, Roofing, and Saturated Materials Manufacturing',
                        options: [
                            {
                                id: 324121,
                                value: 'Asphalt Paving Mixture and Block Manufacturing',
                                options: [],
                            },
                            {
                                id: 324122,
                                value: 'Asphalt Shingle and Coating Materials Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32419,
                        value: 'Other Petroleum and Coal Products Manufacturing',
                        options: [
                            {
                                id: 324191,
                                value: 'Petroleum Lubricating Oil and Grease Manufacturing',
                                options: [],
                            },
                            {
                                id: 324199,
                                value: 'All Other Petroleum and Coal Products Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 325,
        value: 'Chemical Manufacturing',
        options: [
            {
                id: 3251,
                value: 'Basic Chemical Manufacturing',
                options: [
                    {
                        id: 32511,
                        value: 'Petrochemical Manufacturing',
                        options: [
                            {
                                id: 325110,
                                value: 'Petrochemical Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32512,
                        value: 'Industrial Gas Manufacturing',
                        options: [
                            {
                                id: 325120,
                                value: 'Industrial Gas Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32513,
                        value: 'Synthetic Dye and Pigment Manufacturing',
                        options: [
                            {
                                id: 325130,
                                value: 'Synthetic Dye and Pigment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32518,
                        value: 'Other Basic Inorganic Chemical Manufacturing',
                        options: [
                            {
                                id: 325180,
                                value: 'Other Basic Inorganic Chemical Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32519,
                        value: 'Other Basic Organic Chemical Manufacturing',
                        options: [
                            {
                                id: 325193,
                                value: 'Ethyl Alcohol Manufacturing',
                                options: [],
                            },
                            {
                                id: 325194,
                                value: 'Cyclic Crude, Intermediate, and Gum and Wood Chemical Manufacturing',
                                options: [],
                            },
                            {
                                id: 325199,
                                value: 'All Other Basic Organic Chemical Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3252,
                value: 'Resin, Synthetic Rubber, and Artificial and Synthetic Fibers and Filaments Manufacturing',
                options: [
                    {
                        id: 32521,
                        value: 'Resin and Synthetic Rubber Manufacturing',
                        options: [
                            {
                                id: 325211,
                                value: 'Plastics Material and Resin Manufacturing',
                                options: [],
                            },
                            {
                                id: 325212,
                                value: 'Synthetic Rubber Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32522,
                        value: 'Artificial and Synthetic Fibers and Filaments Manufacturing',
                        options: [
                            {
                                id: 325220,
                                value: 'Artificial and Synthetic Fibers and Filaments Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3253,
                value: 'Pesticide, Fertilizer, and Other Agricultural Chemical Manufacturing',
                options: [
                    {
                        id: 32531,
                        value: 'Fertilizer Manufacturing',
                        options: [
                            {
                                id: 325311,
                                value: 'Nitrogenous Fertilizer Manufacturing',
                                options: [],
                            },
                            {
                                id: 325312,
                                value: 'Phosphatic Fertilizer Manufacturing',
                                options: [],
                            },
                            {
                                id: 325314,
                                value: 'Fertilizer (Mixing Only) Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32532,
                        value: 'Pesticide and Other Agricultural Chemical Manufacturing',
                        options: [
                            {
                                id: 325320,
                                value: 'Pesticide and Other Agricultural Chemical Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3254,
                value: 'Pharmaceutical and Medicine Manufacturing',
                options: [
                    {
                        id: 32541,
                        value: 'Pharmaceutical and Medicine Manufacturing',
                        options: [
                            {
                                id: 325411,
                                value: 'Medicinal and Botanical Manufacturing',
                                options: [],
                            },
                            {
                                id: 325412,
                                value: 'Pharmaceutical Preparation Manufacturing',
                                options: [],
                            },
                            {
                                id: 325413,
                                value: 'In-Vitro Diagnostic Substance Manufacturing',
                                options: [],
                            },
                            {
                                id: 325414,
                                value: 'Biological Product (except Diagnostic) Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3255,
                value: 'Paint, Coating, and Adhesive Manufacturing',
                options: [
                    {
                        id: 32551,
                        value: 'Paint and Coating Manufacturing',
                        options: [
                            {
                                id: 325510,
                                value: 'Paint and Coating Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32552,
                        value: 'Adhesive Manufacturing',
                        options: [
                            {
                                id: 325520,
                                value: 'Adhesive Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3256,
                value: 'Soap, Cleaning Compound, and Toilet Preparation Manufacturing',
                options: [
                    {
                        id: 32561,
                        value: 'Soap and Cleaning Compound Manufacturing',
                        options: [
                            {
                                id: 325611,
                                value: 'Soap and Other Detergent Manufacturing',
                                options: [],
                            },
                            {
                                id: 325612,
                                value: 'Polish and Other Sanitation Good Manufacturing',
                                options: [],
                            },
                            {
                                id: 325613,
                                value: 'Surface Active Agent Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32562,
                        value: 'Toilet Preparation Manufacturing',
                        options: [
                            {
                                id: 325620,
                                value: 'Toilet Preparation Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3259,
                value: 'Other Chemical Product and Preparation Manufacturing',
                options: [
                    {
                        id: 32591,
                        value: 'Printing Ink Manufacturing',
                        options: [
                            {
                                id: 325910,
                                value: 'Printing Ink Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32592,
                        value: 'Explosives Manufacturing',
                        options: [
                            {
                                id: 325920,
                                value: 'Explosives Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32599,
                        value: 'All Other Chemical Product and Preparation Manufacturing',
                        options: [
                            {
                                id: 325991,
                                value: 'Custom Compounding of Purchased Resins',
                                options: [],
                            },
                            {
                                id: 325992,
                                value: 'Photographic Film, Paper, Plate, and Chemical Manufacturing',
                                options: [],
                            },
                            {
                                id: 325998,
                                value: 'All Other Miscellaneous Chemical Product and Preparation Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 326,
        value: 'Plastics and Rubber Products Manufacturing',
        options: [
            {
                id: 3261,
                value: 'Plastics Product Manufacturing',
                options: [
                    {
                        id: 32611,
                        value: 'Plastics Packaging Materials and Unlaminated Film and Sheet Manufacturing',
                        options: [
                            {
                                id: 326111,
                                value: 'Plastics Bag and Pouch Manufacturing',
                                options: [],
                            },
                            {
                                id: 326112,
                                value: 'Plastics Packaging Film and Sheet (including Laminated) Manufacturing',
                                options: [],
                            },
                            {
                                id: 326113,
                                value: 'Unlaminated Plastics Film and Sheet (except Packaging) Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32612,
                        value: 'Plastics Pipe, Pipe Fitting, and Unlaminated Profile Shape Manufacturing',
                        options: [
                            {
                                id: 326121,
                                value: 'Unlaminated Plastics Profile Shape Manufacturing',
                                options: [],
                            },
                            {
                                id: 326122,
                                value: 'Plastics Pipe and Pipe Fitting Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32613,
                        value: 'Laminated Plastics Plate, Sheet (except Packaging), and Shape Manufacturing',
                        options: [
                            {
                                id: 326130,
                                value: 'Laminated Plastics Plate, Sheet (except Packaging), and Shape Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32614,
                        value: 'Polystyrene Foam Product Manufacturing',
                        options: [
                            {
                                id: 326140,
                                value: 'Polystyrene Foam Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32615,
                        value: 'Urethane and Other Foam Product (except Polystyrene) Manufacturing',
                        options: [
                            {
                                id: 326150,
                                value: 'Urethane and Other Foam Product (except Polystyrene) Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32616,
                        value: 'Plastics Bottle Manufacturing',
                        options: [
                            {
                                id: 326160,
                                value: 'Plastics Bottle Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32619,
                        value: 'Other Plastics Product Manufacturing',
                        options: [
                            {
                                id: 326191,
                                value: 'Plastics Plumbing Fixture Manufacturing',
                                options: [],
                            },
                            {
                                id: 326199,
                                value: 'All Other Plastics Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3262,
                value: 'Rubber Product Manufacturing',
                options: [
                    {
                        id: 32621,
                        value: 'Tire Manufacturing',
                        options: [
                            {
                                id: 326211,
                                value: 'Tire Manufacturing (except Retreading)',
                                options: [],
                            },
                            {
                                id: 326212,
                                value: 'Tire Retreading',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32622,
                        value: 'Rubber and Plastics Hoses and Belting Manufacturing',
                        options: [
                            {
                                id: 326220,
                                value: 'Rubber and Plastics Hoses and Belting Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32629,
                        value: 'Other Rubber Product Manufacturing',
                        options: [
                            {
                                id: 326291,
                                value: 'Rubber Product Manufacturing for Mechanical Use',
                                options: [],
                            },
                            {
                                id: 326299,
                                value: 'All Other Rubber Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 327,
        value: 'Nonmetallic Mineral Product Manufacturing',
        options: [
            {
                id: 3271,
                value: 'Clay Product and Refractory Manufacturing',
                options: [
                    {
                        id: 32711,
                        value: 'Pottery, Ceramics, and Plumbing Fixture Manufacturing',
                        options: [
                            {
                                id: 327110,
                                value: 'Pottery, Ceramics, and Plumbing Fixture Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32712,
                        value: 'Clay Building Material and Refractories Manufacturing',
                        options: [
                            {
                                id: 327120,
                                value: 'Clay Building Material and Refractories Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3272,
                value: 'Glass and Glass Product Manufacturing',
                options: [
                    {
                        id: 32721,
                        value: 'Glass and Glass Product Manufacturing',
                        options: [
                            {
                                id: 327211,
                                value: 'Flat Glass Manufacturing',
                                options: [],
                            },
                            {
                                id: 327212,
                                value: 'Other Pressed and Blown Glass and Glassware Manufacturing',
                                options: [],
                            },
                            {
                                id: 327213,
                                value: 'Glass Container Manufacturing',
                                options: [],
                            },
                            {
                                id: 327215,
                                value: 'Glass Product Manufacturing Made of Purchased Glass',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3273,
                value: 'Cement and Concrete Product Manufacturing',
                options: [
                    {
                        id: 32731,
                        value: 'Cement Manufacturing',
                        options: [
                            {
                                id: 327310,
                                value: 'Cement Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32732,
                        value: 'Ready-Mix Concrete Manufacturing',
                        options: [
                            {
                                id: 327320,
                                value: 'Ready-Mix Concrete Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32733,
                        value: 'Concrete Pipe, Brick, and Block Manufacturing',
                        options: [
                            {
                                id: 327331,
                                value: 'Concrete Block and Brick Manufacturing',
                                options: [],
                            },
                            {
                                id: 327332,
                                value: 'Concrete Pipe Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32739,
                        value: 'Other Concrete Product Manufacturing',
                        options: [
                            {
                                id: 327390,
                                value: 'Other Concrete Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3274,
                value: 'Lime and Gypsum Product Manufacturing',
                options: [
                    {
                        id: 32741,
                        value: 'Lime Manufacturing',
                        options: [
                            {
                                id: 327410,
                                value: 'Lime Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32742,
                        value: 'Gypsum Product Manufacturing',
                        options: [
                            {
                                id: 327420,
                                value: 'Gypsum Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3279,
                value: 'Other Nonmetallic Mineral Product Manufacturing',
                options: [
                    {
                        id: 32791,
                        value: 'Abrasive Product Manufacturing',
                        options: [
                            {
                                id: 327910,
                                value: 'Abrasive Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 32799,
                        value: 'All Other Nonmetallic Mineral Product Manufacturing',
                        options: [
                            {
                                id: 327991,
                                value: 'Cut Stone and Stone Product Manufacturing',
                                options: [],
                            },
                            {
                                id: 327992,
                                value: 'Ground or Treated Mineral and Earth Manufacturing',
                                options: [],
                            },
                            {
                                id: 327993,
                                value: 'Mineral Wool Manufacturing',
                                options: [],
                            },
                            {
                                id: 327999,
                                value: 'All Other Miscellaneous Nonmetallic Mineral Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 331,
        value: 'Primary Metal Manufacturing',
        options: [
            {
                id: 3311,
                value: 'Iron and Steel Mills and Ferroalloy Manufacturing',
                options: [
                    {
                        id: 33111,
                        value: 'Iron and Steel Mills and Ferroalloy Manufacturing',
                        options: [
                            {
                                id: 331110,
                                value: 'Iron and Steel Mills and Ferroalloy Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3312,
                value: 'Steel Product Manufacturing from Purchased Steel',
                options: [
                    {
                        id: 33121,
                        value: 'Iron and Steel Pipe and Tube Manufacturing from Purchased Steel',
                        options: [
                            {
                                id: 331210,
                                value: 'Iron and Steel Pipe and Tube Manufacturing from Purchased Steel',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33122,
                        value: 'Rolling and Drawing of Purchased Steel',
                        options: [
                            {
                                id: 331221,
                                value: 'Rolled Steel Shape Manufacturing',
                                options: [],
                            },
                            {
                                id: 331222,
                                value: 'Steel Wire Drawing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3313,
                value: 'Alumina and Aluminum Production and Processing',
                options: [
                    {
                        id: 33131,
                        value: 'Alumina and Aluminum Production and Processing',
                        options: [
                            {
                                id: 331313,
                                value: 'Alumina Refining and Primary Aluminum Production',
                                options: [],
                            },
                            {
                                id: 331314,
                                value: 'Secondary Smelting and Alloying of Aluminum',
                                options: [],
                            },
                            {
                                id: 331315,
                                value: 'Aluminum Sheet, Plate, and Foil Manufacturing',
                                options: [],
                            },
                            {
                                id: 331318,
                                value: 'Other Aluminum Rolling, Drawing, and Extruding',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3314,
                value: 'Nonferrous Metal (except Aluminum) Production and Processing',
                options: [
                    {
                        id: 33141,
                        value: 'Nonferrous Metal (except Aluminum) Smelting and Refining',
                        options: [
                            {
                                id: 331410,
                                value: 'Nonferrous Metal (except Aluminum) Smelting and Refining',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33142,
                        value: 'Copper Rolling, Drawing, Extruding, and Alloying',
                        options: [
                            {
                                id: 331420,
                                value: 'Copper Rolling, Drawing, Extruding, and Alloying',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33149,
                        value: 'Nonferrous Metal (except Copper and Aluminum) Rolling, Drawing, Extruding, and Alloying',
                        options: [
                            {
                                id: 331491,
                                value: 'Nonferrous Metal (except Copper and Aluminum) Rolling, Drawing, and Extruding',
                                options: [],
                            },
                            {
                                id: 331492,
                                value: 'Secondary Smelting, Refining, and Alloying of Nonferrous Metal (except Copper and Aluminum)',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3315,
                value: 'Foundries',
                options: [
                    {
                        id: 33151,
                        value: 'Ferrous Metal Foundries',
                        options: [
                            {
                                id: 331511,
                                value: 'Iron Foundries',
                                options: [],
                            },
                            {
                                id: 331512,
                                value: 'Steel Investment Foundries',
                                options: [],
                            },
                            {
                                id: 331513,
                                value: 'Steel Foundries (except Investment)',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33152,
                        value: 'Nonferrous Metal Foundries',
                        options: [
                            {
                                id: 331523,
                                value: 'Nonferrous Metal Die-Casting Foundries',
                                options: [],
                            },
                            {
                                id: 331524,
                                value: 'Aluminum Foundries (except Die-Casting)',
                                options: [],
                            },
                            {
                                id: 331529,
                                value: 'Other Nonferrous Metal Foundries (except Die-Casting)',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 332,
        value: 'Fabricated Metal Product Manufacturing',
        options: [
            {
                id: 3321,
                value: 'Forging and Stamping',
                options: [
                    {
                        id: 33211,
                        value: 'Forging and Stamping',
                        options: [
                            {
                                id: 332111,
                                value: 'Iron and Steel Forging',
                                options: [],
                            },
                            {
                                id: 332112,
                                value: 'Nonferrous Forging',
                                options: [],
                            },
                            {
                                id: 332114,
                                value: 'Custom Roll Forming',
                                options: [],
                            },
                            {
                                id: 332117,
                                value: 'Powder Metallurgy Part Manufacturing',
                                options: [],
                            },
                            {
                                id: 332119,
                                value: 'Metal Crown, Closure, and Other Metal Stamping (except Automotive)',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3322,
                value: 'Cutlery and Handtool Manufacturing',
                options: [
                    {
                        id: 33221,
                        value: 'Cutlery and Handtool Manufacturing',
                        options: [
                            {
                                id: 332215,
                                value: 'Metal Kitchen Cookware, Utensil, Cutlery, and Flatware (except Precious) Manufacturing',
                                options: [],
                            },
                            {
                                id: 332216,
                                value: 'Saw Blade and Handtool Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3323,
                value: 'Architectural and Structural Metals Manufacturing',
                options: [
                    {
                        id: 33231,
                        value: 'Plate Work and Fabricated Structural Product Manufacturing',
                        options: [
                            {
                                id: 332311,
                                value: 'Prefabricated Metal Building and Component Manufacturing',
                                options: [],
                            },
                            {
                                id: 332312,
                                value: 'Fabricated Structural Metal Manufacturing',
                                options: [],
                            },
                            {
                                id: 332313,
                                value: 'Plate Work Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33232,
                        value: 'Ornamental and Architectural Metal Products Manufacturing',
                        options: [
                            {
                                id: 332321,
                                value: 'Metal Window and Door Manufacturing',
                                options: [],
                            },
                            {
                                id: 332322,
                                value: 'Sheet Metal Work Manufacturing',
                                options: [],
                            },
                            {
                                id: 332323,
                                value: 'Ornamental and Architectural Metal Work Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3324,
                value: 'Boiler, Tank, and Shipping Container Manufacturing',
                options: [
                    {
                        id: 33241,
                        value: 'Power Boiler and Heat Exchanger Manufacturing',
                        options: [
                            {
                                id: 332410,
                                value: 'Power Boiler and Heat Exchanger Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33242,
                        value: 'Metal Tank (Heavy Gauge) Manufacturing',
                        options: [
                            {
                                id: 332420,
                                value: 'Metal Tank (Heavy Gauge) Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33243,
                        value: 'Metal Can, Box, and Other Metal Container (Light Gauge) Manufacturing',
                        options: [
                            {
                                id: 332431,
                                value: 'Metal Can Manufacturing',
                                options: [],
                            },
                            {
                                id: 332439,
                                value: 'Other Metal Container Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3325,
                value: 'Hardware Manufacturing',
                options: [
                    {
                        id: 33251,
                        value: 'Hardware Manufacturing',
                        options: [
                            {
                                id: 332510,
                                value: 'Hardware Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3326,
                value: 'Spring and Wire Product Manufacturing',
                options: [
                    {
                        id: 33261,
                        value: 'Spring and Wire Product Manufacturing',
                        options: [
                            {
                                id: 332613,
                                value: 'Spring Manufacturing',
                                options: [],
                            },
                            {
                                id: 332618,
                                value: 'Other Fabricated Wire Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3327,
                value: 'Machine Shops; Turned Product; and Screw, Nut, and Bolt Manufacturing',
                options: [
                    {
                        id: 33271,
                        value: 'Machine Shops',
                        options: [
                            {
                                id: 332710,
                                value: 'Machine Shops',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33272,
                        value: 'Turned Product and Screw, Nut, and Bolt Manufacturing',
                        options: [
                            {
                                id: 332721,
                                value: 'Precision Turned Product Manufacturing',
                                options: [],
                            },
                            {
                                id: 332722,
                                value: 'Bolt, Nut, Screw, Rivet, and Washer Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3328,
                value: 'Coating, Engraving, Heat Treating, and Allied Activities',
                options: [
                    {
                        id: 33281,
                        value: 'Coating, Engraving, Heat Treating, and Allied Activities',
                        options: [
                            {
                                id: 332811,
                                value: 'Metal Heat Treating',
                                options: [],
                            },
                            {
                                id: 332812,
                                value: 'Metal Coating, Engraving (except Jewelry and Silverware), and Allied Services to Manufacturers',
                                options: [],
                            },
                            {
                                id: 332813,
                                value: 'Electroplating, Plating, Polishing, Anodizing, and Coloring',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3329,
                value: 'Other Fabricated Metal Product Manufacturing',
                options: [
                    {
                        id: 33291,
                        value: 'Metal Valve Manufacturing',
                        options: [
                            {
                                id: 332911,
                                value: 'Industrial Valve Manufacturing',
                                options: [],
                            },
                            {
                                id: 332912,
                                value: 'Fluid Power Valve and Hose Fitting Manufacturing',
                                options: [],
                            },
                            {
                                id: 332913,
                                value: 'Plumbing Fixture Fitting and Trim Manufacturing',
                                options: [],
                            },
                            {
                                id: 332919,
                                value: 'Other Metal Valve and Pipe Fitting Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33299,
                        value: 'All Other Fabricated Metal Product Manufacturing',
                        options: [
                            {
                                id: 332991,
                                value: 'Ball and Roller Bearing Manufacturing',
                                options: [],
                            },
                            {
                                id: 332992,
                                value: 'Small Arms Ammunition Manufacturing',
                                options: [],
                            },
                            {
                                id: 332993,
                                value: 'Ammunition (except Small Arms) Manufacturing',
                                options: [],
                            },
                            {
                                id: 332994,
                                value: 'Small Arms, Ordnance, and Ordnance Accessories Manufacturing',
                                options: [],
                            },
                            {
                                id: 332996,
                                value: 'Fabricated Pipe and Pipe Fitting Manufacturing',
                                options: [],
                            },
                            {
                                id: 332999,
                                value: 'All Other Miscellaneous Fabricated Metal Product Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 333,
        value: 'Machinery Manufacturing',
        options: [
            {
                id: 3331,
                value: 'Agriculture, Construction, and Mining Machinery Manufacturing',
                options: [
                    {
                        id: 33311,
                        value: 'Agricultural Implement Manufacturing',
                        options: [
                            {
                                id: 333111,
                                value: 'Farm Machinery and Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333112,
                                value: 'Lawn and Garden Tractor and Home Lawn and Garden Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33312,
                        value: 'Construction Machinery Manufacturing',
                        options: [
                            {
                                id: 333120,
                                value: 'Construction Machinery Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33313,
                        value: 'Mining and Oil and Gas Field Machinery Manufacturing',
                        options: [
                            {
                                id: 333131,
                                value: 'Mining Machinery and Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333132,
                                value: 'Oil and Gas Field Machinery and Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3332,
                value: 'Industrial Machinery Manufacturing',
                options: [
                    {
                        id: 33324,
                        value: 'Industrial Machinery Manufacturing',
                        options: [
                            {
                                id: 333241,
                                value: 'Food Product Machinery Manufacturing',
                                options: [],
                            },
                            {
                                id: 333242,
                                value: 'Semiconductor Machinery Manufacturing',
                                options: [],
                            },
                            {
                                id: 333243,
                                value: 'Sawmill, Woodworking, and Paper Machinery Manufacturing',
                                options: [],
                            },
                            {
                                id: 333244,
                                value: 'Printing Machinery and Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333249,
                                value: 'Other Industrial Machinery Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3333,
                value: 'Commercial and Service Industry Machinery Manufacturing',
                options: [
                    {
                        id: 33331,
                        value: 'Commercial and Service Industry Machinery Manufacturing',
                        options: [
                            {
                                id: 333314,
                                value: 'Optical Instrument and Lens Manufacturing',
                                options: [],
                            },
                            {
                                id: 333316,
                                value: 'Photographic and Photocopying Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333318,
                                value: 'Other Commercial and Service Industry Machinery Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3334,
                value: 'Ventilation, Heating, Air-Conditioning, and Commercial Refrigeration Equipment Manufacturing',
                options: [
                    {
                        id: 33341,
                        value: 'Ventilation, Heating, Air-Conditioning, and Commercial Refrigeration Equipment Manufacturing',
                        options: [
                            {
                                id: 333413,
                                value: 'Industrial and Commercial Fan and Blower and Air Purification Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333414,
                                value: 'Heating Equipment (except Warm Air Furnaces) Manufacturing',
                                options: [],
                            },
                            {
                                id: 333415,
                                value: 'Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3335,
                value: 'Metalworking Machinery Manufacturing',
                options: [
                    {
                        id: 33351,
                        value: 'Metalworking Machinery Manufacturing',
                        options: [
                            {
                                id: 333511,
                                value: 'Industrial Mold Manufacturing',
                                options: [],
                            },
                            {
                                id: 333514,
                                value: 'Special Die and Tool, Die Set, Jig, and Fixture Manufacturing',
                                options: [],
                            },
                            {
                                id: 333515,
                                value: 'Cutting Tool and Machine Tool Accessory Manufacturing',
                                options: [],
                            },
                            {
                                id: 333517,
                                value: 'Machine Tool Manufacturing',
                                options: [],
                            },
                            {
                                id: 333519,
                                value: 'Rolling Mill and Other Metalworking Machinery Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3336,
                value: 'Engine, Turbine, and Power Transmission Equipment Manufacturing',
                options: [
                    {
                        id: 33361,
                        value: 'Engine, Turbine, and Power Transmission Equipment Manufacturing',
                        options: [
                            {
                                id: 333611,
                                value: 'Turbine and Turbine Generator Set Units Manufacturing',
                                options: [],
                            },
                            {
                                id: 333612,
                                value: 'Speed Changer, Industrial High-Speed Drive, and Gear Manufacturing',
                                options: [],
                            },
                            {
                                id: 333613,
                                value: 'Mechanical Power Transmission Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333618,
                                value: 'Other Engine Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3339,
                value: 'Other General Purpose Machinery Manufacturing',
                options: [
                    {
                        id: 33391,
                        value: 'Pump and Compressor Manufacturing',
                        options: [
                            {
                                id: 333912,
                                value: 'Air and Gas Compressor Manufacturing',
                                options: [],
                            },
                            {
                                id: 333914,
                                value: 'Measuring, Dispensing, and Other Pumping Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33392,
                        value: 'Material Handling Equipment Manufacturing',
                        options: [
                            {
                                id: 333921,
                                value: 'Elevator and Moving Stairway Manufacturing',
                                options: [],
                            },
                            {
                                id: 333922,
                                value: 'Conveyor and Conveying Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333923,
                                value: 'Overhead Traveling Crane, Hoist, and Monorail System Manufacturing',
                                options: [],
                            },
                            {
                                id: 333924,
                                value: 'Industrial Truck, Tractor, Trailer, and Stacker Machinery Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33399,
                        value: 'All Other General Purpose Machinery Manufacturing',
                        options: [
                            {
                                id: 333991,
                                value: 'Power-Driven Handtool Manufacturing',
                                options: [],
                            },
                            {
                                id: 333992,
                                value: 'Welding and Soldering Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 333993,
                                value: 'Packaging Machinery Manufacturing',
                                options: [],
                            },
                            {
                                id: 333994,
                                value: 'Industrial Process Furnace and Oven Manufacturing',
                                options: [],
                            },
                            {
                                id: 333995,
                                value: 'Fluid Power Cylinder and Actuator Manufacturing',
                                options: [],
                            },
                            {
                                id: 333996,
                                value: 'Fluid Power Pump and Motor Manufacturing',
                                options: [],
                            },
                            {
                                id: 333997,
                                value: 'Scale and Balance Manufacturing',
                                options: [],
                            },
                            {
                                id: 333999,
                                value: 'All Other Miscellaneous General Purpose Machinery Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 334,
        value: 'Computer and Electronic Product Manufacturing',
        options: [
            {
                id: 3341,
                value: 'Computer and Peripheral Equipment Manufacturing',
                options: [
                    {
                        id: 33411,
                        value: 'Computer and Peripheral Equipment Manufacturing',
                        options: [
                            {
                                id: 334111,
                                value: 'Electronic Computer Manufacturing',
                                options: [],
                            },
                            {
                                id: 334112,
                                value: 'Computer Storage Device Manufacturing',
                                options: [],
                            },
                            {
                                id: 334118,
                                value: 'Computer Terminal and Other Computer Peripheral Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3342,
                value: 'Communications Equipment Manufacturing',
                options: [
                    {
                        id: 33421,
                        value: 'Telephone Apparatus Manufacturing',
                        options: [
                            {
                                id: 334210,
                                value: 'Telephone Apparatus Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33422,
                        value: 'Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing',
                        options: [
                            {
                                id: 334220,
                                value: 'Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33429,
                        value: 'Other Communications Equipment Manufacturing',
                        options: [
                            {
                                id: 334290,
                                value: 'Other Communications Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3343,
                value: 'Audio and Video Equipment Manufacturing',
                options: [
                    {
                        id: 33431,
                        value: 'Audio and Video Equipment Manufacturing',
                        options: [
                            {
                                id: 334310,
                                value: 'Audio and Video Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3344,
                value: 'Semiconductor and Other Electronic Component Manufacturing',
                options: [
                    {
                        id: 33441,
                        value: 'Semiconductor and Other Electronic Component Manufacturing',
                        options: [
                            {
                                id: 334412,
                                value: 'Bare Printed Circuit Board Manufacturing',
                                options: [],
                            },
                            {
                                id: 334413,
                                value: 'Semiconductor and Related Device Manufacturing',
                                options: [],
                            },
                            {
                                id: 334416,
                                value: 'Capacitor, Resistor, Coil, Transformer, and Other Inductor Manufacturing',
                                options: [],
                            },
                            {
                                id: 334417,
                                value: 'Electronic Connector Manufacturing',
                                options: [],
                            },
                            {
                                id: 334418,
                                value: 'Printed Circuit Assembly (Electronic Assembly) Manufacturing',
                                options: [],
                            },
                            {
                                id: 334419,
                                value: 'Other Electronic Component Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3345,
                value: 'Navigational, Measuring, Electromedical, and Control Instruments Manufacturing',
                options: [
                    {
                        id: 33451,
                        value: 'Navigational, Measuring, Electromedical, and Control Instruments Manufacturing',
                        options: [
                            {
                                id: 334510,
                                value: 'Electromedical and Electrotherapeutic Apparatus Manufacturing',
                                options: [],
                            },
                            {
                                id: 334511,
                                value: 'Search, Detection, Navigation, Guidance, Aeronautical, and Nautical System and Instrument Manufacturing',
                                options: [],
                            },
                            {
                                id: 334512,
                                value: 'Automatic Environmental Control Manufacturing for Residential, Commercial, and Appliance Use',
                                options: [],
                            },
                            {
                                id: 334513,
                                value: 'Instruments and Related Products Manufacturing for Measuring, Displaying, and Controlling Industrial Process Variables',
                                options: [],
                            },
                            {
                                id: 334514,
                                value: 'Totalizing Fluid Meter and Counting Device Manufacturing',
                                options: [],
                            },
                            {
                                id: 334515,
                                value: 'Instrument Manufacturing for Measuring and Testing Electricity and Electrical Signals',
                                options: [],
                            },
                            {
                                id: 334516,
                                value: 'Analytical Laboratory Instrument Manufacturing',
                                options: [],
                            },
                            {
                                id: 334517,
                                value: 'Irradiation Apparatus Manufacturing',
                                options: [],
                            },
                            {
                                id: 334519,
                                value: 'Other Measuring and Controlling Device Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3346,
                value: 'Manufacturing and Reproducing Magnetic and Optical Media',
                options: [
                    {
                        id: 33461,
                        value: 'Manufacturing and Reproducing Magnetic and Optical Media',
                        options: [
                            {
                                id: 334613,
                                value: 'Blank Magnetic and Optical Recording Media Manufacturing',
                                options: [],
                            },
                            {
                                id: 334614,
                                value: 'Software and Other Prerecorded Compact Disc, Tape, and Record Reproducing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 335,
        value: 'Electrical Equipment, Appliance, and Component Manufacturing',
        options: [
            {
                id: 3351,
                value: 'Electric Lighting Equipment Manufacturing',
                options: [
                    {
                        id: 33511,
                        value: 'Electric Lamp Bulb and Part Manufacturing',
                        options: [
                            {
                                id: 335110,
                                value: 'Electric Lamp Bulb and Part Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33512,
                        value: 'Lighting Fixture Manufacturing',
                        options: [
                            {
                                id: 335121,
                                value: 'Residential Electric Lighting Fixture Manufacturing',
                                options: [],
                            },
                            {
                                id: 335122,
                                value: 'Commercial, Industrial, and Institutional Electric Lighting Fixture Manufacturing',
                                options: [],
                            },
                            {
                                id: 335129,
                                value: 'Other Lighting Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3352,
                value: 'Household Appliance Manufacturing',
                options: [
                    {
                        id: 33521,
                        value: 'Small Electrical Appliance Manufacturing',
                        options: [
                            {
                                id: 335210,
                                value: 'Small Electrical Appliance Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33522,
                        value: 'Major Household Appliance Manufacturing',
                        options: [
                            {
                                id: 335220,
                                value: 'Major Household Appliance Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3353,
                value: 'Electrical Equipment Manufacturing',
                options: [
                    {
                        id: 33531,
                        value: 'Electrical Equipment Manufacturing',
                        options: [
                            {
                                id: 335311,
                                value: 'Power, Distribution, and Specialty Transformer Manufacturing',
                                options: [],
                            },
                            {
                                id: 335312,
                                value: 'Motor and Generator Manufacturing',
                                options: [],
                            },
                            {
                                id: 335313,
                                value: 'Switchgear and Switchboard Apparatus Manufacturing',
                                options: [],
                            },
                            {
                                id: 335314,
                                value: 'Relay and Industrial Control Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3359,
                value: 'Other Electrical Equipment and Component Manufacturing',
                options: [
                    {
                        id: 33591,
                        value: 'Battery Manufacturing',
                        options: [
                            {
                                id: 335911,
                                value: 'Storage Battery Manufacturing',
                                options: [],
                            },
                            {
                                id: 335912,
                                value: 'Primary Battery Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33592,
                        value: 'Communication and Energy Wire and Cable Manufacturing',
                        options: [
                            {
                                id: 335921,
                                value: 'Fiber Optic Cable Manufacturing',
                                options: [],
                            },
                            {
                                id: 335929,
                                value: 'Other Communication and Energy Wire Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33593,
                        value: 'Wiring Device Manufacturing',
                        options: [
                            {
                                id: 335931,
                                value: 'Current-Carrying Wiring Device Manufacturing',
                                options: [],
                            },
                            {
                                id: 335932,
                                value: 'Noncurrent-Carrying Wiring Device Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33599,
                        value: 'All Other Electrical Equipment and Component Manufacturing',
                        options: [
                            {
                                id: 335991,
                                value: 'Carbon and Graphite Product Manufacturing',
                                options: [],
                            },
                            {
                                id: 335999,
                                value: 'All Other Miscellaneous Electrical Equipment and Component Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 336,
        value: 'Transportation Equipment Manufacturing',
        options: [
            {
                id: 3361,
                value: 'Motor Vehicle Manufacturing',
                options: [
                    {
                        id: 33611,
                        value: 'Automobile and Light Duty Motor Vehicle Manufacturing',
                        options: [
                            {
                                id: 336111,
                                value: 'Automobile Manufacturing',
                                options: [],
                            },
                            {
                                id: 336112,
                                value: 'Light Truck and Utility Vehicle Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33612,
                        value: 'Heavy Duty Truck Manufacturing',
                        options: [
                            {
                                id: 336120,
                                value: 'Heavy Duty Truck Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3362,
                value: 'Motor Vehicle Body and Trailer Manufacturing',
                options: [
                    {
                        id: 33621,
                        value: 'Motor Vehicle Body and Trailer Manufacturing',
                        options: [
                            {
                                id: 336211,
                                value: 'Motor Vehicle Body Manufacturing',
                                options: [],
                            },
                            {
                                id: 336212,
                                value: 'Truck Trailer Manufacturing',
                                options: [],
                            },
                            {
                                id: 336213,
                                value: 'Motor Home Manufacturing',
                                options: [],
                            },
                            {
                                id: 336214,
                                value: 'Travel Trailer and Camper Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3363,
                value: 'Motor Vehicle Parts Manufacturing',
                options: [
                    {
                        id: 33631,
                        value: 'Motor Vehicle Gasoline Engine and Engine Parts Manufacturing',
                        options: [
                            {
                                id: 336310,
                                value: 'Motor Vehicle Gasoline Engine and Engine Parts Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33632,
                        value: 'Motor Vehicle Electrical and Electronic Equipment Manufacturing',
                        options: [
                            {
                                id: 336320,
                                value: 'Motor Vehicle Electrical and Electronic Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33633,
                        value: 'Motor Vehicle Steering and Suspension Components (except Spring) Manufacturing',
                        options: [
                            {
                                id: 336330,
                                value: 'Motor Vehicle Steering and Suspension Components (except Spring) Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33634,
                        value: 'Motor Vehicle Brake System Manufacturing',
                        options: [
                            {
                                id: 336340,
                                value: 'Motor Vehicle Brake System Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33635,
                        value: 'Motor Vehicle Transmission and Power Train Parts Manufacturing',
                        options: [
                            {
                                id: 336350,
                                value: 'Motor Vehicle Transmission and Power Train Parts Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33636,
                        value: 'Motor Vehicle Seating and Interior Trim Manufacturing',
                        options: [
                            {
                                id: 336360,
                                value: 'Motor Vehicle Seating and Interior Trim Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33637,
                        value: 'Motor Vehicle Metal Stamping',
                        options: [
                            {
                                id: 336370,
                                value: 'Motor Vehicle Metal Stamping',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33639,
                        value: 'Other Motor Vehicle Parts Manufacturing',
                        options: [
                            {
                                id: 336390,
                                value: 'Other Motor Vehicle Parts Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3364,
                value: 'Aerospace Product and Parts Manufacturing',
                options: [
                    {
                        id: 33641,
                        value: 'Aerospace Product and Parts Manufacturing',
                        options: [
                            {
                                id: 336411,
                                value: 'Aircraft Manufacturing',
                                options: [],
                            },
                            {
                                id: 336412,
                                value: 'Aircraft Engine and Engine Parts Manufacturing',
                                options: [],
                            },
                            {
                                id: 336413,
                                value: 'Other Aircraft Parts and Auxiliary Equipment Manufacturing',
                                options: [],
                            },
                            {
                                id: 336414,
                                value: 'Guided Missile and Space Vehicle Manufacturing',
                                options: [],
                            },
                            {
                                id: 336415,
                                value: 'Guided Missile and Space Vehicle Propulsion Unit and Propulsion Unit Parts Manufacturing',
                                options: [],
                            },
                            {
                                id: 336419,
                                value: 'Other Guided Missile and Space Vehicle Parts and Auxiliary Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3365,
                value: 'Railroad Rolling Stock Manufacturing',
                options: [
                    {
                        id: 33651,
                        value: 'Railroad Rolling Stock Manufacturing',
                        options: [
                            {
                                id: 336510,
                                value: 'Railroad Rolling Stock Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3366,
                value: 'Ship and Boat Building',
                options: [
                    {
                        id: 33661,
                        value: 'Ship and Boat Building',
                        options: [
                            {
                                id: 336611,
                                value: 'Ship Building and Repairing',
                                options: [],
                            },
                            {
                                id: 336612,
                                value: 'Boat Building',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3369,
                value: 'Other Transportation Equipment Manufacturing',
                options: [
                    {
                        id: 33699,
                        value: 'Other Transportation Equipment Manufacturing',
                        options: [
                            {
                                id: 336991,
                                value: 'Motorcycle, Bicycle, and Parts Manufacturing',
                                options: [],
                            },
                            {
                                id: 336992,
                                value: 'Military Armored Vehicle, Tank, and Tank Component Manufacturing',
                                options: [],
                            },
                            {
                                id: 336999,
                                value: 'All Other Transportation Equipment Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 337,
        value: 'Furniture and Related Product Manufacturing',
        options: [
            {
                id: 3371,
                value: 'Household and Institutional Furniture and Kitchen Cabinet Manufacturing',
                options: [
                    {
                        id: 33711,
                        value: 'Wood Kitchen Cabinet and Countertop Manufacturing',
                        options: [
                            {
                                id: 337110,
                                value: 'Wood Kitchen Cabinet and Countertop Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33712,
                        value: 'Household and Institutional Furniture Manufacturing',
                        options: [
                            {
                                id: 337121,
                                value: 'Upholstered Household Furniture Manufacturing',
                                options: [],
                            },
                            {
                                id: 337122,
                                value: 'Nonupholstered Wood Household Furniture Manufacturing',
                                options: [],
                            },
                            {
                                id: 337124,
                                value: 'Metal Household Furniture Manufacturing',
                                options: [],
                            },
                            {
                                id: 337125,
                                value: 'Household Furniture (except Wood and Metal) Manufacturing',
                                options: [],
                            },
                            {
                                id: 337127,
                                value: 'Institutional Furniture Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3372,
                value: 'Office Furniture (including Fixtures) Manufacturing',
                options: [
                    {
                        id: 33721,
                        value: 'Office Furniture (including Fixtures) Manufacturing',
                        options: [
                            {
                                id: 337211,
                                value: 'Wood Office Furniture Manufacturing',
                                options: [],
                            },
                            {
                                id: 337212,
                                value: 'Custom Architectural Woodwork and Millwork Manufacturing',
                                options: [],
                            },
                            {
                                id: 337214,
                                value: 'Office Furniture (except Wood) Manufacturing',
                                options: [],
                            },
                            {
                                id: 337215,
                                value: 'Showcase, Partition, Shelving, and Locker Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3379,
                value: 'Other Furniture Related Product Manufacturing',
                options: [
                    {
                        id: 33791,
                        value: 'Mattress Manufacturing',
                        options: [
                            {
                                id: 337910,
                                value: 'Mattress Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33792,
                        value: 'Blind and Shade Manufacturing',
                        options: [
                            {
                                id: 337920,
                                value: 'Blind and Shade Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 339,
        value: 'Miscellaneous Manufacturing',
        options: [
            {
                id: 3391,
                value: 'Medical Equipment and Supplies Manufacturing',
                options: [
                    {
                        id: 33911,
                        value: 'Medical Equipment and Supplies Manufacturing',
                        options: [
                            {
                                id: 339112,
                                value: 'Surgical and Medical Instrument Manufacturing',
                                options: [],
                            },
                            {
                                id: 339113,
                                value: 'Surgical Appliance and Supplies Manufacturing',
                                options: [],
                            },
                            {
                                id: 339114,
                                value: 'Dental Equipment and Supplies Manufacturing',
                                options: [],
                            },
                            {
                                id: 339115,
                                value: 'Ophthalmic Goods Manufacturing',
                                options: [],
                            },
                            {
                                id: 339116,
                                value: 'Dental Laboratories',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 3399,
                value: 'Other Miscellaneous Manufacturing',
                options: [
                    {
                        id: 33991,
                        value: 'Jewelry and Silverware Manufacturing',
                        options: [
                            {
                                id: 339910,
                                value: 'Jewelry and Silverware Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33992,
                        value: 'Sporting and Athletic Goods Manufacturing',
                        options: [
                            {
                                id: 339920,
                                value: 'Sporting and Athletic Goods Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33993,
                        value: 'Doll, Toy, and Game Manufacturing',
                        options: [
                            {
                                id: 339930,
                                value: 'Doll, Toy, and Game Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33994,
                        value: 'Office Supplies (except Paper) Manufacturing',
                        options: [
                            {
                                id: 339940,
                                value: 'Office Supplies (except Paper) Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33995,
                        value: 'Sign Manufacturing',
                        options: [
                            {
                                id: 339950,
                                value: 'Sign Manufacturing',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 33999,
                        value: 'All Other Miscellaneous Manufacturing',
                        options: [
                            {
                                id: 339991,
                                value: 'Gasket, Packing, and Sealing Device Manufacturing',
                                options: [],
                            },
                            {
                                id: 339992,
                                value: 'Musical Instrument Manufacturing',
                                options: [],
                            },
                            {
                                id: 339993,
                                value: 'Fastener, Button, Needle, and Pin Manufacturing',
                                options: [],
                            },
                            {
                                id: 339994,
                                value: 'Broom, Brush, and Mop Manufacturing',
                                options: [],
                            },
                            {
                                id: 339995,
                                value: 'Burial Casket Manufacturing',
                                options: [],
                            },
                            {
                                id: 339999,
                                value: 'All Other Miscellaneous Manufacturing',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 42,
        value: 'Wholesale Trade',
        options: [
            {
                id: 423,
                value: 'Merchant Wholesalers, Durable Goods',
                options: [
                    {
                        id: 4231,
                        value: 'Motor Vehicle and Motor Vehicle Parts and Supplies Merchant Wholesalers',
                        options: [
                            {
                                id: 42311,
                                value: 'Automobile and Other Motor Vehicle Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423110,
                                        value: 'Automobile and Other Motor Vehicle Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42312,
                                value: 'Motor Vehicle Supplies and New Parts Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423120,
                                        value: 'Motor Vehicle Supplies and New Parts Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42313,
                                value: 'Tire and Tube Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423130,
                                        value: 'Tire and Tube Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42314,
                                value: 'Motor Vehicle Parts (Used) Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423140,
                                        value: 'Motor Vehicle Parts (Used) Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4232,
                        value: 'Furniture and Home Furnishing Merchant Wholesalers',
                        options: [
                            {
                                id: 42321,
                                value: 'Furniture Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423210,
                                        value: 'Furniture Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42322,
                                value: 'Home Furnishing Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423220,
                                        value: 'Home Furnishing Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4233,
                        value: 'Lumber and Other Construction Materials Merchant Wholesalers',
                        options: [
                            {
                                id: 42331,
                                value: 'Lumber, Plywood, Millwork, and Wood Panel Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423310,
                                        value: 'Lumber, Plywood, Millwork, and Wood Panel Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42332,
                                value: 'Brick, Stone, and Related Construction Material Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423320,
                                        value: 'Brick, Stone, and Related Construction Material Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42333,
                                value: 'Roofing, Siding, and Insulation Material Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423330,
                                        value: 'Roofing, Siding, and Insulation Material Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42339,
                                value: 'Other Construction Material Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423390,
                                        value: 'Other Construction Material Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4234,
                        value: 'Professional and Commercial Equipment and Supplies Merchant Wholesalers',
                        options: [
                            {
                                id: 42341,
                                value: 'Photographic Equipment and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423410,
                                        value: 'Photographic Equipment and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42342,
                                value: 'Office Equipment Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423420,
                                        value: 'Office Equipment Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42343,
                                value: 'Computer and Computer Peripheral Equipment and Software Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423430,
                                        value: 'Computer and Computer Peripheral Equipment and Software Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42344,
                                value: 'Other Commercial Equipment Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423440,
                                        value: 'Other Commercial Equipment Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42345,
                                value: 'Medical, Dental, and Hospital Equipment and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423450,
                                        value: 'Medical, Dental, and Hospital Equipment and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42346,
                                value: 'Ophthalmic Goods Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423460,
                                        value: 'Ophthalmic Goods Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42349,
                                value: 'Other Professional Equipment and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423490,
                                        value: 'Other Professional Equipment and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4235,
                        value: 'Metal and Mineral (except Petroleum) Merchant Wholesalers',
                        options: [
                            {
                                id: 42351,
                                value: 'Metal Service Centers and Other Metal Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423510,
                                        value: 'Metal Service Centers and Other Metal Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42352,
                                value: 'Coal and Other Mineral and Ore Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423520,
                                        value: 'Coal and Other Mineral and Ore Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4236,
                        value: 'Household Appliances and Electrical and Electronic Goods Merchant Wholesalers',
                        options: [
                            {
                                id: 42361,
                                value: 'Electrical Apparatus and Equipment, Wiring Supplies, and Related Equipment Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423610,
                                        value: 'Electrical Apparatus and Equipment, Wiring Supplies, and Related Equipment Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42362,
                                value: 'Household Appliances, Electric Housewares, and Consumer Electronics Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423620,
                                        value: 'Household Appliances, Electric Housewares, and Consumer Electronics Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42369,
                                value: 'Other Electronic Parts and Equipment Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423690,
                                        value: 'Other Electronic Parts and Equipment Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4237,
                        value: 'Hardware, and Plumbing and Heating Equipment and Supplies Merchant Wholesalers',
                        options: [
                            {
                                id: 42371,
                                value: 'Hardware Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423710,
                                        value: 'Hardware Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42372,
                                value: 'Plumbing and Heating Equipment and Supplies (Hydronics) Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423720,
                                        value: 'Plumbing and Heating Equipment and Supplies (Hydronics) Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42373,
                                value: 'Warm Air Heating and Air-Conditioning Equipment and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423730,
                                        value: 'Warm Air Heating and Air-Conditioning Equipment and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42374,
                                value: 'Refrigeration Equipment and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423740,
                                        value: 'Refrigeration Equipment and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4238,
                        value: 'Machinery, Equipment, and Supplies Merchant Wholesalers',
                        options: [
                            {
                                id: 42381,
                                value: 'Construction and Mining (except Oil Well) Machinery and Equipment Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423810,
                                        value: 'Construction and Mining (except Oil Well) Machinery and Equipment Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42382,
                                value: 'Farm and Garden Machinery and Equipment Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423820,
                                        value: 'Farm and Garden Machinery and Equipment Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42383,
                                value: 'Industrial Machinery and Equipment Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423830,
                                        value: 'Industrial Machinery and Equipment Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42384,
                                value: 'Industrial Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423840,
                                        value: 'Industrial Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42385,
                                value: 'Service Establishment Equipment and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423850,
                                        value: 'Service Establishment Equipment and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42386,
                                value: 'Transportation Equipment and Supplies (except Motor Vehicle) Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423860,
                                        value: 'Transportation Equipment and Supplies (except Motor Vehicle) Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4239,
                        value: 'Miscellaneous Durable Goods Merchant Wholesalers',
                        options: [
                            {
                                id: 42391,
                                value: 'Sporting and Recreational Goods and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423910,
                                        value: 'Sporting and Recreational Goods and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42392,
                                value: 'Toy and Hobby Goods and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423920,
                                        value: 'Toy and Hobby Goods and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42393,
                                value: 'Recyclable Material Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423930,
                                        value: 'Recyclable Material Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42394,
                                value: 'Jewelry, Watch, Precious Stone, and Precious Metal Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423940,
                                        value: 'Jewelry, Watch, Precious Stone, and Precious Metal Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42399,
                                value: 'Other Miscellaneous Durable Goods Merchant Wholesalers',
                                options: [
                                    {
                                        id: 423990,
                                        value: 'Other Miscellaneous Durable Goods Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 424,
                value: 'Merchant Wholesalers, Nondurable Goods',
                options: [
                    {
                        id: 4241,
                        value: 'Paper and Paper Product Merchant Wholesalers',
                        options: [
                            {
                                id: 42411,
                                value: 'Printing and Writing Paper Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424110,
                                        value: 'Printing and Writing Paper Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42412,
                                value: 'Stationery and Office Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424120,
                                        value: 'Stationery and Office Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42413,
                                value: 'Industrial and Personal Service Paper Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424130,
                                        value: 'Industrial and Personal Service Paper Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4242,
                        value: "Drugs and Druggists' Sundries Merchant Wholesalers",
                        options: [
                            {
                                id: 42421,
                                value: "Drugs and Druggists' Sundries Merchant Wholesalers",
                                options: [
                                    {
                                        id: 424210,
                                        value: "Drugs and Druggists' Sundries Merchant Wholesalers",
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4243,
                        value: 'Apparel, Piece Goods, and Notions Merchant Wholesalers',
                        options: [
                            {
                                id: 42431,
                                value: 'Piece Goods, Notions, and Other Dry Goods Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424310,
                                        value: 'Piece Goods, Notions, and Other Dry Goods Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42432,
                                value: "Men's and Boys' Clothing and Furnishings Merchant Wholesalers",
                                options: [
                                    {
                                        id: 424320,
                                        value: "Men's and Boys' Clothing and Furnishings Merchant Wholesalers",
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42433,
                                value: "Women's, Children's, and Infants' Clothing and Accessories Merchant Wholesalers",
                                options: [
                                    {
                                        id: 424330,
                                        value: "Women's, Children's, and Infants' Clothing and Accessories Merchant Wholesalers",
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42434,
                                value: 'Footwear Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424340,
                                        value: 'Footwear Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4244,
                        value: 'Grocery and Related Product Merchant Wholesalers',
                        options: [
                            {
                                id: 42441,
                                value: 'General Line Grocery Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424410,
                                        value: 'General Line Grocery Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42442,
                                value: 'Packaged Frozen Food Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424420,
                                        value: 'Packaged Frozen Food Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42443,
                                value: 'Dairy Product (except Dried or Canned) Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424430,
                                        value: 'Dairy Product (except Dried or Canned) Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42444,
                                value: 'Poultry and Poultry Product Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424440,
                                        value: 'Poultry and Poultry Product Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42445,
                                value: 'Confectionery Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424450,
                                        value: 'Confectionery Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42446,
                                value: 'Fish and Seafood Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424460,
                                        value: 'Fish and Seafood Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42447,
                                value: 'Meat and Meat Product Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424470,
                                        value: 'Meat and Meat Product Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42448,
                                value: 'Fresh Fruit and Vegetable Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424480,
                                        value: 'Fresh Fruit and Vegetable Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42449,
                                value: 'Other Grocery and Related Products Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424490,
                                        value: 'Other Grocery and Related Products Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4245,
                        value: 'Farm Product Raw Material Merchant Wholesalers',
                        options: [
                            {
                                id: 42451,
                                value: 'Grain and Field Bean Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424510,
                                        value: 'Grain and Field Bean Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42452,
                                value: 'Livestock Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424520,
                                        value: 'Livestock Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42459,
                                value: 'Other Farm Product Raw Material Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424590,
                                        value: 'Other Farm Product Raw Material Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4246,
                        value: 'Chemical and Allied Products Merchant Wholesalers',
                        options: [
                            {
                                id: 42461,
                                value: 'Plastics Materials and Basic Forms and Shapes Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424610,
                                        value: 'Plastics Materials and Basic Forms and Shapes Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42469,
                                value: 'Other Chemical and Allied Products Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424690,
                                        value: 'Other Chemical and Allied Products Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4247,
                        value: 'Petroleum and Petroleum Products Merchant Wholesalers',
                        options: [
                            {
                                id: 42471,
                                value: 'Petroleum Bulk Stations and Terminals',
                                options: [
                                    {
                                        id: 424710,
                                        value: 'Petroleum Bulk Stations and Terminals',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42472,
                                value: 'Petroleum and Petroleum Products Merchant Wholesalers (except Bulk Stations and Terminals)',
                                options: [
                                    {
                                        id: 424720,
                                        value: 'Petroleum and Petroleum Products Merchant Wholesalers (except Bulk Stations and Terminals)',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4248,
                        value: 'Beer, Wine, and Distilled Alcoholic Beverage Merchant Wholesalers',
                        options: [
                            {
                                id: 42481,
                                value: 'Beer and Ale Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424810,
                                        value: 'Beer and Ale Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42482,
                                value: 'Wine and Distilled Alcoholic Beverage Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424820,
                                        value: 'Wine and Distilled Alcoholic Beverage Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4249,
                        value: 'Miscellaneous Nondurable Goods Merchant Wholesalers',
                        options: [
                            {
                                id: 42491,
                                value: 'Farm Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424910,
                                        value: 'Farm Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42492,
                                value: 'Book, Periodical, and Newspaper Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424920,
                                        value: 'Book, Periodical, and Newspaper Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42493,
                                value: "Flower, Nursery Stock, and Florists' Supplies Merchant Wholesalers",
                                options: [
                                    {
                                        id: 424930,
                                        value: "Flower, Nursery Stock, and Florists' Supplies Merchant Wholesalers",
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42494,
                                value: 'Tobacco and Tobacco Product Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424940,
                                        value: 'Tobacco and Tobacco Product Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42495,
                                value: 'Paint, Varnish, and Supplies Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424950,
                                        value: 'Paint, Varnish, and Supplies Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42499,
                                value: 'Other Miscellaneous Nondurable Goods Merchant Wholesalers',
                                options: [
                                    {
                                        id: 424990,
                                        value: 'Other Miscellaneous Nondurable Goods Merchant Wholesalers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 425,
                value: 'Wholesale Electronic Markets and Agents and Brokers',
                options: [
                    {
                        id: 4251,
                        value: 'Wholesale Electronic Markets and Agents and Brokers',
                        options: [
                            {
                                id: 42511,
                                value: 'Business to Business Electronic Markets',
                                options: [
                                    {
                                        id: 425110,
                                        value: 'Business to Business Electronic Markets',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 42512,
                                value: 'Wholesale Trade Agents and Brokers',
                                options: [
                                    {
                                        id: 425120,
                                        value: 'Wholesale Trade Agents and Brokers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 44,
        value: 'Retail Trade',
        options: [
            {
                id: 441,
                value: 'Motor Vehicle and Parts Dealers',
                options: [
                    {
                        id: 4411,
                        value: 'Automobile Dealers',
                        options: [
                            {
                                id: 44111,
                                value: 'New Car Dealers',
                                options: [
                                    {
                                        id: 441110,
                                        value: 'New Car Dealers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44112,
                                value: 'Used Car Dealers',
                                options: [
                                    {
                                        id: 441120,
                                        value: 'Used Car Dealers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4412,
                        value: 'Other Motor Vehicle Dealers',
                        options: [
                            {
                                id: 44121,
                                value: 'Recreational Vehicle Dealers',
                                options: [
                                    {
                                        id: 441210,
                                        value: 'Recreational Vehicle Dealers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44122,
                                value: 'Motorcycle, Boat, and Other Motor Vehicle Dealers',
                                options: [
                                    {
                                        id: 441222,
                                        value: 'Boat Dealers',
                                        options: [],
                                    },
                                    {
                                        id: 441228,
                                        value: 'Motorcycle, ATV, and All Other Motor Vehicle Dealers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4413,
                        value: 'Automotive Parts, Accessories, and Tire Stores',
                        options: [
                            {
                                id: 44131,
                                value: 'Automotive Parts and Accessories Stores',
                                options: [
                                    {
                                        id: 441310,
                                        value: 'Automotive Parts and Accessories Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44132,
                                value: 'Tire Dealers',
                                options: [
                                    {
                                        id: 441320,
                                        value: 'Tire Dealers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 442,
                value: 'Furniture and Home Furnishings Stores',
                options: [
                    {
                        id: 4421,
                        value: 'Furniture Stores',
                        options: [
                            {
                                id: 44211,
                                value: 'Furniture Stores',
                                options: [
                                    {
                                        id: 442110,
                                        value: 'Furniture Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4422,
                        value: 'Home Furnishings Stores',
                        options: [
                            {
                                id: 44221,
                                value: 'Floor Covering Stores',
                                options: [
                                    {
                                        id: 442210,
                                        value: 'Floor Covering Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44229,
                                value: 'Other Home Furnishings Stores',
                                options: [
                                    {
                                        id: 442291,
                                        value: 'Window Treatment Stores',
                                        options: [],
                                    },
                                    {
                                        id: 442299,
                                        value: 'All Other Home Furnishings Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 443,
                value: 'Electronics and Appliance Stores',
                options: [
                    {
                        id: 4431,
                        value: 'Electronics and Appliance Stores',
                        options: [
                            {
                                id: 44314,
                                value: 'Electronics and Appliance Stores',
                                options: [
                                    {
                                        id: 443141,
                                        value: 'Household Appliance Stores',
                                        options: [],
                                    },
                                    {
                                        id: 443142,
                                        value: 'Electronics Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 444,
                value: 'Building Material and Garden Equipment and Supplies Dealers',
                options: [
                    {
                        id: 4441,
                        value: 'Building Material and Supplies Dealers',
                        options: [
                            {
                                id: 44411,
                                value: 'Home Centers',
                                options: [
                                    {
                                        id: 444110,
                                        value: 'Home Centers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44412,
                                value: 'Paint and Wallpaper Stores',
                                options: [
                                    {
                                        id: 444120,
                                        value: 'Paint and Wallpaper Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44413,
                                value: 'Hardware Stores',
                                options: [
                                    {
                                        id: 444130,
                                        value: 'Hardware Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44419,
                                value: 'Other Building Material Dealers',
                                options: [
                                    {
                                        id: 444190,
                                        value: 'Other Building Material Dealers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4442,
                        value: 'Lawn and Garden Equipment and Supplies Stores',
                        options: [
                            {
                                id: 44421,
                                value: 'Outdoor Power Equipment Stores',
                                options: [
                                    {
                                        id: 444210,
                                        value: 'Outdoor Power Equipment Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44422,
                                value: 'Nursery, Garden Center, and Farm Supply Stores',
                                options: [
                                    {
                                        id: 444220,
                                        value: 'Nursery, Garden Center, and Farm Supply Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 445,
                value: 'Food and Beverage Stores',
                options: [
                    {
                        id: 4451,
                        value: 'Grocery Stores',
                        options: [
                            {
                                id: 44511,
                                value: 'Supermarkets and Other Grocery (except Convenience) Stores',
                                options: [
                                    {
                                        id: 445110,
                                        value: 'Supermarkets and Other Grocery (except Convenience) Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44512,
                                value: 'Convenience Stores',
                                options: [
                                    {
                                        id: 445120,
                                        value: 'Convenience Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4452,
                        value: 'Specialty Food Stores',
                        options: [
                            {
                                id: 44521,
                                value: 'Meat Markets',
                                options: [
                                    {
                                        id: 445210,
                                        value: 'Meat Markets',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44522,
                                value: 'Fish and Seafood Markets',
                                options: [
                                    {
                                        id: 445220,
                                        value: 'Fish and Seafood Markets',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44523,
                                value: 'Fruit and Vegetable Markets',
                                options: [
                                    {
                                        id: 445230,
                                        value: 'Fruit and Vegetable Markets',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44529,
                                value: 'Other Specialty Food Stores',
                                options: [
                                    {
                                        id: 445291,
                                        value: 'Baked Goods Stores',
                                        options: [],
                                    },
                                    {
                                        id: 445292,
                                        value: 'Confectionery and Nut Stores',
                                        options: [],
                                    },
                                    {
                                        id: 445299,
                                        value: 'All Other Specialty Food Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4453,
                        value: 'Beer, Wine, and Liquor Stores',
                        options: [
                            {
                                id: 44531,
                                value: 'Beer, Wine, and Liquor Stores',
                                options: [
                                    {
                                        id: 445310,
                                        value: 'Beer, Wine, and Liquor Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 446,
                value: 'Health and Personal Care Stores',
                options: [
                    {
                        id: 4461,
                        value: 'Health and Personal Care Stores',
                        options: [
                            {
                                id: 44611,
                                value: 'Pharmacies and Drug Stores',
                                options: [
                                    {
                                        id: 446110,
                                        value: 'Pharmacies and Drug Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44612,
                                value: 'Cosmetics, Beauty Supplies, and Perfume Stores',
                                options: [
                                    {
                                        id: 446120,
                                        value: 'Cosmetics, Beauty Supplies, and Perfume Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44613,
                                value: 'Optical Goods Stores',
                                options: [
                                    {
                                        id: 446130,
                                        value: 'Optical Goods Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44619,
                                value: 'Other Health and Personal Care Stores',
                                options: [
                                    {
                                        id: 446191,
                                        value: 'Food (Health) Supplement Stores',
                                        options: [],
                                    },
                                    {
                                        id: 446199,
                                        value: 'All Other Health and Personal Care Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 447,
                value: 'Gasoline Stations',
                options: [
                    {
                        id: 4471,
                        value: 'Gasoline Stations',
                        options: [
                            {
                                id: 44711,
                                value: 'Gasoline Stations with Convenience Stores',
                                options: [
                                    {
                                        id: 447110,
                                        value: 'Gasoline Stations with Convenience Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44719,
                                value: 'Other Gasoline Stations',
                                options: [
                                    {
                                        id: 447190,
                                        value: 'Other Gasoline Stations',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 448,
                value: 'Clothing and Clothing Accessories Stores',
                options: [
                    {
                        id: 4481,
                        value: 'Clothing Stores',
                        options: [
                            {
                                id: 44811,
                                value: "Men's Clothing Stores",
                                options: [
                                    {
                                        id: 448110,
                                        value: "Men's Clothing Stores",
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44812,
                                value: "Women's Clothing Stores",
                                options: [
                                    {
                                        id: 448120,
                                        value: "Women's Clothing Stores",
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44813,
                                value: "Children's and Infants' Clothing Stores",
                                options: [
                                    {
                                        id: 448130,
                                        value: "Children's and Infants' Clothing Stores",
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44814,
                                value: 'Family Clothing Stores',
                                options: [
                                    {
                                        id: 448140,
                                        value: 'Family Clothing Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44815,
                                value: 'Clothing Accessories Stores',
                                options: [
                                    {
                                        id: 448150,
                                        value: 'Clothing Accessories Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44819,
                                value: 'Other Clothing Stores',
                                options: [
                                    {
                                        id: 448190,
                                        value: 'Other Clothing Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4482,
                        value: 'Shoe Stores',
                        options: [
                            {
                                id: 44821,
                                value: 'Shoe Stores',
                                options: [
                                    {
                                        id: 448210,
                                        value: 'Shoe Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4483,
                        value: 'Jewelry, Luggage, and Leather Goods Stores',
                        options: [
                            {
                                id: 44831,
                                value: 'Jewelry Stores',
                                options: [
                                    {
                                        id: 448310,
                                        value: 'Jewelry Stores',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 44832,
                                value: 'Luggage and Leather Goods Stores',
                                options: [
                                    {
                                        id: 448320,
                                        value: 'Luggage and Leather Goods Stores',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 451,
        value: 'Sporting Goods, Hobby, Musical Instrument, and Book Stores',
        options: [
            {
                id: 4511,
                value: 'Sporting Goods, Hobby, and Musical Instrument Stores',
                options: [
                    {
                        id: 45111,
                        value: 'Sporting Goods Stores',
                        options: [
                            {
                                id: 451110,
                                value: 'Sporting Goods Stores',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45112,
                        value: 'Hobby, Toy, and Game Stores',
                        options: [
                            {
                                id: 451120,
                                value: 'Hobby, Toy, and Game Stores',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45113,
                        value: 'Sewing, Needlework, and Piece Goods Stores',
                        options: [
                            {
                                id: 451130,
                                value: 'Sewing, Needlework, and Piece Goods Stores',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45114,
                        value: 'Musical Instrument and Supplies Stores',
                        options: [
                            {
                                id: 451140,
                                value: 'Musical Instrument and Supplies Stores',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4512,
                value: 'Book Stores and News Dealers',
                options: [
                    {
                        id: 45121,
                        value: 'Book Stores and News Dealers',
                        options: [
                            {
                                id: 451211,
                                value: 'Book Stores',
                                options: [],
                            },
                            {
                                id: 451212,
                                value: 'News Dealers and Newsstands',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 452,
        value: 'General Merchandise Stores',
        options: [
            {
                id: 4522,
                value: 'Department Stores',
                options: [
                    {
                        id: 45221,
                        value: 'Department Stores',
                        options: [
                            {
                                id: 452210,
                                value: 'Department Stores',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4523,
                value: 'General Merchandise Stores, including Warehouse Clubs and Supercenters',
                options: [
                    {
                        id: 45231,
                        value: 'General Merchandise Stores, including Warehouse Clubs and Supercenters',
                        options: [
                            {
                                id: 452311,
                                value: 'Warehouse Clubs and Supercenters',
                                options: [],
                            },
                            {
                                id: 452319,
                                value: 'All Other General Merchandise Stores',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 453,
        value: 'Miscellaneous Store Retailers',
        options: [
            {
                id: 4531,
                value: 'Florists',
                options: [
                    {
                        id: 45311,
                        value: 'Florists',
                        options: [
                            {
                                id: 453110,
                                value: 'Florists',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4532,
                value: 'Office Supplies, Stationery, and Gift Stores',
                options: [
                    {
                        id: 45321,
                        value: 'Office Supplies and Stationery Stores',
                        options: [
                            {
                                id: 453210,
                                value: 'Office Supplies and Stationery Stores',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45322,
                        value: 'Gift, Novelty, and Souvenir Stores',
                        options: [
                            {
                                id: 453220,
                                value: 'Gift, Novelty, and Souvenir Stores',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4533,
                value: 'Used Merchandise Stores',
                options: [
                    {
                        id: 45331,
                        value: 'Used Merchandise Stores',
                        options: [
                            {
                                id: 453310,
                                value: 'Used Merchandise Stores',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4539,
                value: 'Other Miscellaneous Store Retailers',
                options: [
                    {
                        id: 45391,
                        value: 'Pet and Pet Supplies Stores',
                        options: [
                            {
                                id: 453910,
                                value: 'Pet and Pet Supplies Stores',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45392,
                        value: 'Art Dealers',
                        options: [
                            {
                                id: 453920,
                                value: 'Art Dealers',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45393,
                        value: 'Manufactured (Mobile) Home Dealers',
                        options: [
                            {
                                id: 453930,
                                value: 'Manufactured (Mobile) Home Dealers',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45399,
                        value: 'All Other Miscellaneous Store Retailers',
                        options: [
                            {
                                id: 453991,
                                value: 'Tobacco Stores',
                                options: [],
                            },
                            {
                                id: 453998,
                                value: 'All Other Miscellaneous Store Retailers (except Tobacco Stores)',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 454,
        value: 'Nonstore Retailers',
        options: [
            {
                id: 4541,
                value: 'Electronic Shopping and Mail-Order Houses',
                options: [
                    {
                        id: 45411,
                        value: 'Electronic Shopping and Mail-Order Houses',
                        options: [
                            {
                                id: 454110,
                                value: 'Electronic Shopping and Mail-Order Houses',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4542,
                value: 'Vending Machine Operators',
                options: [
                    {
                        id: 45421,
                        value: 'Vending Machine Operators',
                        options: [
                            {
                                id: 454210,
                                value: 'Vending Machine Operators',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4543,
                value: 'Direct Selling Establishments',
                options: [
                    {
                        id: 45431,
                        value: 'Fuel Dealers',
                        options: [
                            {
                                id: 454310,
                                value: 'Fuel Dealers',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 45439,
                        value: 'Other Direct Selling Establishments',
                        options: [
                            {
                                id: 454390,
                                value: 'Other Direct Selling Establishments',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 48,
        value: 'Transportation and Warehousing',
        options: [
            {
                id: 481,
                value: 'Air Transportation',
                options: [
                    {
                        id: 4811,
                        value: 'Scheduled Air Transportation',
                        options: [
                            {
                                id: 48111,
                                value: 'Scheduled Air Transportation',
                                options: [
                                    {
                                        id: 481111,
                                        value: 'Scheduled Passenger Air Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 481112,
                                        value: 'Scheduled Freight Air Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4812,
                        value: 'Nonscheduled Air Transportation',
                        options: [
                            {
                                id: 48121,
                                value: 'Nonscheduled Air Transportation',
                                options: [
                                    {
                                        id: 481211,
                                        value: 'Nonscheduled Chartered Passenger Air Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 481212,
                                        value: 'Nonscheduled Chartered Freight Air Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 481219,
                                        value: 'Other Nonscheduled Air Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 482,
                value: 'Rail Transportation',
                options: [
                    {
                        id: 4821,
                        value: 'Rail Transportation',
                        options: [
                            {
                                id: 48211,
                                value: 'Rail Transportation',
                                options: [
                                    {
                                        id: 482111,
                                        value: 'Line-Haul Railroads',
                                        options: [],
                                    },
                                    {
                                        id: 482112,
                                        value: 'Short Line Railroads',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 483,
                value: 'Water Transportation',
                options: [
                    {
                        id: 4831,
                        value: 'Deep Sea, Coastal, and Great Lakes Water Transportation',
                        options: [
                            {
                                id: 48311,
                                value: 'Deep Sea, Coastal, and Great Lakes Water Transportation',
                                options: [
                                    {
                                        id: 483111,
                                        value: 'Deep Sea Freight Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 483112,
                                        value: 'Deep Sea Passenger Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 483113,
                                        value: 'Coastal and Great Lakes Freight Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 483114,
                                        value: 'Coastal and Great Lakes Passenger Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4832,
                        value: 'Inland Water Transportation',
                        options: [
                            {
                                id: 48321,
                                value: 'Inland Water Transportation',
                                options: [
                                    {
                                        id: 483211,
                                        value: 'Inland Water Freight Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 483212,
                                        value: 'Inland Water Passenger Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 484,
                value: 'Truck Transportation',
                options: [
                    {
                        id: 4841,
                        value: 'General Freight Trucking',
                        options: [
                            {
                                id: 48411,
                                value: 'General Freight Trucking, Local',
                                options: [
                                    {
                                        id: 484110,
                                        value: 'General Freight Trucking, Local',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48412,
                                value: 'General Freight Trucking, Long-Distance',
                                options: [
                                    {
                                        id: 484121,
                                        value: 'General Freight Trucking, Long-Distance, Truckload',
                                        options: [],
                                    },
                                    {
                                        id: 484122,
                                        value: 'General Freight Trucking, Long-Distance, Less Than Truckload',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4842,
                        value: 'Specialized Freight Trucking',
                        options: [
                            {
                                id: 48421,
                                value: 'Used Household and Office Goods Moving',
                                options: [
                                    {
                                        id: 484210,
                                        value: 'Used Household and Office Goods Moving',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48422,
                                value: 'Specialized Freight (except Used Goods) Trucking, Local',
                                options: [
                                    {
                                        id: 484220,
                                        value: 'Specialized Freight (except Used Goods) Trucking, Local',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48423,
                                value: 'Specialized Freight (except Used Goods) Trucking, Long-Distance',
                                options: [
                                    {
                                        id: 484230,
                                        value: 'Specialized Freight (except Used Goods) Trucking, Long-Distance',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 485,
                value: 'Transit and Ground Passenger Transportation',
                options: [
                    {
                        id: 4851,
                        value: 'Urban Transit Systems',
                        options: [
                            {
                                id: 48511,
                                value: 'Urban Transit Systems',
                                options: [
                                    {
                                        id: 485111,
                                        value: 'Mixed Mode Transit Systems',
                                        options: [],
                                    },
                                    {
                                        id: 485112,
                                        value: 'Commuter Rail Systems',
                                        options: [],
                                    },
                                    {
                                        id: 485113,
                                        value: 'Bus and Other Motor Vehicle Transit Systems',
                                        options: [],
                                    },
                                    {
                                        id: 485119,
                                        value: 'Other Urban Transit Systems',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4852,
                        value: 'Interurban and Rural Bus Transportation',
                        options: [
                            {
                                id: 48521,
                                value: 'Interurban and Rural Bus Transportation',
                                options: [
                                    {
                                        id: 485210,
                                        value: 'Interurban and Rural Bus Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4853,
                        value: 'Taxi and Limousine Service',
                        options: [
                            {
                                id: 48531,
                                value: 'Taxi Service',
                                options: [
                                    {
                                        id: 485310,
                                        value: 'Taxi Service',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48532,
                                value: 'Limousine Service',
                                options: [
                                    {
                                        id: 485320,
                                        value: 'Limousine Service',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4854,
                        value: 'School and Employee Bus Transportation',
                        options: [
                            {
                                id: 48541,
                                value: 'School and Employee Bus Transportation',
                                options: [
                                    {
                                        id: 485410,
                                        value: 'School and Employee Bus Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4855,
                        value: 'Charter Bus Industry',
                        options: [
                            {
                                id: 48551,
                                value: 'Charter Bus Industry',
                                options: [
                                    {
                                        id: 485510,
                                        value: 'Charter Bus Industry',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4859,
                        value: 'Other Transit and Ground Passenger Transportation',
                        options: [
                            {
                                id: 48599,
                                value: 'Other Transit and Ground Passenger Transportation',
                                options: [
                                    {
                                        id: 485991,
                                        value: 'Special Needs Transportation',
                                        options: [],
                                    },
                                    {
                                        id: 485999,
                                        value: 'All Other Transit and Ground Passenger Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 486,
                value: 'Pipeline Transportation',
                options: [
                    {
                        id: 4861,
                        value: 'Pipeline Transportation of Crude Oil',
                        options: [
                            {
                                id: 48611,
                                value: 'Pipeline Transportation of Crude Oil',
                                options: [
                                    {
                                        id: 486110,
                                        value: 'Pipeline Transportation of Crude Oil',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4862,
                        value: 'Pipeline Transportation of Natural Gas',
                        options: [
                            {
                                id: 48621,
                                value: 'Pipeline Transportation of Natural Gas',
                                options: [
                                    {
                                        id: 486210,
                                        value: 'Pipeline Transportation of Natural Gas',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4869,
                        value: 'Other Pipeline Transportation',
                        options: [
                            {
                                id: 48691,
                                value: 'Pipeline Transportation of Refined Petroleum Products',
                                options: [
                                    {
                                        id: 486910,
                                        value: 'Pipeline Transportation of Refined Petroleum Products',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48699,
                                value: 'All Other Pipeline Transportation',
                                options: [
                                    {
                                        id: 486990,
                                        value: 'All Other Pipeline Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 487,
                value: 'Scenic and Sightseeing Transportation',
                options: [
                    {
                        id: 4871,
                        value: 'Scenic and Sightseeing Transportation, Land',
                        options: [
                            {
                                id: 48711,
                                value: 'Scenic and Sightseeing Transportation, Land',
                                options: [
                                    {
                                        id: 487110,
                                        value: 'Scenic and Sightseeing Transportation, Land',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4872,
                        value: 'Scenic and Sightseeing Transportation, Water',
                        options: [
                            {
                                id: 48721,
                                value: 'Scenic and Sightseeing Transportation, Water',
                                options: [
                                    {
                                        id: 487210,
                                        value: 'Scenic and Sightseeing Transportation, Water',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4879,
                        value: 'Scenic and Sightseeing Transportation, Other',
                        options: [
                            {
                                id: 48799,
                                value: 'Scenic and Sightseeing Transportation, Other',
                                options: [
                                    {
                                        id: 487990,
                                        value: 'Scenic and Sightseeing Transportation, Other',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 488,
                value: 'Support Activities for Transportation',
                options: [
                    {
                        id: 4881,
                        value: 'Support Activities for Air Transportation',
                        options: [
                            {
                                id: 48811,
                                value: 'Airport Operations',
                                options: [
                                    {
                                        id: 488111,
                                        value: 'Air Traffic Control',
                                        options: [],
                                    },
                                    {
                                        id: 488119,
                                        value: 'Other Airport Operations',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48819,
                                value: 'Other Support Activities for Air Transportation',
                                options: [
                                    {
                                        id: 488190,
                                        value: 'Other Support Activities for Air Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4882,
                        value: 'Support Activities for Rail Transportation',
                        options: [
                            {
                                id: 48821,
                                value: 'Support Activities for Rail Transportation',
                                options: [
                                    {
                                        id: 488210,
                                        value: 'Support Activities for Rail Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4883,
                        value: 'Support Activities for Water Transportation',
                        options: [
                            {
                                id: 48831,
                                value: 'Port and Harbor Operations',
                                options: [
                                    {
                                        id: 488310,
                                        value: 'Port and Harbor Operations',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48832,
                                value: 'Marine Cargo Handling',
                                options: [
                                    {
                                        id: 488320,
                                        value: 'Marine Cargo Handling',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48833,
                                value: 'Navigational Services to Shipping',
                                options: [
                                    {
                                        id: 488330,
                                        value: 'Navigational Services to Shipping',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48839,
                                value: 'Other Support Activities for Water Transportation',
                                options: [
                                    {
                                        id: 488390,
                                        value: 'Other Support Activities for Water Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4884,
                        value: 'Support Activities for Road Transportation',
                        options: [
                            {
                                id: 48841,
                                value: 'Motor Vehicle Towing',
                                options: [
                                    {
                                        id: 488410,
                                        value: 'Motor Vehicle Towing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 48849,
                                value: 'Other Support Activities for Road Transportation',
                                options: [
                                    {
                                        id: 488490,
                                        value: 'Other Support Activities for Road Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4885,
                        value: 'Freight Transportation Arrangement',
                        options: [
                            {
                                id: 48851,
                                value: 'Freight Transportation Arrangement',
                                options: [
                                    {
                                        id: 488510,
                                        value: 'Freight Transportation Arrangement',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 4889,
                        value: 'Other Support Activities for Transportation',
                        options: [
                            {
                                id: 48899,
                                value: 'Other Support Activities for Transportation',
                                options: [
                                    {
                                        id: 488991,
                                        value: 'Packing and Crating',
                                        options: [],
                                    },
                                    {
                                        id: 488999,
                                        value: 'All Other Support Activities for Transportation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 491,
        value: 'Postal Service',
        options: [
            {
                id: 4911,
                value: 'Postal Service',
                options: [
                    {
                        id: 49111,
                        value: 'Postal Service',
                        options: [
                            {
                                id: 491110,
                                value: 'Postal Service',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 492,
        value: 'Couriers and Messengers',
        options: [
            {
                id: 4921,
                value: 'Couriers and Express Delivery Services',
                options: [
                    {
                        id: 49211,
                        value: 'Couriers and Express Delivery Services',
                        options: [
                            {
                                id: 492110,
                                value: 'Couriers and Express Delivery Services',
                                options: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 4922,
                value: 'Local Messengers and Local Delivery',
                options: [
                    {
                        id: 49221,
                        value: 'Local Messengers and Local Delivery',
                        options: [
                            {
                                id: 492210,
                                value: 'Local Messengers and Local Delivery',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 493,
        value: 'Warehousing and Storage',
        options: [
            {
                id: 4931,
                value: 'Warehousing and Storage',
                options: [
                    {
                        id: 49311,
                        value: 'General Warehousing and Storage',
                        options: [
                            {
                                id: 493110,
                                value: 'General Warehousing and Storage',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 49312,
                        value: 'Refrigerated Warehousing and Storage',
                        options: [
                            {
                                id: 493120,
                                value: 'Refrigerated Warehousing and Storage',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 49313,
                        value: 'Farm Product Warehousing and Storage',
                        options: [
                            {
                                id: 493130,
                                value: 'Farm Product Warehousing and Storage',
                                options: [],
                            },
                        ],
                    },
                    {
                        id: 49319,
                        value: 'Other Warehousing and Storage',
                        options: [
                            {
                                id: 493190,
                                value: 'Other Warehousing and Storage',
                                options: [],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 51,
        value: 'Information',
        options: [
            {
                id: 511,
                value: 'Publishing Industries (except Internet)',
                options: [
                    {
                        id: 5111,
                        value: 'Newspaper, Periodical, Book, and Directory Publishers',
                        options: [
                            {
                                id: 51111,
                                value: 'Newspaper Publishers',
                                options: [
                                    {
                                        id: 511110,
                                        value: 'Newspaper Publishers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51112,
                                value: 'Periodical Publishers',
                                options: [
                                    {
                                        id: 511120,
                                        value: 'Periodical Publishers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51113,
                                value: 'Book Publishers',
                                options: [
                                    {
                                        id: 511130,
                                        value: 'Book Publishers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51114,
                                value: 'Directory and Mailing List Publishers',
                                options: [
                                    {
                                        id: 511140,
                                        value: 'Directory and Mailing List Publishers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51119,
                                value: 'Other Publishers',
                                options: [
                                    {
                                        id: 511191,
                                        value: 'Greeting Card Publishers',
                                        options: [],
                                    },
                                    {
                                        id: 511199,
                                        value: 'All Other Publishers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5112,
                        value: 'Software Publishers',
                        options: [
                            {
                                id: 51121,
                                value: 'Software Publishers',
                                options: [
                                    {
                                        id: 511210,
                                        value: 'Software Publishers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 512,
                value: 'Motion Picture and Sound Recording Industries',
                options: [
                    {
                        id: 5121,
                        value: 'Motion Picture and Video Industries',
                        options: [
                            {
                                id: 51211,
                                value: 'Motion Picture and Video Production',
                                options: [
                                    {
                                        id: 512110,
                                        value: 'Motion Picture and Video Production',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51212,
                                value: 'Motion Picture and Video Distribution',
                                options: [
                                    {
                                        id: 512120,
                                        value: 'Motion Picture and Video Distribution',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51213,
                                value: 'Motion Picture and Video Exhibition',
                                options: [
                                    {
                                        id: 512131,
                                        value: 'Motion Picture Theaters (except Drive-Ins)',
                                        options: [],
                                    },
                                    {
                                        id: 512132,
                                        value: 'Drive-In Motion Picture Theaters',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51219,
                                value: 'Postproduction Services and Other Motion Picture and Video Industries',
                                options: [
                                    {
                                        id: 512191,
                                        value: 'Teleproduction and Other Postproduction Services',
                                        options: [],
                                    },
                                    {
                                        id: 512199,
                                        value: 'Other Motion Picture and Video Industries',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5122,
                        value: 'Sound Recording Industries',
                        options: [
                            {
                                id: 51223,
                                value: 'Music Publishers',
                                options: [
                                    {
                                        id: 512230,
                                        value: 'Music Publishers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51224,
                                value: 'Sound Recording Studios',
                                options: [
                                    {
                                        id: 512240,
                                        value: 'Sound Recording Studios',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51225,
                                value: 'Record Production and Distribution',
                                options: [
                                    {
                                        id: 512250,
                                        value: 'Record Production and Distribution',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51229,
                                value: 'Other Sound Recording Industries',
                                options: [
                                    {
                                        id: 512290,
                                        value: 'Other Sound Recording Industries',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 515,
                value: 'Broadcasting (except Internet)',
                options: [
                    {
                        id: 5151,
                        value: 'Radio and Television Broadcasting',
                        options: [
                            {
                                id: 51511,
                                value: 'Radio Broadcasting',
                                options: [
                                    {
                                        id: 515111,
                                        value: 'Radio Networks',
                                        options: [],
                                    },
                                    {
                                        id: 515112,
                                        value: 'Radio Stations',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51512,
                                value: 'Television Broadcasting',
                                options: [
                                    {
                                        id: 515120,
                                        value: 'Television Broadcasting',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5152,
                        value: 'Cable and Other Subscription Programming',
                        options: [
                            {
                                id: 51521,
                                value: 'Cable and Other Subscription Programming',
                                options: [
                                    {
                                        id: 515210,
                                        value: 'Cable and Other Subscription Programming',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 517,
                value: 'Telecommunications',
                options: [
                    {
                        id: 5173,
                        value: 'Wired and Wireless Telecommunications Carriers',
                        options: [
                            {
                                id: 51731,
                                value: 'Wired and Wireless Telecommunications Carriers',
                                options: [
                                    {
                                        id: 517311,
                                        value: 'Wired Telecommunications Carriers',
                                        options: [],
                                    },
                                    {
                                        id: 517312,
                                        value: 'Wireless Telecommunications Carriers (except Satellite)',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5174,
                        value: 'Satellite Telecommunications',
                        options: [
                            {
                                id: 51741,
                                value: 'Satellite Telecommunications',
                                options: [
                                    {
                                        id: 517410,
                                        value: 'Satellite Telecommunications',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5179,
                        value: 'Other Telecommunications',
                        options: [
                            {
                                id: 51791,
                                value: 'Other Telecommunications',
                                options: [
                                    {
                                        id: 517911,
                                        value: 'Telecommunications Resellers',
                                        options: [],
                                    },
                                    {
                                        id: 517919,
                                        value: 'All Other Telecommunications',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 518,
                value: 'Data Processing, Hosting, and Related Services',
                options: [
                    {
                        id: 5182,
                        value: 'Data Processing, Hosting, and Related Services',
                        options: [
                            {
                                id: 51821,
                                value: 'Data Processing, Hosting, and Related Services',
                                options: [
                                    {
                                        id: 518210,
                                        value: 'Data Processing, Hosting, and Related Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 519,
                value: 'Other Information Services',
                options: [
                    {
                        id: 5191,
                        value: 'Other Information Services',
                        options: [
                            {
                                id: 51911,
                                value: 'News Syndicates',
                                options: [
                                    {
                                        id: 519110,
                                        value: 'News Syndicates',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51912,
                                value: 'Libraries and Archives',
                                options: [
                                    {
                                        id: 519120,
                                        value: 'Libraries and Archives',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51913,
                                value: 'Internet Publishing and Broadcasting and Web Search Portals',
                                options: [
                                    {
                                        id: 519130,
                                        value: 'Internet Publishing and Broadcasting and Web Search Portals',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 51919,
                                value: 'All Other Information Services',
                                options: [
                                    {
                                        id: 519190,
                                        value: 'All Other Information Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 52,
        value: 'Finance and Insurance',
        options: [
            {
                id: 521,
                value: 'Monetary Authorities-Central Bank',
                options: [
                    {
                        id: 5211,
                        value: 'Monetary Authorities-Central Bank',
                        options: [
                            {
                                id: 52111,
                                value: 'Monetary Authorities-Central Bank',
                                options: [
                                    {
                                        id: 521110,
                                        value: 'Monetary Authorities-Central Bank',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 522,
                value: 'Credit Intermediation and Related Activities',
                options: [
                    {
                        id: 5221,
                        value: 'Depository Credit Intermediation',
                        options: [
                            {
                                id: 52211,
                                value: 'Commercial Banking',
                                options: [
                                    {
                                        id: 522110,
                                        value: 'Commercial Banking',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52212,
                                value: 'Savings Institutions',
                                options: [
                                    {
                                        id: 522120,
                                        value: 'Savings Institutions',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52213,
                                value: 'Credit Unions',
                                options: [
                                    {
                                        id: 522130,
                                        value: 'Credit Unions',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52219,
                                value: 'Other Depository Credit Intermediation',
                                options: [
                                    {
                                        id: 522190,
                                        value: 'Other Depository Credit Intermediation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5222,
                        value: 'Nondepository Credit Intermediation',
                        options: [
                            {
                                id: 52221,
                                value: 'Credit Card Issuing',
                                options: [
                                    {
                                        id: 522210,
                                        value: 'Credit Card Issuing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52222,
                                value: 'Sales Financing',
                                options: [
                                    {
                                        id: 522220,
                                        value: 'Sales Financing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52229,
                                value: 'Other Nondepository Credit Intermediation',
                                options: [
                                    {
                                        id: 522291,
                                        value: 'Consumer Lending',
                                        options: [],
                                    },
                                    {
                                        id: 522292,
                                        value: 'Real Estate Credit',
                                        options: [],
                                    },
                                    {
                                        id: 522293,
                                        value: 'International Trade Financing',
                                        options: [],
                                    },
                                    {
                                        id: 522294,
                                        value: 'Secondary Market Financing',
                                        options: [],
                                    },
                                    {
                                        id: 522298,
                                        value: 'All Other Nondepository Credit Intermediation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5223,
                        value: 'Activities Related to Credit Intermediation',
                        options: [
                            {
                                id: 52231,
                                value: 'Mortgage and Nonmortgage Loan Brokers',
                                options: [
                                    {
                                        id: 522310,
                                        value: 'Mortgage and Nonmortgage Loan Brokers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52232,
                                value: 'Financial Transactions Processing, Reserve, and Clearinghouse Activities',
                                options: [
                                    {
                                        id: 522320,
                                        value: 'Financial Transactions Processing, Reserve, and Clearinghouse Activities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52239,
                                value: 'Other Activities Related to Credit Intermediation',
                                options: [
                                    {
                                        id: 522390,
                                        value: 'Other Activities Related to Credit Intermediation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 523,
                value: 'Securities, Commodity Contracts, and Other Financial Investments and Related Activities',
                options: [
                    {
                        id: 5231,
                        value: 'Securities and Commodity Contracts Intermediation and Brokerage',
                        options: [
                            {
                                id: 52311,
                                value: 'Investment Banking and Securities Dealing',
                                options: [
                                    {
                                        id: 523110,
                                        value: 'Investment Banking and Securities Dealing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52312,
                                value: 'Securities Brokerage',
                                options: [
                                    {
                                        id: 523120,
                                        value: 'Securities Brokerage',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52313,
                                value: 'Commodity Contracts Dealing',
                                options: [
                                    {
                                        id: 523130,
                                        value: 'Commodity Contracts Dealing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52314,
                                value: 'Commodity Contracts Brokerage',
                                options: [
                                    {
                                        id: 523140,
                                        value: 'Commodity Contracts Brokerage',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5232,
                        value: 'Securities and Commodity Exchanges',
                        options: [
                            {
                                id: 52321,
                                value: 'Securities and Commodity Exchanges',
                                options: [
                                    {
                                        id: 523210,
                                        value: 'Securities and Commodity Exchanges',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5239,
                        value: 'Other Financial Investment Activities',
                        options: [
                            {
                                id: 52391,
                                value: 'Miscellaneous Intermediation',
                                options: [
                                    {
                                        id: 523910,
                                        value: 'Miscellaneous Intermediation',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52392,
                                value: 'Portfolio Management',
                                options: [
                                    {
                                        id: 523920,
                                        value: 'Portfolio Management',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52393,
                                value: 'Investment Advice',
                                options: [
                                    {
                                        id: 523930,
                                        value: 'Investment Advice',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52399,
                                value: 'All Other Financial Investment Activities',
                                options: [
                                    {
                                        id: 523991,
                                        value: 'Trust, Fiduciary, and Custody Activities',
                                        options: [],
                                    },
                                    {
                                        id: 523999,
                                        value: 'Miscellaneous Financial Investment Activities',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 524,
                value: 'Insurance Carriers and Related Activities',
                options: [
                    {
                        id: 5241,
                        value: 'Insurance Carriers',
                        options: [
                            {
                                id: 52411,
                                value: 'Direct Life, Health, and Medical Insurance Carriers',
                                options: [
                                    {
                                        id: 524113,
                                        value: 'Direct Life Insurance Carriers',
                                        options: [],
                                    },
                                    {
                                        id: 524114,
                                        value: 'Direct Health and Medical Insurance Carriers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52412,
                                value: 'Direct Insurance (except Life, Health, and Medical) Carriers',
                                options: [
                                    {
                                        id: 524126,
                                        value: 'Direct Property and Casualty Insurance Carriers',
                                        options: [],
                                    },
                                    {
                                        id: 524127,
                                        value: 'Direct Title Insurance Carriers',
                                        options: [],
                                    },
                                    {
                                        id: 524128,
                                        value: 'Other Direct Insurance (except Life, Health, and Medical) Carriers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52413,
                                value: 'Reinsurance Carriers',
                                options: [
                                    {
                                        id: 524130,
                                        value: 'Reinsurance Carriers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5242,
                        value: 'Agencies, Brokerages, and Other Insurance Related Activities',
                        options: [
                            {
                                id: 52421,
                                value: 'Insurance Agencies and Brokerages',
                                options: [
                                    {
                                        id: 524210,
                                        value: 'Insurance Agencies and Brokerages',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52429,
                                value: 'Other Insurance Related Activities',
                                options: [
                                    {
                                        id: 524291,
                                        value: 'Claims Adjusting',
                                        options: [],
                                    },
                                    {
                                        id: 524292,
                                        value: 'Third Party Administration of Insurance and Pension Funds',
                                        options: [],
                                    },
                                    {
                                        id: 524298,
                                        value: 'All Other Insurance Related Activities',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 525,
                value: 'Funds, Trusts, and Other Financial Vehicles',
                options: [
                    {
                        id: 5251,
                        value: 'Insurance and Employee Benefit Funds',
                        options: [
                            {
                                id: 52511,
                                value: 'Pension Funds',
                                options: [
                                    {
                                        id: 525110,
                                        value: 'Pension Funds',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52512,
                                value: 'Health and Welfare Funds',
                                options: [
                                    {
                                        id: 525120,
                                        value: 'Health and Welfare Funds',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52519,
                                value: 'Other Insurance Funds',
                                options: [
                                    {
                                        id: 525190,
                                        value: 'Other Insurance Funds',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5259,
                        value: 'Other Investment Pools and Funds',
                        options: [
                            {
                                id: 52591,
                                value: 'Open-End Investment Funds',
                                options: [
                                    {
                                        id: 525910,
                                        value: 'Open-End Investment Funds',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52592,
                                value: 'Trusts, Estates, and Agency Accounts',
                                options: [
                                    {
                                        id: 525920,
                                        value: 'Trusts, Estates, and Agency Accounts',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 52599,
                                value: 'Other Financial Vehicles',
                                options: [
                                    {
                                        id: 525990,
                                        value: 'Other Financial Vehicles',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 53,
        value: 'Real Estate and Rental and Leasing',
        options: [
            {
                id: 531,
                value: 'Real Estate',
                options: [
                    {
                        id: 5311,
                        value: 'Lessors of Real Estate',
                        options: [
                            {
                                id: 53111,
                                value: 'Lessors of Residential Buildings and Dwellings',
                                options: [
                                    {
                                        id: 531110,
                                        value: 'Lessors of Residential Buildings and Dwellings',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53112,
                                value: 'Lessors of Nonresidential Buildings (except Miniwarehouses)',
                                options: [
                                    {
                                        id: 531120,
                                        value: 'Lessors of Nonresidential Buildings (except Miniwarehouses)',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53113,
                                value: 'Lessors of Miniwarehouses and Self-Storage Units',
                                options: [
                                    {
                                        id: 531130,
                                        value: 'Lessors of Miniwarehouses and Self-Storage Units',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53119,
                                value: 'Lessors of Other Real Estate Property',
                                options: [
                                    {
                                        id: 531190,
                                        value: 'Lessors of Other Real Estate Property',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5312,
                        value: 'Offices of Real Estate Agents and Brokers',
                        options: [
                            {
                                id: 53121,
                                value: 'Offices of Real Estate Agents and Brokers',
                                options: [
                                    {
                                        id: 531210,
                                        value: 'Offices of Real Estate Agents and Brokers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5313,
                        value: 'Activities Related to Real Estate',
                        options: [
                            {
                                id: 53131,
                                value: 'Real Estate Property Managers',
                                options: [
                                    {
                                        id: 531311,
                                        value: 'Residential Property Managers',
                                        options: [],
                                    },
                                    {
                                        id: 531312,
                                        value: 'Nonresidential Property Managers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53132,
                                value: 'Offices of Real Estate Appraisers',
                                options: [
                                    {
                                        id: 531320,
                                        value: 'Offices of Real Estate Appraisers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53139,
                                value: 'Other Activities Related to Real Estate',
                                options: [
                                    {
                                        id: 531390,
                                        value: 'Other Activities Related to Real Estate',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 532,
                value: 'Rental and Leasing Services',
                options: [
                    {
                        id: 5321,
                        value: 'Automotive Equipment Rental and Leasing',
                        options: [
                            {
                                id: 53211,
                                value: 'Passenger Car Rental and Leasing',
                                options: [
                                    {
                                        id: 532111,
                                        value: 'Passenger Car Rental',
                                        options: [],
                                    },
                                    {
                                        id: 532112,
                                        value: 'Passenger Car Leasing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53212,
                                value: 'Truck, Utility Trailer, and RV (Recreational Vehicle) Rental and Leasing',
                                options: [
                                    {
                                        id: 532120,
                                        value: 'Truck, Utility Trailer, and RV (Recreational Vehicle) Rental and Leasing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5322,
                        value: 'Consumer Goods Rental',
                        options: [
                            {
                                id: 53221,
                                value: 'Consumer Electronics and Appliances Rental',
                                options: [
                                    {
                                        id: 532210,
                                        value: 'Consumer Electronics and Appliances Rental',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53228,
                                value: 'Other Consumer Goods Rental',
                                options: [
                                    {
                                        id: 532281,
                                        value: 'Formal Wear and Costume Rental',
                                        options: [],
                                    },
                                    {
                                        id: 532282,
                                        value: 'Video Tape and Disc Rental',
                                        options: [],
                                    },
                                    {
                                        id: 532283,
                                        value: 'Home Health Equipment Rental',
                                        options: [],
                                    },
                                    {
                                        id: 532284,
                                        value: 'Recreational Goods Rental',
                                        options: [],
                                    },
                                    {
                                        id: 532289,
                                        value: 'All Other Consumer Goods Rental',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5323,
                        value: 'General Rental Centers',
                        options: [
                            {
                                id: 53231,
                                value: 'General Rental Centers',
                                options: [
                                    {
                                        id: 532310,
                                        value: 'General Rental Centers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5324,
                        value: 'Commercial and Industrial Machinery and Equipment Rental and Leasing',
                        options: [
                            {
                                id: 53241,
                                value: 'Construction, Transportation, Mining, and Forestry Machinery and Equipment Rental and Leasing',
                                options: [
                                    {
                                        id: 532411,
                                        value: 'Commercial Air, Rail, and Water Transportation Equipment Rental and Leasing',
                                        options: [],
                                    },
                                    {
                                        id: 532412,
                                        value: 'Construction, Mining, and Forestry Machinery and Equipment Rental and Leasing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53242,
                                value: 'Office Machinery and Equipment Rental and Leasing',
                                options: [
                                    {
                                        id: 532420,
                                        value: 'Office Machinery and Equipment Rental and Leasing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 53249,
                                value: 'Other Commercial and Industrial Machinery and Equipment Rental and Leasing',
                                options: [
                                    {
                                        id: 532490,
                                        value: 'Other Commercial and Industrial Machinery and Equipment Rental and Leasing',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 533,
                value: 'Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)',
                options: [
                    {
                        id: 5331,
                        value: 'Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)',
                        options: [
                            {
                                id: 53311,
                                value: 'Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)',
                                options: [
                                    {
                                        id: 533110,
                                        value: 'Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 54,
        value: 'Professional, Scientific, and Technical Services',
        options: [
            {
                id: 541,
                value: 'Professional, Scientific, and Technical Services',
                options: [
                    {
                        id: 5411,
                        value: 'Legal Services',
                        options: [
                            {
                                id: 54111,
                                value: 'Offices of Lawyers',
                                options: [
                                    {
                                        id: 541110,
                                        value: 'Offices of Lawyers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54112,
                                value: 'Offices of Notaries',
                                options: [
                                    {
                                        id: 541120,
                                        value: 'Offices of Notaries',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54119,
                                value: 'Other Legal Services',
                                options: [
                                    {
                                        id: 541191,
                                        value: 'Title Abstract and Settlement Offices',
                                        options: [],
                                    },
                                    {
                                        id: 541199,
                                        value: 'All Other Legal Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5412,
                        value: 'Accounting, Tax Preparation, Bookkeeping, and Payroll Services',
                        options: [
                            {
                                id: 54121,
                                value: 'Accounting, Tax Preparation, Bookkeeping, and Payroll Services',
                                options: [
                                    {
                                        id: 541211,
                                        value: 'Offices of Certified Public Accountants',
                                        options: [],
                                    },
                                    {
                                        id: 541213,
                                        value: 'Tax Preparation Services',
                                        options: [],
                                    },
                                    {
                                        id: 541214,
                                        value: 'Payroll Services',
                                        options: [],
                                    },
                                    {
                                        id: 541219,
                                        value: 'Other Accounting Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5413,
                        value: 'Architectural, Engineering, and Related Services',
                        options: [
                            {
                                id: 54131,
                                value: 'Architectural Services',
                                options: [
                                    {
                                        id: 541310,
                                        value: 'Architectural Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54132,
                                value: 'Landscape Architectural Services',
                                options: [
                                    {
                                        id: 541320,
                                        value: 'Landscape Architectural Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54133,
                                value: 'Engineering Services',
                                options: [
                                    {
                                        id: 541330,
                                        value: 'Engineering Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54134,
                                value: 'Drafting Services',
                                options: [
                                    {
                                        id: 541340,
                                        value: 'Drafting Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54135,
                                value: 'Building Inspection Services',
                                options: [
                                    {
                                        id: 541350,
                                        value: 'Building Inspection Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54136,
                                value: 'Geophysical Surveying and Mapping Services',
                                options: [
                                    {
                                        id: 541360,
                                        value: 'Geophysical Surveying and Mapping Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54137,
                                value: 'Surveying and Mapping (except Geophysical) Services',
                                options: [
                                    {
                                        id: 541370,
                                        value: 'Surveying and Mapping (except Geophysical) Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54138,
                                value: 'Testing Laboratories',
                                options: [
                                    {
                                        id: 541380,
                                        value: 'Testing Laboratories',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5414,
                        value: 'Specialized Design Services',
                        options: [
                            {
                                id: 54141,
                                value: 'Interior Design Services',
                                options: [
                                    {
                                        id: 541410,
                                        value: 'Interior Design Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54142,
                                value: 'Industrial Design Services',
                                options: [
                                    {
                                        id: 541420,
                                        value: 'Industrial Design Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54143,
                                value: 'Graphic Design Services',
                                options: [
                                    {
                                        id: 541430,
                                        value: 'Graphic Design Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54149,
                                value: 'Other Specialized Design Services',
                                options: [
                                    {
                                        id: 541490,
                                        value: 'Other Specialized Design Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5415,
                        value: 'Computer Systems Design and Related Services',
                        options: [
                            {
                                id: 54151,
                                value: 'Computer Systems Design and Related Services',
                                options: [
                                    {
                                        id: 541511,
                                        value: 'Custom Computer Programming Services',
                                        options: [],
                                    },
                                    {
                                        id: 541512,
                                        value: 'Computer Systems Design Services',
                                        options: [],
                                    },
                                    {
                                        id: 541513,
                                        value: 'Computer Facilities Management Services',
                                        options: [],
                                    },
                                    {
                                        id: 541519,
                                        value: 'Other Computer Related Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5416,
                        value: 'Management, Scientific, and Technical Consulting Services',
                        options: [
                            {
                                id: 54161,
                                value: 'Management Consulting Services',
                                options: [
                                    {
                                        id: 541611,
                                        value: 'Administrative Management and General Management Consulting Services',
                                        options: [],
                                    },
                                    {
                                        id: 541612,
                                        value: 'Human Resources Consulting Services',
                                        options: [],
                                    },
                                    {
                                        id: 541613,
                                        value: 'Marketing Consulting Services',
                                        options: [],
                                    },
                                    {
                                        id: 541614,
                                        value: 'Process, Physical Distribution, and Logistics Consulting Services',
                                        options: [],
                                    },
                                    {
                                        id: 541618,
                                        value: 'Other Management Consulting Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54162,
                                value: 'Environmental Consulting Services',
                                options: [
                                    {
                                        id: 541620,
                                        value: 'Environmental Consulting Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54169,
                                value: 'Other Scientific and Technical Consulting Services',
                                options: [
                                    {
                                        id: 541690,
                                        value: 'Other Scientific and Technical Consulting Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5417,
                        value: 'Scientific Research and Development Services',
                        options: [
                            {
                                id: 54171,
                                value: 'Research and Development in the Physical, Engineering, and Life Sciences',
                                options: [
                                    {
                                        id: 541713,
                                        value: 'Research and Development in Nanotechnology',
                                        options: [],
                                    },
                                    {
                                        id: 541714,
                                        value: 'Research and Development in Biotechnology (except Nanobiotechnology)',
                                        options: [],
                                    },
                                    {
                                        id: 541715,
                                        value: 'Research and Development in the Physical, Engineering, and Life Sciences (except Nanotechnology and Biotechnology)',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54172,
                                value: 'Research and Development in the Social Sciences and Humanities',
                                options: [
                                    {
                                        id: 541720,
                                        value: 'Research and Development in the Social Sciences and Humanities',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5418,
                        value: 'Advertising, Public Relations, and Related Services',
                        options: [
                            {
                                id: 54181,
                                value: 'Advertising Agencies',
                                options: [
                                    {
                                        id: 541810,
                                        value: 'Advertising Agencies',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54182,
                                value: 'Public Relations Agencies',
                                options: [
                                    {
                                        id: 541820,
                                        value: 'Public Relations Agencies',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54183,
                                value: 'Media Buying Agencies',
                                options: [
                                    {
                                        id: 541830,
                                        value: 'Media Buying Agencies',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54184,
                                value: 'Media Representatives',
                                options: [
                                    {
                                        id: 541840,
                                        value: 'Media Representatives',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54185,
                                value: 'Outdoor Advertising',
                                options: [
                                    {
                                        id: 541850,
                                        value: 'Outdoor Advertising',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54186,
                                value: 'Direct Mail Advertising',
                                options: [
                                    {
                                        id: 541860,
                                        value: 'Direct Mail Advertising',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54187,
                                value: 'Advertising Material Distribution Services',
                                options: [
                                    {
                                        id: 541870,
                                        value: 'Advertising Material Distribution Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54189,
                                value: 'Other Services Related to Advertising',
                                options: [
                                    {
                                        id: 541890,
                                        value: 'Other Services Related to Advertising',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5419,
                        value: 'Other Professional, Scientific, and Technical Services',
                        options: [
                            {
                                id: 54191,
                                value: 'Marketing Research and Public Opinion Polling',
                                options: [
                                    {
                                        id: 541910,
                                        value: 'Marketing Research and Public Opinion Polling',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54192,
                                value: 'Photographic Services',
                                options: [
                                    {
                                        id: 541921,
                                        value: 'Photography Studios, Portrait',
                                        options: [],
                                    },
                                    {
                                        id: 541922,
                                        value: 'Commercial Photography',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54193,
                                value: 'Translation and Interpretation Services',
                                options: [
                                    {
                                        id: 541930,
                                        value: 'Translation and Interpretation Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54194,
                                value: 'Veterinary Services',
                                options: [
                                    {
                                        id: 541940,
                                        value: 'Veterinary Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 54199,
                                value: 'All Other Professional, Scientific, and Technical Services',
                                options: [
                                    {
                                        id: 541990,
                                        value: 'All Other Professional, Scientific, and Technical Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 55,
        value: 'Management of Companies and Enterprises',
        options: [
            {
                id: 551,
                value: 'Management of Companies and Enterprises',
                options: [
                    {
                        id: 5511,
                        value: 'Management of Companies and Enterprises',
                        options: [
                            {
                                id: 55111,
                                value: 'Management of Companies and Enterprises',
                                options: [
                                    {
                                        id: 551111,
                                        value: 'Offices of Bank Holding Companies',
                                        options: [],
                                    },
                                    {
                                        id: 551112,
                                        value: 'Offices of Other Holding Companies',
                                        options: [],
                                    },
                                    {
                                        id: 551114,
                                        value: 'Corporate, Subsidiary, and Regional Managing Offices',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 56,
        value: 'Administrative and Support and Waste Management and Remediation Services',
        options: [
            {
                id: 561,
                value: 'Administrative and Support Services',
                options: [
                    {
                        id: 5611,
                        value: 'Office Administrative Services',
                        options: [
                            {
                                id: 56111,
                                value: 'Office Administrative Services',
                                options: [
                                    {
                                        id: 561110,
                                        value: 'Office Administrative Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5612,
                        value: 'Facilities Support Services',
                        options: [
                            {
                                id: 56121,
                                value: 'Facilities Support Services',
                                options: [
                                    {
                                        id: 561210,
                                        value: 'Facilities Support Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5613,
                        value: 'Employment Services',
                        options: [
                            {
                                id: 56131,
                                value: 'Employment Placement Agencies and Executive Search Services',
                                options: [
                                    {
                                        id: 561311,
                                        value: 'Employment Placement Agencies',
                                        options: [],
                                    },
                                    {
                                        id: 561312,
                                        value: 'Executive Search Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56132,
                                value: 'Temporary Help Services',
                                options: [
                                    {
                                        id: 561320,
                                        value: 'Temporary Help Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56133,
                                value: 'Professional Employer Organizations',
                                options: [
                                    {
                                        id: 561330,
                                        value: 'Professional Employer Organizations',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5614,
                        value: 'Business Support Services',
                        options: [
                            {
                                id: 56141,
                                value: 'Document Preparation Services',
                                options: [
                                    {
                                        id: 561410,
                                        value: 'Document Preparation Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56142,
                                value: 'Telephone Call Centers',
                                options: [
                                    {
                                        id: 561421,
                                        value: 'Telephone Answering Services',
                                        options: [],
                                    },
                                    {
                                        id: 561422,
                                        value: 'Telemarketing Bureaus and Other Contact Centers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56143,
                                value: 'Business Service Centers',
                                options: [
                                    {
                                        id: 561431,
                                        value: 'Private Mail Centers',
                                        options: [],
                                    },
                                    {
                                        id: 561439,
                                        value: 'Other Business Service Centers (including Copy Shops)',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56144,
                                value: 'Collection Agencies',
                                options: [
                                    {
                                        id: 561440,
                                        value: 'Collection Agencies',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56145,
                                value: 'Credit Bureaus',
                                options: [
                                    {
                                        id: 561450,
                                        value: 'Credit Bureaus',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56149,
                                value: 'Other Business Support Services',
                                options: [
                                    {
                                        id: 561491,
                                        value: 'Repossession Services',
                                        options: [],
                                    },
                                    {
                                        id: 561492,
                                        value: 'Court Reporting and Stenotype Services',
                                        options: [],
                                    },
                                    {
                                        id: 561499,
                                        value: 'All Other Business Support Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5615,
                        value: 'Travel Arrangement and Reservation Services',
                        options: [
                            {
                                id: 56151,
                                value: 'Travel Agencies',
                                options: [
                                    {
                                        id: 561510,
                                        value: 'Travel Agencies',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56152,
                                value: 'Tour Operators',
                                options: [
                                    {
                                        id: 561520,
                                        value: 'Tour Operators',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56159,
                                value: 'Other Travel Arrangement and Reservation Services',
                                options: [
                                    {
                                        id: 561591,
                                        value: 'Convention and Visitors Bureaus',
                                        options: [],
                                    },
                                    {
                                        id: 561599,
                                        value: 'All Other Travel Arrangement and Reservation Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5616,
                        value: 'Investigation and Security Services',
                        options: [
                            {
                                id: 56161,
                                value: 'Investigation, Guard, and Armored Car Services',
                                options: [
                                    {
                                        id: 561611,
                                        value: 'Investigation Services',
                                        options: [],
                                    },
                                    {
                                        id: 561612,
                                        value: 'Security Guards and Patrol Services',
                                        options: [],
                                    },
                                    {
                                        id: 561613,
                                        value: 'Armored Car Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56162,
                                value: 'Security Systems Services',
                                options: [
                                    {
                                        id: 561621,
                                        value: 'Security Systems Services (except Locksmiths)',
                                        options: [],
                                    },
                                    {
                                        id: 561622,
                                        value: 'Locksmiths',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5617,
                        value: 'Services to Buildings and Dwellings',
                        options: [
                            {
                                id: 56171,
                                value: 'Exterminating and Pest Control Services',
                                options: [
                                    {
                                        id: 561710,
                                        value: 'Exterminating and Pest Control Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56172,
                                value: 'Janitorial Services',
                                options: [
                                    {
                                        id: 561720,
                                        value: 'Janitorial Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56173,
                                value: 'Landscaping Services',
                                options: [
                                    {
                                        id: 561730,
                                        value: 'Landscaping Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56174,
                                value: 'Carpet and Upholstery Cleaning Services',
                                options: [
                                    {
                                        id: 561740,
                                        value: 'Carpet and Upholstery Cleaning Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56179,
                                value: 'Other Services to Buildings and Dwellings',
                                options: [
                                    {
                                        id: 561790,
                                        value: 'Other Services to Buildings and Dwellings',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5619,
                        value: 'Other Support Services',
                        options: [
                            {
                                id: 56191,
                                value: 'Packaging and Labeling Services',
                                options: [
                                    {
                                        id: 561910,
                                        value: 'Packaging and Labeling Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56192,
                                value: 'Convention and Trade Show Organizers',
                                options: [
                                    {
                                        id: 561920,
                                        value: 'Convention and Trade Show Organizers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56199,
                                value: 'All Other Support Services',
                                options: [
                                    {
                                        id: 561990,
                                        value: 'All Other Support Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 562,
                value: 'Waste Management and Remediation Services',
                options: [
                    {
                        id: 5621,
                        value: 'Waste Collection',
                        options: [
                            {
                                id: 56211,
                                value: 'Waste Collection',
                                options: [
                                    {
                                        id: 562111,
                                        value: 'Solid Waste Collection',
                                        options: [],
                                    },
                                    {
                                        id: 562112,
                                        value: 'Hazardous Waste Collection',
                                        options: [],
                                    },
                                    {
                                        id: 562119,
                                        value: 'Other Waste Collection',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5622,
                        value: 'Waste Treatment and Disposal',
                        options: [
                            {
                                id: 56221,
                                value: 'Waste Treatment and Disposal',
                                options: [
                                    {
                                        id: 562211,
                                        value: 'Hazardous Waste Treatment and Disposal',
                                        options: [],
                                    },
                                    {
                                        id: 562212,
                                        value: 'Solid Waste Landfill',
                                        options: [],
                                    },
                                    {
                                        id: 562213,
                                        value: 'Solid Waste Combustors and Incinerators',
                                        options: [],
                                    },
                                    {
                                        id: 562219,
                                        value: 'Other Nonhazardous Waste Treatment and Disposal',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 5629,
                        value: 'Remediation and Other Waste Management Services',
                        options: [
                            {
                                id: 56291,
                                value: 'Remediation Services',
                                options: [
                                    {
                                        id: 562910,
                                        value: 'Remediation Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56292,
                                value: 'Materials Recovery Facilities',
                                options: [
                                    {
                                        id: 562920,
                                        value: 'Materials Recovery Facilities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 56299,
                                value: 'All Other Waste Management Services',
                                options: [
                                    {
                                        id: 562991,
                                        value: 'Septic Tank and Related Services',
                                        options: [],
                                    },
                                    {
                                        id: 562998,
                                        value: 'All Other Miscellaneous Waste Management Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 61,
        value: 'Educational Services',
        options: [
            {
                id: 611,
                value: 'Educational Services',
                options: [
                    {
                        id: 6111,
                        value: 'Elementary and Secondary Schools',
                        options: [
                            {
                                id: 61111,
                                value: 'Elementary and Secondary Schools',
                                options: [
                                    {
                                        id: 611110,
                                        value: 'Elementary and Secondary Schools',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6112,
                        value: 'Junior Colleges',
                        options: [
                            {
                                id: 61121,
                                value: 'Junior Colleges',
                                options: [
                                    {
                                        id: 611210,
                                        value: 'Junior Colleges',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6113,
                        value: 'Colleges, Universities, and Professional Schools',
                        options: [
                            {
                                id: 61131,
                                value: 'Colleges, Universities, and Professional Schools',
                                options: [
                                    {
                                        id: 611310,
                                        value: 'Colleges, Universities, and Professional Schools',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6114,
                        value: 'Business Schools and Computer and Management Training',
                        options: [
                            {
                                id: 61141,
                                value: 'Business and Secretarial Schools',
                                options: [
                                    {
                                        id: 611410,
                                        value: 'Business and Secretarial Schools',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 61142,
                                value: 'Computer Training',
                                options: [
                                    {
                                        id: 611420,
                                        value: 'Computer Training',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 61143,
                                value: 'Professional and Management Development Training',
                                options: [
                                    {
                                        id: 611430,
                                        value: 'Professional and Management Development Training',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6115,
                        value: 'Technical and Trade Schools',
                        options: [
                            {
                                id: 61151,
                                value: 'Technical and Trade Schools',
                                options: [
                                    {
                                        id: 611511,
                                        value: 'Cosmetology and Barber Schools',
                                        options: [],
                                    },
                                    {
                                        id: 611512,
                                        value: 'Flight Training',
                                        options: [],
                                    },
                                    {
                                        id: 611513,
                                        value: 'Apprenticeship Training',
                                        options: [],
                                    },
                                    {
                                        id: 611519,
                                        value: 'Other Technical and Trade Schools',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6116,
                        value: 'Other Schools and Instruction',
                        options: [
                            {
                                id: 61161,
                                value: 'Fine Arts Schools',
                                options: [
                                    {
                                        id: 611610,
                                        value: 'Fine Arts Schools',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 61162,
                                value: 'Sports and Recreation Instruction',
                                options: [
                                    {
                                        id: 611620,
                                        value: 'Sports and Recreation Instruction',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 61163,
                                value: 'Language Schools',
                                options: [
                                    {
                                        id: 611630,
                                        value: 'Language Schools',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 61169,
                                value: 'All Other Schools and Instruction',
                                options: [
                                    {
                                        id: 611691,
                                        value: 'Exam Preparation and Tutoring',
                                        options: [],
                                    },
                                    {
                                        id: 611692,
                                        value: 'Automobile Driving Schools',
                                        options: [],
                                    },
                                    {
                                        id: 611699,
                                        value: 'All Other Miscellaneous Schools and Instruction',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6117,
                        value: 'Educational Support Services',
                        options: [
                            {
                                id: 61171,
                                value: 'Educational Support Services',
                                options: [
                                    {
                                        id: 611710,
                                        value: 'Educational Support Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 62,
        value: 'Health Care and Social Assistance',
        options: [
            {
                id: 621,
                value: 'Ambulatory Health Care Services',
                options: [
                    {
                        id: 6211,
                        value: 'Offices of Physicians',
                        options: [
                            {
                                id: 62111,
                                value: 'Offices of Physicians',
                                options: [
                                    {
                                        id: 621111,
                                        value: 'Offices of Physicians (except Mental Health Specialists)',
                                        options: [],
                                    },
                                    {
                                        id: 621112,
                                        value: 'Offices of Physicians, Mental Health Specialists',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6212,
                        value: 'Offices of Dentists',
                        options: [
                            {
                                id: 62121,
                                value: 'Offices of Dentists',
                                options: [
                                    {
                                        id: 621210,
                                        value: 'Offices of Dentists',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6213,
                        value: 'Offices of Other Health Practitioners',
                        options: [
                            {
                                id: 62131,
                                value: 'Offices of Chiropractors',
                                options: [
                                    {
                                        id: 621310,
                                        value: 'Offices of Chiropractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62132,
                                value: 'Offices of Optometrists',
                                options: [
                                    {
                                        id: 621320,
                                        value: 'Offices of Optometrists',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62133,
                                value: 'Offices of Mental Health Practitioners (except Physicians)',
                                options: [
                                    {
                                        id: 621330,
                                        value: 'Offices of Mental Health Practitioners (except Physicians)',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62134,
                                value: 'Offices of Physical, Occupational and Speech Therapists, and Audiologists',
                                options: [
                                    {
                                        id: 621340,
                                        value: 'Offices of Physical, Occupational and Speech Therapists, and Audiologists',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62139,
                                value: 'Offices of All Other Health Practitioners',
                                options: [
                                    {
                                        id: 621391,
                                        value: 'Offices of Podiatrists',
                                        options: [],
                                    },
                                    {
                                        id: 621399,
                                        value: 'Offices of All Other Miscellaneous Health Practitioners',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6214,
                        value: 'Outpatient Care Centers',
                        options: [
                            {
                                id: 62141,
                                value: 'Family Planning Centers',
                                options: [
                                    {
                                        id: 621410,
                                        value: 'Family Planning Centers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62142,
                                value: 'Outpatient Mental Health and Substance Abuse Centers',
                                options: [
                                    {
                                        id: 621420,
                                        value: 'Outpatient Mental Health and Substance Abuse Centers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62149,
                                value: 'Other Outpatient Care Centers',
                                options: [
                                    {
                                        id: 621491,
                                        value: 'HMO Medical Centers',
                                        options: [],
                                    },
                                    {
                                        id: 621492,
                                        value: 'Kidney Dialysis Centers',
                                        options: [],
                                    },
                                    {
                                        id: 621493,
                                        value: 'Freestanding Ambulatory Surgical and Emergency Centers',
                                        options: [],
                                    },
                                    {
                                        id: 621498,
                                        value: 'All Other Outpatient Care Centers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6215,
                        value: 'Medical and Diagnostic Laboratories',
                        options: [
                            {
                                id: 62151,
                                value: 'Medical and Diagnostic Laboratories',
                                options: [
                                    {
                                        id: 621511,
                                        value: 'Medical Laboratories',
                                        options: [],
                                    },
                                    {
                                        id: 621512,
                                        value: 'Diagnostic Imaging Centers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6216,
                        value: 'Home Health Care Services',
                        options: [
                            {
                                id: 62161,
                                value: 'Home Health Care Services',
                                options: [
                                    {
                                        id: 621610,
                                        value: 'Home Health Care Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6219,
                        value: 'Other Ambulatory Health Care Services',
                        options: [
                            {
                                id: 62191,
                                value: 'Ambulance Services',
                                options: [
                                    {
                                        id: 621910,
                                        value: 'Ambulance Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62199,
                                value: 'All Other Ambulatory Health Care Services',
                                options: [
                                    {
                                        id: 621991,
                                        value: 'Blood and Organ Banks',
                                        options: [],
                                    },
                                    {
                                        id: 621999,
                                        value: 'All Other Miscellaneous Ambulatory Health Care Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 622,
                value: 'Hospitals',
                options: [
                    {
                        id: 6221,
                        value: 'General Medical and Surgical Hospitals',
                        options: [
                            {
                                id: 62211,
                                value: 'General Medical and Surgical Hospitals',
                                options: [
                                    {
                                        id: 622110,
                                        value: 'General Medical and Surgical Hospitals',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6222,
                        value: 'Psychiatric and Substance Abuse Hospitals',
                        options: [
                            {
                                id: 62221,
                                value: 'Psychiatric and Substance Abuse Hospitals',
                                options: [
                                    {
                                        id: 622210,
                                        value: 'Psychiatric and Substance Abuse Hospitals',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6223,
                        value: 'Specialty (except Psychiatric and Substance Abuse) Hospitals',
                        options: [
                            {
                                id: 62231,
                                value: 'Specialty (except Psychiatric and Substance Abuse) Hospitals',
                                options: [
                                    {
                                        id: 622310,
                                        value: 'Specialty (except Psychiatric and Substance Abuse) Hospitals',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 623,
                value: 'Nursing and Residential Care Facilities',
                options: [
                    {
                        id: 6231,
                        value: 'Nursing Care Facilities (Skilled Nursing Facilities)',
                        options: [
                            {
                                id: 62311,
                                value: 'Nursing Care Facilities (Skilled Nursing Facilities)',
                                options: [
                                    {
                                        id: 623110,
                                        value: 'Nursing Care Facilities (Skilled Nursing Facilities)',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6232,
                        value: 'Residential Intellectual and Developmental Disability, Mental Health, and Substance Abuse Facilities',
                        options: [
                            {
                                id: 62321,
                                value: 'Residential Intellectual and Developmental Disability Facilities',
                                options: [
                                    {
                                        id: 623210,
                                        value: 'Residential Intellectual and Developmental Disability Facilities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62322,
                                value: 'Residential Mental Health and Substance Abuse Facilities',
                                options: [
                                    {
                                        id: 623220,
                                        value: 'Residential Mental Health and Substance Abuse Facilities',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6233,
                        value: 'Continuing Care Retirement Communities and Assisted Living Facilities for the Elderly',
                        options: [
                            {
                                id: 62331,
                                value: 'Continuing Care Retirement Communities and Assisted Living Facilities for the Elderly',
                                options: [
                                    {
                                        id: 623311,
                                        value: 'Continuing Care Retirement Communities',
                                        options: [],
                                    },
                                    {
                                        id: 623312,
                                        value: 'Assisted Living Facilities for the Elderly',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6239,
                        value: 'Other Residential Care Facilities',
                        options: [
                            {
                                id: 62399,
                                value: 'Other Residential Care Facilities',
                                options: [
                                    {
                                        id: 623990,
                                        value: 'Other Residential Care Facilities',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 624,
                value: 'Social Assistance',
                options: [
                    {
                        id: 6241,
                        value: 'Individual and Family Services',
                        options: [
                            {
                                id: 62411,
                                value: 'Child and Youth Services',
                                options: [
                                    {
                                        id: 624110,
                                        value: 'Child and Youth Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62412,
                                value: 'Services for the Elderly and Persons with Disabilities',
                                options: [
                                    {
                                        id: 624120,
                                        value: 'Services for the Elderly and Persons with Disabilities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62419,
                                value: 'Other Individual and Family Services',
                                options: [
                                    {
                                        id: 624190,
                                        value: 'Other Individual and Family Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6242,
                        value: 'Community Food and Housing, and Emergency and Other Relief Services',
                        options: [
                            {
                                id: 62421,
                                value: 'Community Food Services',
                                options: [
                                    {
                                        id: 624210,
                                        value: 'Community Food Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62422,
                                value: 'Community Housing Services',
                                options: [
                                    {
                                        id: 624221,
                                        value: 'Temporary Shelters',
                                        options: [],
                                    },
                                    {
                                        id: 624229,
                                        value: 'Other Community Housing Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 62423,
                                value: 'Emergency and Other Relief Services',
                                options: [
                                    {
                                        id: 624230,
                                        value: 'Emergency and Other Relief Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6243,
                        value: 'Vocational Rehabilitation Services',
                        options: [
                            {
                                id: 62431,
                                value: 'Vocational Rehabilitation Services',
                                options: [
                                    {
                                        id: 624310,
                                        value: 'Vocational Rehabilitation Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 6244,
                        value: 'Child Day Care Services',
                        options: [
                            {
                                id: 62441,
                                value: 'Child Day Care Services',
                                options: [
                                    {
                                        id: 624410,
                                        value: 'Child Day Care Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 71,
        value: 'Arts, Entertainment, and Recreation',
        options: [
            {
                id: 711,
                value: 'Performing Arts, Spectator Sports, and Related Industries',
                options: [
                    {
                        id: 7111,
                        value: 'Performing Arts Companies',
                        options: [
                            {
                                id: 71111,
                                value: 'Theater Companies and Dinner Theaters',
                                options: [
                                    {
                                        id: 711110,
                                        value: 'Theater Companies and Dinner Theaters',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71112,
                                value: 'Dance Companies',
                                options: [
                                    {
                                        id: 711120,
                                        value: 'Dance Companies',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71113,
                                value: 'Musical Groups and Artists',
                                options: [
                                    {
                                        id: 711130,
                                        value: 'Musical Groups and Artists',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71119,
                                value: 'Other Performing Arts Companies',
                                options: [
                                    {
                                        id: 711190,
                                        value: 'Other Performing Arts Companies',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7112,
                        value: 'Spectator Sports',
                        options: [
                            {
                                id: 71121,
                                value: 'Spectator Sports',
                                options: [
                                    {
                                        id: 711211,
                                        value: 'Sports Teams and Clubs',
                                        options: [],
                                    },
                                    {
                                        id: 711212,
                                        value: 'Racetracks',
                                        options: [],
                                    },
                                    {
                                        id: 711219,
                                        value: 'Other Spectator Sports',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7113,
                        value: 'Promoters of Performing Arts, Sports, and Similar Events',
                        options: [
                            {
                                id: 71131,
                                value: 'Promoters of Performing Arts, Sports, and Similar Events with Facilities',
                                options: [
                                    {
                                        id: 711310,
                                        value: 'Promoters of Performing Arts, Sports, and Similar Events with Facilities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71132,
                                value: 'Promoters of Performing Arts, Sports, and Similar Events without Facilities',
                                options: [
                                    {
                                        id: 711320,
                                        value: 'Promoters of Performing Arts, Sports, and Similar Events without Facilities',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7114,
                        value: 'Agents and Managers for Artists, Athletes, Entertainers, and Other Public Figures',
                        options: [
                            {
                                id: 71141,
                                value: 'Agents and Managers for Artists, Athletes, Entertainers, and Other Public Figures',
                                options: [
                                    {
                                        id: 711410,
                                        value: 'Agents and Managers for Artists, Athletes, Entertainers, and Other Public Figures',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7115,
                        value: 'Independent Artists, Writers, and Performers',
                        options: [
                            {
                                id: 71151,
                                value: 'Independent Artists, Writers, and Performers',
                                options: [
                                    {
                                        id: 711510,
                                        value: 'Independent Artists, Writers, and Performers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 712,
                value: 'Museums, Historical Sites, and Similar Institutions',
                options: [
                    {
                        id: 7121,
                        value: 'Museums, Historical Sites, and Similar Institutions',
                        options: [
                            {
                                id: 71211,
                                value: 'Museums',
                                options: [
                                    {
                                        id: 712110,
                                        value: 'Museums',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71212,
                                value: 'Historical Sites',
                                options: [
                                    {
                                        id: 712120,
                                        value: 'Historical Sites',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71213,
                                value: 'Zoos and Botanical Gardens',
                                options: [
                                    {
                                        id: 712130,
                                        value: 'Zoos and Botanical Gardens',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71219,
                                value: 'Nature Parks and Other Similar Institutions',
                                options: [
                                    {
                                        id: 712190,
                                        value: 'Nature Parks and Other Similar Institutions',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 713,
                value: 'Amusement, Gambling, and Recreation Industries',
                options: [
                    {
                        id: 7131,
                        value: 'Amusement Parks and Arcades',
                        options: [
                            {
                                id: 71311,
                                value: 'Amusement and Theme Parks',
                                options: [
                                    {
                                        id: 713110,
                                        value: 'Amusement and Theme Parks',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71312,
                                value: 'Amusement Arcades',
                                options: [
                                    {
                                        id: 713120,
                                        value: 'Amusement Arcades',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7132,
                        value: 'Gambling Industries',
                        options: [
                            {
                                id: 71321,
                                value: 'Casinos (except Casino Hotels)',
                                options: [
                                    {
                                        id: 713210,
                                        value: 'Casinos (except Casino Hotels)',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71329,
                                value: 'Other Gambling Industries',
                                options: [
                                    {
                                        id: 713290,
                                        value: 'Other Gambling Industries',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7139,
                        value: 'Other Amusement and Recreation Industries',
                        options: [
                            {
                                id: 71391,
                                value: 'Golf Courses and Country Clubs',
                                options: [
                                    {
                                        id: 713910,
                                        value: 'Golf Courses and Country Clubs',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71392,
                                value: 'Skiing Facilities',
                                options: [
                                    {
                                        id: 713920,
                                        value: 'Skiing Facilities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71393,
                                value: 'Marinas',
                                options: [
                                    {
                                        id: 713930,
                                        value: 'Marinas',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71394,
                                value: 'Fitness and Recreational Sports Centers',
                                options: [
                                    {
                                        id: 713940,
                                        value: 'Fitness and Recreational Sports Centers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71395,
                                value: 'Bowling Centers',
                                options: [
                                    {
                                        id: 713950,
                                        value: 'Bowling Centers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 71399,
                                value: 'All Other Amusement and Recreation Industries',
                                options: [
                                    {
                                        id: 713990,
                                        value: 'All Other Amusement and Recreation Industries',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 72,
        value: 'Accommodation and Food Services',
        options: [
            {
                id: 721,
                value: 'Accommodation',
                options: [
                    {
                        id: 7211,
                        value: 'Traveler Accommodation',
                        options: [
                            {
                                id: 72111,
                                value: 'Hotels (except Casino Hotels) and Motels',
                                options: [
                                    {
                                        id: 721110,
                                        value: 'Hotels (except Casino Hotels) and Motels',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 72112,
                                value: 'Casino Hotels',
                                options: [
                                    {
                                        id: 721120,
                                        value: 'Casino Hotels',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 72119,
                                value: 'Other Traveler Accommodation',
                                options: [
                                    {
                                        id: 721191,
                                        value: 'Bed-and-Breakfast Inns',
                                        options: [],
                                    },
                                    {
                                        id: 721199,
                                        value: 'All Other Traveler Accommodation',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7212,
                        value: 'RV (Recreational Vehicle) Parks and Recreational Camps',
                        options: [
                            {
                                id: 72121,
                                value: 'RV (Recreational Vehicle) Parks and Recreational Camps',
                                options: [
                                    {
                                        id: 721211,
                                        value: 'RV (Recreational Vehicle) Parks and Campgrounds',
                                        options: [],
                                    },
                                    {
                                        id: 721214,
                                        value: 'Recreational and Vacation Camps (except Campgrounds)',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7213,
                        value: "Rooming and Boarding Houses, Dormitories, and Workers' Camps",
                        options: [
                            {
                                id: 72131,
                                value: "Rooming and Boarding Houses, Dormitories, and Workers' Camps",
                                options: [
                                    {
                                        id: 721310,
                                        value: "Rooming and Boarding Houses, Dormitories, and Workers' Camps",
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 722,
                value: 'Food Services and Drinking Places',
                options: [
                    {
                        id: 7223,
                        value: 'Special Food Services',
                        options: [
                            {
                                id: 72231,
                                value: 'Food Service Contractors',
                                options: [
                                    {
                                        id: 722310,
                                        value: 'Food Service Contractors',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 72232,
                                value: 'Caterers',
                                options: [
                                    {
                                        id: 722320,
                                        value: 'Caterers',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 72233,
                                value: 'Mobile Food Services',
                                options: [
                                    {
                                        id: 722330,
                                        value: 'Mobile Food Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7224,
                        value: 'Drinking Places (Alcoholic Beverages)',
                        options: [
                            {
                                id: 72241,
                                value: 'Drinking Places (Alcoholic Beverages)',
                                options: [
                                    {
                                        id: 722410,
                                        value: 'Drinking Places (Alcoholic Beverages)',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 7225,
                        value: 'Restaurants and Other Eating Places',
                        options: [
                            {
                                id: 72251,
                                value: 'Restaurants and Other Eating Places',
                                options: [
                                    {
                                        id: 722511,
                                        value: 'Full-Service Restaurants',
                                        options: [],
                                    },
                                    {
                                        id: 722513,
                                        value: 'Limited-Service Restaurants',
                                        options: [],
                                    },
                                    {
                                        id: 722514,
                                        value: 'Cafeterias, Grill Buffets, and Buffets',
                                        options: [],
                                    },
                                    {
                                        id: 722515,
                                        value: 'Snack and Nonalcoholic Beverage Bars',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 81,
        value: 'Other Services (except Public Administration)',
        options: [
            {
                id: 811,
                value: 'Repair and Maintenance',
                options: [
                    {
                        id: 8111,
                        value: 'Automotive Repair and Maintenance',
                        options: [
                            {
                                id: 81111,
                                value: 'Automotive Mechanical and Electrical Repair and Maintenance',
                                options: [
                                    {
                                        id: 811111,
                                        value: 'General Automotive Repair',
                                        options: [],
                                    },
                                    {
                                        id: 811112,
                                        value: 'Automotive Exhaust System Repair',
                                        options: [],
                                    },
                                    {
                                        id: 811113,
                                        value: 'Automotive Transmission Repair',
                                        options: [],
                                    },
                                    {
                                        id: 811118,
                                        value: 'Other Automotive Mechanical and Electrical Repair and Maintenance',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81112,
                                value: 'Automotive Body, Paint, Interior, and Glass Repair',
                                options: [
                                    {
                                        id: 811121,
                                        value: 'Automotive Body, Paint, and Interior Repair and Maintenance',
                                        options: [],
                                    },
                                    {
                                        id: 811122,
                                        value: 'Automotive Glass Replacement Shops',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81119,
                                value: 'Other Automotive Repair and Maintenance',
                                options: [
                                    {
                                        id: 811191,
                                        value: 'Automotive Oil Change and Lubrication Shops',
                                        options: [],
                                    },
                                    {
                                        id: 811192,
                                        value: 'Car Washes',
                                        options: [],
                                    },
                                    {
                                        id: 811198,
                                        value: 'All Other Automotive Repair and Maintenance',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8112,
                        value: 'Electronic and Precision Equipment Repair and Maintenance',
                        options: [
                            {
                                id: 81121,
                                value: 'Electronic and Precision Equipment Repair and Maintenance',
                                options: [
                                    {
                                        id: 811211,
                                        value: 'Consumer Electronics Repair and Maintenance',
                                        options: [],
                                    },
                                    {
                                        id: 811212,
                                        value: 'Computer and Office Machine Repair and Maintenance',
                                        options: [],
                                    },
                                    {
                                        id: 811213,
                                        value: 'Communication Equipment Repair and Maintenance',
                                        options: [],
                                    },
                                    {
                                        id: 811219,
                                        value: 'Other Electronic and Precision Equipment Repair and Maintenance',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8113,
                        value: 'Commercial and Industrial Machinery and Equipment (except Automotive and Electronic) Repair and Maintenance',
                        options: [
                            {
                                id: 81131,
                                value: 'Commercial and Industrial Machinery and Equipment (except Automotive and Electronic) Repair and Maintenance',
                                options: [
                                    {
                                        id: 811310,
                                        value: 'Commercial and Industrial Machinery and Equipment (except Automotive and Electronic) Repair and Maintenance',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8114,
                        value: 'Personal and Household Goods Repair and Maintenance',
                        options: [
                            {
                                id: 81141,
                                value: 'Home and Garden Equipment and Appliance Repair and Maintenance',
                                options: [
                                    {
                                        id: 811411,
                                        value: 'Home and Garden Equipment Repair and Maintenance',
                                        options: [],
                                    },
                                    {
                                        id: 811412,
                                        value: 'Appliance Repair and Maintenance',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81142,
                                value: 'Reupholstery and Furniture Repair',
                                options: [
                                    {
                                        id: 811420,
                                        value: 'Reupholstery and Furniture Repair',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81143,
                                value: 'Footwear and Leather Goods Repair',
                                options: [
                                    {
                                        id: 811430,
                                        value: 'Footwear and Leather Goods Repair',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81149,
                                value: 'Other Personal and Household Goods Repair and Maintenance',
                                options: [
                                    {
                                        id: 811490,
                                        value: 'Other Personal and Household Goods Repair and Maintenance',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 812,
                value: 'Personal and Laundry Services',
                options: [
                    {
                        id: 8121,
                        value: 'Personal Care Services',
                        options: [
                            {
                                id: 81211,
                                value: 'Hair, Nail, and Skin Care Services',
                                options: [
                                    {
                                        id: 812111,
                                        value: 'Barber Shops',
                                        options: [],
                                    },
                                    {
                                        id: 812112,
                                        value: 'Beauty Salons',
                                        options: [],
                                    },
                                    {
                                        id: 812113,
                                        value: 'Nail Salons',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81219,
                                value: 'Other Personal Care Services',
                                options: [
                                    {
                                        id: 812191,
                                        value: 'Diet and Weight Reducing Centers',
                                        options: [],
                                    },
                                    {
                                        id: 812199,
                                        value: 'Other Personal Care Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8122,
                        value: 'Death Care Services',
                        options: [
                            {
                                id: 81221,
                                value: 'Funeral Homes and Funeral Services',
                                options: [
                                    {
                                        id: 812210,
                                        value: 'Funeral Homes and Funeral Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81222,
                                value: 'Cemeteries and Crematories',
                                options: [
                                    {
                                        id: 812220,
                                        value: 'Cemeteries and Crematories',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8123,
                        value: 'Drycleaning and Laundry Services',
                        options: [
                            {
                                id: 81231,
                                value: 'Coin-Operated Laundries and Drycleaners',
                                options: [
                                    {
                                        id: 812310,
                                        value: 'Coin-Operated Laundries and Drycleaners',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81232,
                                value: 'Drycleaning and Laundry Services (except Coin-Operated)',
                                options: [
                                    {
                                        id: 812320,
                                        value: 'Drycleaning and Laundry Services (except Coin-Operated)',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81233,
                                value: 'Linen and Uniform Supply',
                                options: [
                                    {
                                        id: 812331,
                                        value: 'Linen Supply',
                                        options: [],
                                    },
                                    {
                                        id: 812332,
                                        value: 'Industrial Launderers',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8129,
                        value: 'Other Personal Services',
                        options: [
                            {
                                id: 81291,
                                value: 'Pet Care (except Veterinary) Services',
                                options: [
                                    {
                                        id: 812910,
                                        value: 'Pet Care (except Veterinary) Services',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81292,
                                value: 'Photofinishing',
                                options: [
                                    {
                                        id: 812921,
                                        value: 'Photofinishing Laboratories (except One-Hour)',
                                        options: [],
                                    },
                                    {
                                        id: 812922,
                                        value: 'One-Hour Photofinishing',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81293,
                                value: 'Parking Lots and Garages',
                                options: [
                                    {
                                        id: 812930,
                                        value: 'Parking Lots and Garages',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81299,
                                value: 'All Other Personal Services',
                                options: [
                                    {
                                        id: 812990,
                                        value: 'All Other Personal Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 813,
                value: 'Religious, Grantmaking, Civic, Professional, and Similar Organizations',
                options: [
                    {
                        id: 8131,
                        value: 'Religious Organizations',
                        options: [
                            {
                                id: 81311,
                                value: 'Religious Organizations',
                                options: [
                                    {
                                        id: 813110,
                                        value: 'Religious Organizations',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8132,
                        value: 'Grantmaking and Giving Services',
                        options: [
                            {
                                id: 81321,
                                value: 'Grantmaking and Giving Services',
                                options: [
                                    {
                                        id: 813211,
                                        value: 'Grantmaking Foundations',
                                        options: [],
                                    },
                                    {
                                        id: 813212,
                                        value: 'Voluntary Health Organizations',
                                        options: [],
                                    },
                                    {
                                        id: 813219,
                                        value: 'Other Grantmaking and Giving Services',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8133,
                        value: 'Social Advocacy Organizations',
                        options: [
                            {
                                id: 81331,
                                value: 'Social Advocacy Organizations',
                                options: [
                                    {
                                        id: 813311,
                                        value: 'Human Rights Organizations',
                                        options: [],
                                    },
                                    {
                                        id: 813312,
                                        value: 'Environment, Conservation and Wildlife Organizations',
                                        options: [],
                                    },
                                    {
                                        id: 813319,
                                        value: 'Other Social Advocacy Organizations',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8134,
                        value: 'Civic and Social Organizations',
                        options: [
                            {
                                id: 81341,
                                value: 'Civic and Social Organizations',
                                options: [
                                    {
                                        id: 813410,
                                        value: 'Civic and Social Organizations',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: 8139,
                        value: 'Business, Professional, Labor, Political, and Similar Organizations',
                        options: [
                            {
                                id: 81391,
                                value: 'Business Associations',
                                options: [
                                    {
                                        id: 813910,
                                        value: 'Business Associations',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81392,
                                value: 'Professional Organizations',
                                options: [
                                    {
                                        id: 813920,
                                        value: 'Professional Organizations',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81393,
                                value: 'Labor Unions and Similar Labor Organizations',
                                options: [
                                    {
                                        id: 813930,
                                        value: 'Labor Unions and Similar Labor Organizations',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81394,
                                value: 'Political Organizations',
                                options: [
                                    {
                                        id: 813940,
                                        value: 'Political Organizations',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 81399,
                                value: 'Other Similar Organizations (except Business, Professional, Labor, and Political Organizations)',
                                options: [
                                    {
                                        id: 813990,
                                        value: 'Other Similar Organizations (except Business, Professional, Labor, and Political Organizations)',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 814,
                value: 'Private Households',
                options: [
                    {
                        id: 8141,
                        value: 'Private Households',
                        options: [
                            {
                                id: 81411,
                                value: 'Private Households',
                                options: [
                                    {
                                        id: 814110,
                                        value: 'Private Households',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        id: 92,
        value: 'Public Administration',
        options: [
            {
                id: 921,
                value: 'Executive, Legislative, and Other General Government Support',
                options: [
                    {
                        id: 9211,
                        value: 'Executive, Legislative, and Other General Government Support',
                        options: [
                            {
                                id: 92111,
                                value: 'Executive Offices',
                                options: [
                                    {
                                        id: 921110,
                                        value: 'Executive Offices',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92112,
                                value: 'Legislative Bodies',
                                options: [
                                    {
                                        id: 921120,
                                        value: 'Legislative Bodies',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92113,
                                value: 'Public Finance Activities',
                                options: [
                                    {
                                        id: 921130,
                                        value: 'Public Finance Activities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92114,
                                value: 'Executive and Legislative Offices, Combined',
                                options: [
                                    {
                                        id: 921140,
                                        value: 'Executive and Legislative Offices, Combined',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92115,
                                value: 'American Indian and Alaska Native Tribal Governments',
                                options: [
                                    {
                                        id: 921150,
                                        value: 'American Indian and Alaska Native Tribal Governments',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92119,
                                value: 'Other General Government Support',
                                options: [
                                    {
                                        id: 921190,
                                        value: 'Other General Government Support',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 922,
                value: 'Justice, Public Order, and Safety Activities',
                options: [
                    {
                        id: 9221,
                        value: 'Justice, Public Order, and Safety Activities',
                        options: [
                            {
                                id: 92211,
                                value: 'Courts',
                                options: [
                                    {
                                        id: 922110,
                                        value: 'Courts',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92212,
                                value: 'Police Protection',
                                options: [
                                    {
                                        id: 922120,
                                        value: 'Police Protection',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92213,
                                value: 'Legal Counsel and Prosecution',
                                options: [
                                    {
                                        id: 922130,
                                        value: 'Legal Counsel and Prosecution',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92214,
                                value: 'Correctional Institutions',
                                options: [
                                    {
                                        id: 922140,
                                        value: 'Correctional Institutions',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92215,
                                value: 'Parole Offices and Probation Offices',
                                options: [
                                    {
                                        id: 922150,
                                        value: 'Parole Offices and Probation Offices',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92216,
                                value: 'Fire Protection',
                                options: [
                                    {
                                        id: 922160,
                                        value: 'Fire Protection',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92219,
                                value: 'Other Justice, Public Order, and Safety Activities',
                                options: [
                                    {
                                        id: 922190,
                                        value: 'Other Justice, Public Order, and Safety Activities',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 923,
                value: 'Administration of Human Resource Programs',
                options: [
                    {
                        id: 9231,
                        value: 'Administration of Human Resource Programs',
                        options: [
                            {
                                id: 92311,
                                value: 'Administration of Education Programs',
                                options: [
                                    {
                                        id: 923110,
                                        value: 'Administration of Education Programs',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92312,
                                value: 'Administration of Public Health Programs',
                                options: [
                                    {
                                        id: 923120,
                                        value: 'Administration of Public Health Programs',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92313,
                                value: "Administration of Human Resource Programs (except Education, Public Health, and Veterans' Affairs Programs)",
                                options: [
                                    {
                                        id: 923130,
                                        value: "Administration of Human Resource Programs (except Education, Public Health, and Veterans' Affairs Programs)",
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92314,
                                value: "Administration of Veterans' Affairs",
                                options: [
                                    {
                                        id: 923140,
                                        value: "Administration of Veterans' Affairs",
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 924,
                value: 'Administration of Environmental Quality Programs',
                options: [
                    {
                        id: 9241,
                        value: 'Administration of Environmental Quality Programs',
                        options: [
                            {
                                id: 92411,
                                value: 'Administration of Air and Water Resource and Solid Waste Management Programs',
                                options: [
                                    {
                                        id: 924110,
                                        value: 'Administration of Air and Water Resource and Solid Waste Management Programs',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92412,
                                value: 'Administration of Conservation Programs',
                                options: [
                                    {
                                        id: 924120,
                                        value: 'Administration of Conservation Programs',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 925,
                value: 'Administration of Housing Programs, Urban Planning, and Community Development',
                options: [
                    {
                        id: 9251,
                        value: 'Administration of Housing Programs, Urban Planning, and Community Development',
                        options: [
                            {
                                id: 92511,
                                value: 'Administration of Housing Programs',
                                options: [
                                    {
                                        id: 925110,
                                        value: 'Administration of Housing Programs',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92512,
                                value: 'Administration of Urban Planning and Community and Rural Development',
                                options: [
                                    {
                                        id: 925120,
                                        value: 'Administration of Urban Planning and Community and Rural Development',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 926,
                value: 'Administration of Economic Programs',
                options: [
                    {
                        id: 9261,
                        value: 'Administration of Economic Programs',
                        options: [
                            {
                                id: 92611,
                                value: 'Administration of General Economic Programs',
                                options: [
                                    {
                                        id: 926110,
                                        value: 'Administration of General Economic Programs',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92612,
                                value: 'Regulation and Administration of Transportation Programs',
                                options: [
                                    {
                                        id: 926120,
                                        value: 'Regulation and Administration of Transportation Programs',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92613,
                                value: 'Regulation and Administration of Communications, Electric, Gas, and Other Utilities',
                                options: [
                                    {
                                        id: 926130,
                                        value: 'Regulation and Administration of Communications, Electric, Gas, and Other Utilities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92614,
                                value: 'Regulation of Agricultural Marketing and Commodities',
                                options: [
                                    {
                                        id: 926140,
                                        value: 'Regulation of Agricultural Marketing and Commodities',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92615,
                                value: 'Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors',
                                options: [
                                    {
                                        id: 926150,
                                        value: 'Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 927,
                value: 'Space Research and Technology',
                options: [
                    {
                        id: 9271,
                        value: 'Space Research and Technology',
                        options: [
                            {
                                id: 92711,
                                value: 'Space Research and Technology',
                                options: [
                                    {
                                        id: 927110,
                                        value: 'Space Research and Technology',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                id: 928,
                value: 'National Security and International Affairs',
                options: [
                    {
                        id: 9281,
                        value: 'National Security and International Affairs',
                        options: [
                            {
                                id: 92811,
                                value: 'National Security',
                                options: [
                                    {
                                        id: 928110,
                                        value: 'National Security',
                                        options: [],
                                    },
                                ],
                            },
                            {
                                id: 92812,
                                value: 'International Affairs',
                                options: [
                                    {
                                        id: 928120,
                                        value: 'International Affairs',
                                        options: [],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

const NAICS_MAPPING_WITH_ID: Record<string, NAICSItemWithoutOptions[]> = {};
const ALL_NAICS: NAICSItemWithoutOptions[] = [];

function getNAICSMappingWithId(item: NAICSItem) {
    ALL_NAICS.push({
        id: item.id,
        value: item.value,
    });

    NAICS_MAPPING_WITH_ID[item.id] = item.options.map((option) => {
        return {
            id: option.id,
            value: option.value,
        };
    });

    for (const option of item.options) {
        if (option.options.length === 0) {
            continue;
        }
        getNAICSMappingWithId(option);
    }
}

function buildNAICS() {
    for (const item of NAICS) {
        getNAICSMappingWithId(item);
    }
}

buildNAICS();

export {NAICS, NAICS_MAPPING_WITH_ID, ALL_NAICS};
