const annualVolumeRange = [
    {
        id: '0',
        name: 'Undefined',
        stringValue: 'Undefined',
    },
    {
        id: '1',
        name: 'LessThan25000',
        stringValue: 'Less than 25000',
    },
    {
        id: '2',
        name: 'TwentyFiveThousandToFiftyThousand',
        stringValue: '25,000 - 50,000',
    },
    {
        id: '3',
        name: 'FiftyThousandToSeventyFiveThousand',
        stringValue: '50,000 – 75,000',
    },
    {
        id: '4',
        name: 'SeventyFiveToOneHundredThousand',
        stringValue: '75,000 – 100,000',
    },
    {
        id: '5',
        name: 'OneHundredToOneHundredFiftyThousand',
        stringValue: '100,000 – 150,000',
    },
    {
        id: '6',
        name: 'OneHundredFiftyToTwoHundredThousand',
        stringValue: '150,000 – 200,000',
    },
    {
        id: '7',
        name: 'TwoHundredToTwoHundredFiftyThousand',
        stringValue: '200,000 – 250,000',
    },
    {
        id: '8',
        name: 'TwoHundredFiftyToThreeHundredThousand',
        stringValue: '250,000 – 300,000',
    },
    {
        id: '9',
        name: 'ThreeHundredToFourHundredThousand',
        stringValue: '300,000 – 400,000',
    },
    {
        id: '10',
        name: 'FourHundredToFiveHundredThousand',
        stringValue: '400,000 – 500,000',
    },
    {
        id: '11',
        name: 'FiveHundredToSevenHundredFiftyThousand',
        stringValue: '500,000 – 750,000',
    },
    {
        id: '12',
        name: 'SevenHundredFiftyThousandToOneMillion',
        stringValue: '750,000 – 1 million',
    },
    {
        id: '13',
        name: 'OneMillionToTwoMillion',
        stringValue: '1 million – 2 million',
    },
    {
        id: '14',
        name: 'TwoMillionToThreeMillion',
        stringValue: '2 million – 3 million',
    },
    {
        id: '15',
        name: 'ThreeMillionToFiveMillion',
        stringValue: '3 million – 5 million',
    },
    {
        id: '16',
        name: 'FiveMillionToSevenPointFiveMillion',
        stringValue: '5 million – 7.5 million',
    },
    {
        id: '17',
        name: 'SevenPointFiveMillionToTenMillion',
        stringValue: '7.5 million – 10 million',
    },
    {
        id: '18',
        name: 'GreaterThan10Million',
        stringValue: 'Greater than 10 Million',
    },
];

// eslint-disable-next-line rulesdir/no-negated-variables
const applicantType = [
    {
        id: '0',
        name: 'Undefined',
        stringValue: 'Undefined',
    },
    {
        id: '1',
        name: 'Corporation',
        stringValue: 'Corporation',
    },
    {
        id: '2',
        name: 'Limited_Liability_Company',
        stringValue: 'Limited Liability Company (e.g., LLC, LC)',
    },
    {
        id: '3',
        name: 'Partnership',
        stringValue: 'Partnership',
    },
    {
        id: '4',
        name: 'Partnership_UK',
        stringValue: 'Partnership UK',
    },
    {
        id: '5',
        name: 'Unincorporated_Entity',
        stringValue: 'Unincorporated Entity',
    },
    {
        id: '6',
        name: 'Sole_Proprietorship_Sole_Trader',
        stringValue: 'Sole Proprietorship/Sole Trader',
    },
    {
        id: '7',
        name: 'Private_person_Entity',
        stringValue: 'Private person/ Entity',
    },
    {
        id: '8',
        name: 'Personal_Account',
        stringValue: 'Personal Account',
    },
    {
        id: '9',
        name: 'Financial_Institution',
        stringValue: 'Financial Institution',
    },
    {
        id: '10',
        name: 'Non_Profit',
        stringValue: 'Not for Profit',
    },
    {
        id: '11',
        name: 'Online_User_Verification',
        stringValue: 'Online User Verification',
    },
    {
        id: '12',
        name: 'Charitable_Organization',
        stringValue: 'Charitable Organizationt',
    },
    {
        id: '13',
        name: 'Trust',
        stringValue: 'Trust',
    },
];

const natureOfBusiness = [
    {
        id: '0',
        name: 'Undefined',
        stringValue: 'Undefined',
    },
    {
        id: '10',
        name: 'Aerospace and defense',
        stringValue: 'Aerospace and defense',
    },
    {
        id: '20',
        name: 'Agriculture and agric-food',
        stringValue: 'Agriculture and agric-food',
    },
    {
        id: '30',
        name: 'Apparel / Clothing',
        stringValue: 'Apparel / Clothing',
    },
    {
        id: '40',
        name: 'Automotive / Trucking',
        stringValue: 'Automotive / Trucking',
    },
    {
        id: '50',
        name: 'Books / Magazines',
        stringValue: 'Books / Magazines',
    },
    {
        id: '60',
        name: 'Broadcasting',
        stringValue: 'Broadcasting',
    },
    {
        id: '70',
        name: 'Building products',
        stringValue: 'Building products',
    },
    {
        id: '80',
        name: 'Chemicals',
        stringValue: 'Chemicals',
    },
    {
        id: '90',
        name: 'Dairy',
        stringValue: 'Dairy',
    },
    {
        id: '100',
        name: 'E-business',
        stringValue: 'E-business',
    },
    {
        id: '105',
        name: 'Educational Institutes',
        stringValue: 'Educational Institutes',
    },
    {
        id: '110',
        name: 'Environment',
        stringValue: 'Environment',
    },
    {
        id: '120',
        name: 'Explosives',
        stringValue: 'Explosives',
    },
    {
        id: '140',
        name: 'Fisheries and oceans',
        stringValue: 'Fisheries and oceans',
    },
    {
        id: '150',
        name: 'Food / Beverage distribution',
        stringValue: 'Food / Beverage distribution',
    },
    {
        id: '160',
        name: 'Footwear',
        stringValue: 'Footwear',
    },
    {
        id: '170',
        name: 'Forest industries',
        stringValue: 'Forest industries',
    },
    {
        id: '180',
        name: 'Furniture',
        stringValue: 'Furniture',
    },
    {
        id: '190',
        name: 'Giftware and crafts',
        stringValue: 'Giftware and crafts',
    },
    {
        id: '200',
        name: 'Horticulture',
        stringValue: 'Horticulture',
    },
    {
        id: '210',
        name: 'Hydroelectric energy',
        stringValue: 'Hydroelectric energy',
    },
    {
        id: '220',
        name: 'Information and communication technologies',
        stringValue: 'Information and communication technologies',
    },
    {
        id: '230',
        name: 'Intelligent systems',
        stringValue: 'Intelligent systems',
    },
    {
        id: '240',
        name: 'Livestock',
        stringValue: 'Livestock',
    },
    {
        id: '250',
        name: 'Medical devices',
        stringValue: 'Medical devices',
    },
    {
        id: '251',
        name: 'Medical treatment',
        stringValue: 'Medical treatment',
    },
    {
        id: '260',
        name: 'Minerals, metals and mining',
        stringValue: 'Minerals, metals and mining',
    },
    {
        id: '270',
        name: 'Oil and gas',
        stringValue: 'Oil and gas',
    },
    {
        id: '280',
        name: 'Pharmaceuticals and biopharmaceuticals',
        stringValue: 'Pharmaceuticals and biopharmaceuticals',
    },
    {
        id: '290',
        name: 'Plastics',
        stringValue: 'Plastics',
    },
    {
        id: '300',
        name: 'Poultry and eggs',
        stringValue: 'Poultry and eggs',
    },
    {
        id: '310',
        name: 'Printing /Publishing',
        stringValue: 'Printing /Publishing',
    },
    {
        id: '320',
        name: 'Product design and development',
        stringValue: 'Product design and development',
    },
    {
        id: '330',
        name: 'Railway',
        stringValue: 'Railway',
    },
    {
        id: '340',
        name: 'Retail',
        stringValue: 'Retail',
    },
    {
        id: '350',
        name: 'Shipping and industrial marine',
        stringValue: 'Shipping and industrial marine',
    },
    {
        id: '360',
        name: 'Soil',
        stringValue: 'Soil',
    },
    {
        id: '370',
        name: 'Sound recording',
        stringValue: 'Sound recording',
    },
    {
        id: '380',
        name: 'Sporting goods',
        stringValue: 'Sporting goods',
    },
    {
        id: '390',
        name: 'Telecommunications equipment',
        stringValue: 'Telecommunications equipment',
    },
    {
        id: '400',
        name: 'Television',
        stringValue: 'Television',
    },
    {
        id: '410',
        name: 'Textiles',
        stringValue: 'Textiles',
    },
    {
        id: '420',
        name: 'Tourism',
        stringValue: 'Tourism',
    },
    {
        id: '425',
        name: 'Trademarks / Law',
        stringValue: 'Trademarks / Law',
    },
    {
        id: '430',
        name: 'Water supply',
        stringValue: 'Water supply',
    },
    {
        id: '440',
        name: 'Wholesale',
        stringValue: 'Wholesale',
    },
];

export {annualVolumeRange, applicantType, natureOfBusiness};
