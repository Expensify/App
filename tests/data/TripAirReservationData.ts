import type {Pnr, PnrTraveler} from '@src/types/onyx/TripData';

const airReservationPnrData: Pnr = {
    data: {
        additionalMetadata: {
            airlineInfo: [
                {
                    airlineCode: 'UA',
                    airlineName: 'United Airlines',
                },
            ],
            airportInfo: [
                {
                    airportCode: 'DEN',
                    airportName: 'Denver International Airport',
                    cityName: 'Denver',
                    countryCode: 'US',
                    countryName: 'United States',
                    stateCode: 'CO',
                    zoneName: 'America/Denver',
                },
                {
                    airportCode: 'SFO',
                    airportName: 'San Francisco International Airport',
                    cityName: 'San Francisco',
                    countryCode: 'US',
                    countryName: 'United States',
                    stateCode: 'CA',
                    zoneName: 'America/Los_Angeles',
                },
            ],
        },
        airPnr: {
            airPnrRemarks: [],
            automatedCancellationInfo: {
                supportedCancellations: [
                    {
                        cancelType: 'VOID',
                        maxCancellationDateTime: {
                            iso8601: '2025-10-14T16:56:00Z',
                        },
                        refund: {
                            amount: 176.96,
                            convertedAmount: 176.96,
                            convertedCurrency: 'USD',
                            currencyCode: 'USD',
                            otherCoinage: [],
                        },
                        totalFare: {
                            base: {
                                amount: 136.15,
                                convertedAmount: 136.15,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                                otherCoinage: [],
                            },
                            tax: {
                                amount: 40.81,
                                convertedAmount: 40.81,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                                otherCoinage: [],
                            },
                        },
                    },
                ],
            },
            automatedExchangeInfo: {
                supportedExchanges: [
                    {
                        legInfos: [
                            {
                                legIdx: 0,
                            },
                            {
                                legIdx: 1,
                            },
                        ],
                    },
                ],
            },
            bookingMetadata: {
                fareStatistics: {
                    statisticsItems: [
                        {
                            statisticType: 'MINIMUM',
                            totalFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                        {
                            statisticType: 'MEDIAN',
                            totalFare: {
                                base: {
                                    amount: 238.47,
                                    convertedAmount: 238.47,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 58.19,
                                    convertedAmount: 58.19,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                        {
                            statisticType: 'MAXIMUM',
                            totalFare: {
                                base: {
                                    amount: 652.61,
                                    convertedAmount: 652.61,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                tax: {
                                    amount: 98.95,
                                    convertedAmount: 98.95,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                            },
                        },
                    ],
                },
            },
            legs: [
                {
                    brandName: 'Basic Economy',
                    fareOffers: [
                        {
                            baggagePolicy: {
                                carryOn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 0,
                                        description: 'tftwrwywamxhpjqlyycvvkqz',
                                        fee: [],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [],
                                    },
                                ],
                                checkedIn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'diwhoogsrhyyemaairpxujmwcukgqe',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 40,
                                                    convertedAmount: 40,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'upqoxyrbchclkgklvivjsqepprieync',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 50,
                                                    convertedAmount: 50,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            cancellationPolicy: {
                                description: 'ybgdbbqzejberu',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            exchangePolicy: {
                                description: 'swpuoimrgavuanivflcpbxjihu',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    flights: [
                        {
                            amenities: [
                                {
                                    aircraftAmenity: {
                                        displayText: 'Boeing 757-300',
                                    },
                                    beverageAmenity: {
                                        alcoholCost: 'paid',
                                        displayText: 'Alcohol (fee) & beverages provided',
                                    },
                                    entertainmentAmenity: {
                                        cost: 'free',
                                        displayText: 'Streaming entertainment',
                                    },
                                    freshFoodAmenity: {
                                        cost: 'paid',
                                        displayText: 'Premium snacks (fee)',
                                    },
                                    layoutAmenity: {
                                        directAisleAccess: 'no',
                                        displayText: '3-3 seat layout',
                                    },
                                    powerAmenity: {
                                        cost: 'free',
                                        displayText: 'Power outlet',
                                        powerOutlet: 'yes',
                                        usbPort: 'no',
                                    },
                                    seatAmenity: {
                                        displayText: '76 cm seat pitch',
                                        legroom: 'standard',
                                        pitch: 30,
                                        width: 'standard',
                                    },
                                    wifiAmenity: {
                                        cost: 'paid',
                                        displayText: 'Fast web browsing (fee)',
                                    },
                                },
                            ],
                            arrivalDateTime: {
                                iso8601: '2026-01-25T11:58:00',
                            },
                            arrivalGate: {
                                gate: '',
                                terminal: '3',
                            },
                            bookingCode: 'N',
                            cabin: 'ECONOMY',
                            co2EmissionDetail: {
                                averageEmissionValue: 0.2799,
                                emissionValue: 0.246312,
                                flightDistanceKm: 1653,
                                isApproximate: false,
                            },
                            departureDateTime: {
                                iso8601: '2026-01-25T10:08:00',
                            },
                            departureGate: {
                                gate: '',
                                terminal: '',
                            },
                            destination: 'SFO',
                            distance: {
                                length: 964,
                                unit: 'MILE',
                            },
                            duration: {
                                iso8601: 'PT2H50M',
                            },
                            equipment: {
                                code: '753',
                                name: 'huesfawcrrrthf',
                                type: '',
                            },
                            flightId: 'CgNERU4SA1NGTxoVChMyMDI2LTAxLTI1VDEwOjA4OjAwIhUKEzIwMjYtMDEtMjVUMTE6NTg6MDA=',
                            flightIndex: 0,
                            flightStatus: 'CONFIRMED',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            marketing: {
                                airlineCode: 'UA',
                                num: '2041',
                            },
                            operating: {
                                airlineCode: 'UA',
                                num: '2041',
                            },
                            operatingAirlineName: '',
                            origin: 'DEN',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: 'HK',
                            // @ts-expect-error: Test data
                            upas: [
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/basic-economy.html',
                                    headline: 'United Economy',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Leather seats with adjustable headrests provide a comfortable flight. United Economy seats are located at the back and middle of the plane.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large_square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: '',
                                    headline: "Step Inside United's 757-300",
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [
                                        {
                                            caption: "Step Inside United's 757-300",
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/large_square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    url: '',
                                                },
                                            ],
                                        },
                                    ],
                                    video: [],
                                },
                                {
                                    categories: ['WIFI'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/inflight-wifi.html',
                                    headline: 'Free onboard messaging for all!',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/large/Wi-Fi.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Send messages from your favorite apps for free, or purchase Wi-Fi to surf the web, scroll through Instagram, catch up on Facebook and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large_square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/small/Wi-Fi.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['ENTERTAINMENT'],
                                    externalDetailsUrl: 'https://unitedprivatescreening.com/personal-devices',
                                    headline: 'Stream content using your device',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/large/entertainment.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Explore a curated library of gripping movies, great TV shows, games and more on an award-winning in-flight entertainment system.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large_square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/small/entertainment.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['MEALS'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/united-economy.html',
                                    headline: 'Refuel during the flight',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/large/meals-beverage-6.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Enjoy complimentary snacks and refreshing soft drinks, juices, tea and illy coffee when you fly United Economy.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large_square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/small/meals-beverage-6.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['PROMOTION'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/united-app.html',
                                    headline: 'Travel with the United app',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/large/check-in.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Receive real-time trip updates without unlocking your device, plus useful terminal guides, the bag tracker feature, a help center, and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large_square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/small/check-in.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                            ],
                            vendorConfirmationNumber: 'E89J5G',
                        },
                    ],
                    legId: 'CgNERU4SA1NGTxoKMTUxNjkxODMzNA==',
                    legIndex: 0,
                    legStatus: 'CONFIRMED_STATUS',
                    preferences: [
                        {
                            blockedReason: '',
                            label: '',
                            preferredType: 'NOT_PREFERRED',
                        },
                    ],
                    preferredTypes: [],
                    rateType: 'PUBLISHED',
                    sortingPriority: 0,
                    travelerRestrictions: [
                        {
                            restrictions: ['SSR_EDIT_NOT_ALLOWED', 'OSI_EDIT_NOT_ALLOWED'],
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    validatingAirlineCode: 'UA',
                },
                {
                    brandName: 'Basic Economy',
                    fareOffers: [
                        {
                            baggagePolicy: {
                                carryOn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 0,
                                        description: 'negyksvotoejzmfmuqioylyv',
                                        fee: [],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [],
                                    },
                                ],
                                checkedIn: [
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'fukkgdvudooruaazpduyrprsbosljr',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 40,
                                                    convertedAmount: 40,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        // @ts-expect-error: Test data
                                        count: 1,
                                        description: 'gzmhabvfokqwenrmbryfbomagxkixsj',
                                        fee: [
                                            {
                                                applicability: 'EACH',
                                                fee: {
                                                    amount: 50,
                                                    convertedAmount: 50,
                                                    convertedCurrency: 'USD',
                                                    currencyCode: 'USD',
                                                    otherCoinage: [],
                                                },
                                            },
                                        ],
                                        sizeLimitDescription: '',
                                        sizeLimitInfo: [],
                                        weightLimitInfo: [
                                            {
                                                applicability: 'EACH',
                                                weightLimit: [
                                                    {
                                                        unit: 'kg',
                                                        weight: 23,
                                                    },
                                                    {
                                                        unit: 'lb',
                                                        weight: 50,
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            cancellationPolicy: {
                                description: 'ushekxgvsmdvwf',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                        {
                            exchangePolicy: {
                                description: 'kdgtbvbxbqzsivdigdcehjcyhy',
                            },
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    flights: [
                        {
                            amenities: [
                                {
                                    aircraftAmenity: {
                                        displayText: 'Boeing 757-300',
                                    },
                                    beverageAmenity: {
                                        alcoholCost: 'paid',
                                        displayText: 'Alcohol (fee) & beverages provided',
                                    },
                                    entertainmentAmenity: {
                                        cost: 'free',
                                        displayText: 'Streaming entertainment',
                                    },
                                    freshFoodAmenity: {
                                        cost: 'paid',
                                        displayText: 'Premium snacks (fee)',
                                    },
                                    layoutAmenity: {
                                        directAisleAccess: 'no',
                                        displayText: '3-3 seat layout',
                                    },
                                    powerAmenity: {
                                        cost: 'free',
                                        displayText: 'Power outlet',
                                        powerOutlet: 'yes',
                                        usbPort: 'no',
                                    },
                                    seatAmenity: {
                                        displayText: '76 cm seat pitch',
                                        legroom: 'standard',
                                        pitch: 30,
                                        width: 'standard',
                                    },
                                    wifiAmenity: {
                                        cost: 'paid',
                                        displayText: 'Fast web browsing (fee)',
                                    },
                                },
                            ],
                            arrivalDateTime: {
                                iso8601: '2026-01-31T20:12:00',
                            },
                            arrivalGate: {
                                gate: '',
                                terminal: '',
                            },
                            bookingCode: 'N',
                            cabin: 'ECONOMY',
                            co2EmissionDetail: {
                                averageEmissionValue: 0.2799,
                                emissionValue: 0.246312,
                                flightDistanceKm: 1653,
                                isApproximate: false,
                            },
                            departureDateTime: {
                                iso8601: '2026-01-31T16:31:00',
                            },
                            departureGate: {
                                gate: '',
                                terminal: '3',
                            },
                            destination: 'DEN',
                            distance: {
                                length: 964,
                                unit: 'MILE',
                            },
                            duration: {
                                iso8601: 'PT2H41M',
                            },
                            equipment: {
                                code: '753',
                                name: 'yyfaoheehlhxim',
                                type: '',
                            },
                            flightId: 'CgNTRk8SA0RFThoVChMyMDI2LTAxLTMxVDE2OjMxOjAwIhUKEzIwMjYtMDEtMzFUMjA6MTI6MDA=',
                            flightIndex: 0,
                            flightStatus: 'CONFIRMED',
                            flightWaiverCodes: [],
                            hiddenStops: [],
                            marketing: {
                                airlineCode: 'UA',
                                num: '1430',
                            },
                            operating: {
                                airlineCode: 'UA',
                                num: '1430',
                            },
                            operatingAirlineName: '',
                            origin: 'SFO',
                            otherStatuses: [],
                            restrictions: [],
                            sourceStatus: 'HK',
                            // @ts-expect-error: Test data
                            upas: [
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/basic-economy.html',
                                    headline: 'United Economy',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Leather seats with adjustable headrests provide a comfortable flight. United Economy seats are located at the back and middle of the plane.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large_square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/square_thumb/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/f0f494b6-da99-44d8-9c4c-c761ec313c0f/large/inflight-serv-basic-economy-368x207-2x.png?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['SEAT'],
                                    externalDetailsUrl: '',
                                    headline: "Step Inside United's 757-300",
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/large/Seat.png?channel_id=ys18ftmp',
                                    photo: [],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/c2e128dd-6943-4fed-a301-30a21b5c78d2/small/Seat.png?channel_id=ys18ftmp',
                                    tour: [
                                        {
                                            caption: "Step Inside United's 757-300",
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/tours/8d7a1bd7-2665-4bd9-ad25-b1b58c8d686c/large_square_thumb/text-thumbnail.jpg?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    url: '',
                                                },
                                            ],
                                        },
                                    ],
                                    video: [],
                                },
                                {
                                    categories: ['WIFI'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/inflight-wifi.html',
                                    headline: 'Free onboard messaging for all!',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/large/Wi-Fi.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Send messages from your favorite apps for free, or purchase Wi-Fi to surf the web, scroll through Instagram, catch up on Facebook and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large_square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/square_thumb/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/0a2c1f5e-c1b8-4f23-a80b-ad241e61f040/large/ua-wifi-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/444e8b53-7761-465e-93ee-3f7b1ad2d649/small/Wi-Fi.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['ENTERTAINMENT'],
                                    externalDetailsUrl: 'https://unitedprivatescreening.com/personal-devices',
                                    headline: 'Stream content using your device',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/large/entertainment.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Explore a curated library of gripping movies, great TV shows, games and more on an award-winning in-flight entertainment system.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large_square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/square_thumb/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/e74cb769-63a7-4847-bbe7-c795a31e435b/large/ua-wifi-stream-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/4d108b96-67b1-49df-9902-9daac5f94f8d/small/entertainment.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['MEALS'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel/inflight/united-economy.html',
                                    headline: 'Refuel during the flight',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/large/meals-beverage-6.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption: 'Enjoy complimentary snacks and refreshing soft drinks, juices, tea and illy coffee when you fly United Economy.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large_square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/square_thumb/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/3022e167-b77d-479d-8432-ff6ec6a7d963/large/ua3-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/3f3fef3e-34e3-455f-8d04-f5615190cab7/small/meals-beverage-6.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                                {
                                    categories: ['PROMOTION'],
                                    externalDetailsUrl: 'https://www.united.com/en/us/fly/travel-experience/united-app.html',
                                    headline: 'Travel with the United app',
                                    largeIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/large/check-in.png?channel_id=ys18ftmp',
                                    photo: [
                                        {
                                            caption:
                                                'Receive real-time trip updates without unlocking your device, plus useful terminal guides, the bag tracker feature, a help center, and more.',
                                            images: [
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 350,
                                                        width: 350,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large_square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 150,
                                                        width: 150,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/square_thumb/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                                {
                                                    data: '',
                                                    dimensions: {
                                                        height: 400,
                                                        width: 400,
                                                    },
                                                    url: 'https://upamedia.atpco.net/photos/448f23b8-f533-4f20-9468-03633b495517/large/ua-app2-dot-png.PNG?channel_id=ys18ftmp',
                                                },
                                            ],
                                        },
                                    ],
                                    smallIconUrl: 'https://upamedia.atpco.net/icons/349abc23-a78d-43f3-b267-26fdc02c1a15/small/check-in.png?channel_id=ys18ftmp',
                                    tour: [],
                                    video: [],
                                },
                            ],
                            vendorConfirmationNumber: 'E89J5G',
                        },
                    ],
                    legId: 'CgNTRk8SA0RFThoKMTUxNjkxODMzNA==',
                    legIndex: 1,
                    legStatus: 'CONFIRMED_STATUS',
                    preferences: [
                        {
                            blockedReason: '',
                            label: '',
                            preferredType: 'NOT_PREFERRED',
                        },
                    ],
                    preferredTypes: [],
                    rateType: 'PUBLISHED',
                    sortingPriority: 1,
                    travelerRestrictions: [
                        {
                            restrictions: ['SSR_EDIT_NOT_ALLOWED', 'OSI_EDIT_NOT_ALLOWED'],
                            userId: {
                                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                            },
                        },
                    ],
                    validatingAirlineCode: 'UA',
                },
            ],
            otherServiceInfos: [],
            travelerInfos: [
                {
                    airVendorCancellationInfo: {
                        airVendorCancellationObjects: [],
                    },
                    appliedCredits: [],
                    boardingPass: [],
                    booking: {
                        itinerary: {
                            fareComponents: [
                                {
                                    baseFare: {
                                        amount: 77.38,
                                        convertedAmount: 77.38,
                                        convertedCurrency: 'USD',
                                        currencyCode: 'USD',
                                        otherCoinage: [],
                                    },
                                    // @ts-expect-error: Test data
                                    corpAccountCode: '',
                                    fareBasisCode: 'KAA5TWBN',
                                    farePaxType: 'UNKNOWN_PASSENGER_TYPE',
                                    flightIds: [
                                        {
                                            flightIdx: 0,
                                            legIdx: 0,
                                        },
                                    ],
                                    ticketDesignator: '',
                                    tourCode: 'TLG18',
                                },
                                {
                                    baseFare: {
                                        amount: 58.77,
                                        convertedAmount: 58.77,
                                        convertedCurrency: 'USD',
                                        currencyCode: 'USD',
                                        otherCoinage: [],
                                    },
                                    // @ts-expect-error: Test data
                                    corpAccountCode: '',
                                    fareBasisCode: 'GAK5TWBN',
                                    farePaxType: 'UNKNOWN_PASSENGER_TYPE',
                                    flightIds: [
                                        {
                                            flightIdx: 0,
                                            legIdx: 1,
                                        },
                                    ],
                                    ticketDesignator: '',
                                    tourCode: 'TLG18',
                                },
                            ],
                            flightFareBreakup: [
                                {
                                    flightsFare: {
                                        base: {
                                            amount: 136.15,
                                            convertedAmount: 136.15,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 40.81,
                                            convertedAmount: 40.81,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    legIndices: [0, 1],
                                },
                            ],
                            otherAncillaryFares: [],
                            totalFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            totalFlightsFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                        },
                        luggageDetails: [],
                        otherAncillaries: [],
                        otherCharges: [],
                        seats: [],
                    },
                    createdMcos: [],
                    paxType: 'ADULT',
                    specialServiceRequestInfos: [],
                    tickets: [
                        {
                            amount: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            ancillaries: [],
                            associatedTicketNumber: '',
                            commission: {
                                amount: {
                                    amount: 0,
                                    convertedAmount: 0,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                percent: 0,
                            },
                            conjunctionTicketSuffix: [],
                            exchangePolicy: {
                                exchangePenalty: {
                                    amount: 149,
                                    convertedAmount: 149,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                isCat16: false,
                                isConditional: false,
                                isExchangeable: true,
                            },
                            fareCalculation: '',
                            flightCoupons: [
                                {
                                    flightIdx: 0,
                                    legIdx: 1,
                                    status: 'NOT_FLOWN',
                                },
                                {
                                    flightIdx: 0,
                                    legIdx: 0,
                                    status: 'NOT_FLOWN',
                                },
                            ],
                            hemisphereCode: '',
                            iataNumber: '45526666',
                            issuedDateTime: {
                                iso8601: '2025-10-13T11:57:00',
                            },
                            journeyCode: '',
                            mcoIssuanceEligibility: 'NOT_ELIGIBLE',
                            paymentDetails: [
                                {
                                    amount: {
                                        base: {
                                            amount: 136.15,
                                            convertedAmount: 136.15,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        tax: {
                                            amount: 40.81,
                                            convertedAmount: 40.81,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                    },
                                    fop: {
                                        additionalInfo: '',
                                        card: {
                                            address: {
                                                addressLines: ['9899 S Field Way'],
                                                administrativeArea: '',
                                                administrativeAreaName: '',
                                                continentCode: '',
                                                description: '',
                                                isDefault: false,
                                                languageCode: '',
                                                locality: '',
                                                locationCode: '',
                                                organization: '',
                                                postalCode: '80127',
                                                recipients: [],
                                                regionCode: 'US',
                                                regionName: '',
                                                revision: 0,
                                                sortingCode: '',
                                                sublocality: '',
                                                timezone: '',
                                            },
                                            company: 'VISA',
                                            currency: '',
                                            cvv: '',
                                            // @ts-expect-error: Test data
                                            expiry: [],
                                            expiryMonth: 9,
                                            expiryYear: 2028,
                                            externalId: '',
                                            id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                            label: 'Expensify Card',
                                            name: 'lsmhydeiufn',
                                            number: '4XXXXXXXXXXX7280',
                                            type: 'CREDIT',
                                        },
                                        paymentMethod: 'CREDIT_CARD',
                                        type: 'CARD',
                                    },
                                    isRefunded: false,
                                },
                            ],
                            pcc: 'A4L0',
                            publishedFare: {
                                base: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                                tax: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                    otherCoinage: [],
                                },
                            },
                            refundPolicy: {
                                isCat16: false,
                                isConditional: false,
                                isRefundable: false,
                                isRefundableByObt: false,
                            },
                            rficCode: '',
                            status: 'ISSUED',
                            taxBreakdown: {
                                tax: [
                                    {
                                        amount: {
                                            amount: 10.21,
                                            convertedAmount: 10.21,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'US',
                                    },
                                    {
                                        amount: {
                                            amount: 10.4,
                                            convertedAmount: 10.4,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'ZP',
                                    },
                                    {
                                        amount: {
                                            amount: 11.2,
                                            convertedAmount: 11.2,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'AY',
                                    },
                                    {
                                        amount: {
                                            amount: 9,
                                            convertedAmount: 9,
                                            convertedCurrency: 'USD',
                                            currencyCode: 'USD',
                                            otherCoinage: [],
                                        },
                                        taxCode: 'XF',
                                    },
                                ],
                            },
                            ticketIncompleteReasons: [],
                            ticketNumber: '0162339781701',
                            ticketSettlement: 'ARC_TICKET',
                            ticketType: 'FLIGHT',
                            validatingAirlineCode: 'UA',
                            vendorCancellationId: '',
                        },
                    ],
                    travelerIdx: 0,
                    userId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                },
            ],
        },
        approvalInfo: [
            {
                approvalStatus: 'APPROVAL_NOT_REQUIRED',
                approvalType: 'PASSIVE_APPROVAL',
            },
        ],
        bookingHistory: [
            {
                bookerInfo: {
                    email: 'qxnuccbych@jpgzbgsws.com',
                    name: 'dzoojdygwxx',
                    role: 'TRAVELER',
                    tmcName: '',
                },
                bookingInfo: {
                    bookingSourceClient: 'WEB',
                    status: 'BOOKED',
                    updatedDateTime: {
                        iso8601: '2025-10-13T16:57:37Z',
                    },
                },
            },
        ],
        bookingStatus: 'CONFIRMED_STATUS',
        contactSupport: false,
        costOfGoodsSold: {
            payments: [
                {
                    fop: {
                        accessType: {
                            accessType: 'PERSONAL',
                            entities: [
                                {
                                    centralCardAccessLevel: 'UNKNOWN',
                                    entityId: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                                },
                            ],
                            entityIds: ['04156553-b7f4-4eeb-b265-bc7be23524f8'],
                        },
                        additionalInfo: '',
                        card: {
                            address: {
                                addressLines: ['9899 S Field Way'],
                                administrativeArea: 'Colorado',
                                administrativeAreaName: '',
                                continentCode: '',
                                description: 'ogfcooyjzqmslwg',
                                isDefault: false,
                                languageCode: '',
                                locality: 'Littleton',
                                locationCode: '',
                                organization: '',
                                postalCode: '80127',
                                recipients: [],
                                regionCode: 'US',
                                regionName: '',
                                revision: 0,
                                sortingCode: '',
                                sublocality: '',
                                timezone: '',
                            },
                            company: 'VISA',
                            currency: '',
                            cvv: '',
                            expiry: [],
                            expiryMonth: 9,
                            expiryYear: 2028,
                            externalId: '',
                            id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                            label: 'Expensify Card',
                            name: 'werawcqktad',
                            number: '4XXXXXXXXXXX7280',
                            type: 'CREDIT',
                            vaultId: '00000000-0000-0000-0000-000000000000',
                        },
                        paymentMetadata: {
                            cardMetadata: {
                                accessType: {
                                    accessType: 'PERSONAL',
                                    entities: [
                                        {
                                            centralCardAccessLevel: 'UNKNOWN',
                                            entityId: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                                        },
                                    ],
                                    entityIds: ['04156553-b7f4-4eeb-b265-bc7be23524f8'],
                                },
                                card: {
                                    address: {
                                        addressLines: ['9899 S Field Way'],
                                        administrativeArea: 'Colorado',
                                        administrativeAreaName: '',
                                        continentCode: '',
                                        description: 'ryjmcdtqppdyhnl',
                                        isDefault: false,
                                        languageCode: '',
                                        locality: 'Littleton',
                                        locationCode: '',
                                        organization: '',
                                        postalCode: '80127',
                                        recipients: [],
                                        regionCode: 'US',
                                        regionName: '',
                                        revision: 0,
                                        sortingCode: '',
                                        sublocality: '',
                                        timezone: '',
                                    },
                                    company: 'VISA',
                                    currency: '',
                                    cvv: '',
                                    expiry: [],
                                    expiryMonth: 9,
                                    expiryYear: 2028,
                                    externalId: '',
                                    id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                    label: 'Expensify Card',
                                    name: 'ybybqznpcwt',
                                    number: '4XXXXXXXXXXX7280',
                                    type: 'CREDIT',
                                    vaultId: '00000000-0000-0000-0000-000000000000',
                                },
                                isLodgeCard: false,
                            },
                        },
                        paymentMethod: 'CREDIT_CARD',
                        paymentSourceType: 'CARD',
                        type: 'CARD',
                    },
                    isRefunded: false,
                    networkTransactionId: '',
                    paymentGateway: 'PAYMENT_GATEWAY_UNKNOWN',
                    paymentId: '',
                    paymentReference: '',
                    paymentThirdParty: 'UNKNOWN_PARTY',
                    paymentType: 'FLIGHTS',
                    travelerIndices: [0],
                    userIds: [
                        {
                            id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                        },
                    ],
                },
            ],
        },
        createdVia: 'OBT',
        customFields: [],
        customFieldsV3Responses: [],
        documents: [],
        initialVersionCreatedVia: 'OBT',
        invoiceDelayedBooking: false,
        invoiceInfos: [
            {
                invoiceId: 'de54fc87-bd22-4fb9-ba1d-0e049ceb26e5',
                invoiceNumber: 'SOLUTIONSTRAVEL-US-RPT-112039',
                productType: 'PNR',
            },
        ],
        isFinalized: true,
        llfPnrInfo: {
            totalFare: {
                amount: 246.97,
                convertedAmount: 246.97,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
        },
        owningPccInfo: {
            zoneId: 'America/Chicago',
        },
        paymentInfo: [
            {
                fop: {
                    additionalInfo: '',
                    card: {
                        address: {
                            addressLines: ['9899 S Field Way'],
                            administrativeArea: '',
                            administrativeAreaName: '',
                            continentCode: '',
                            description: '',
                            isDefault: false,
                            languageCode: '',
                            locality: '',
                            locationCode: '',
                            organization: '',
                            postalCode: '80127',
                            recipients: [],
                            regionCode: 'US',
                            regionName: '',
                            revision: 0,
                            sortingCode: '',
                            sublocality: '',
                            timezone: '',
                        },
                        company: 'VISA',
                        currency: '',
                        cvv: '',
                        expiry: [],
                        expiryMonth: 9,
                        expiryYear: 2028,
                        externalId: '',
                        id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                        label: 'Expensify Card',
                        name: 'yotnazudkrj',
                        number: '4XXXXXXXXXXX7280',
                        type: 'CREDIT',
                    },
                    paymentMethod: 'CREDIT_CARD',
                    type: 'CARD',
                },
                netCharge: {
                    amount: 176.96,
                    convertedAmount: 176.96,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalCharge: {
                    amount: 176.96,
                    convertedAmount: 176.96,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalRefund: {
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
            },
            {
                fop: {
                    additionalInfo: '',
                    card: {
                        address: {
                            addressLines: ['9899 S Field Way'],
                            administrativeArea: 'Colorado',
                            administrativeAreaName: '',
                            continentCode: '',
                            description: 'paiskbvgytepgpz',
                            isDefault: false,
                            languageCode: '',
                            locality: 'Littleton',
                            locationCode: '',
                            organization: '',
                            postalCode: '80127',
                            recipients: [],
                            regionCode: 'US',
                            regionName: '',
                            revision: 0,
                            sortingCode: '',
                            sublocality: '',
                            timezone: '',
                        },
                        company: 'VISA',
                        currency: '',
                        cvv: '',
                        expiry: [],
                        expiryMonth: 9,
                        expiryYear: 2028,
                        externalId: '',
                        id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                        label: 'Expensify Card',
                        name: 'jrcdvnvvjpg',
                        number: '4XXXXXXXXXXX7280',
                        type: 'CREDIT',
                        vaultId: '00000000-0000-0000-0000-000000000000',
                    },
                    paymentMetadata: {
                        cardMetadata: {
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    administrativeArea: 'Colorado',
                                    administrativeAreaName: '',
                                    continentCode: '',
                                    description: 'phkfyirzszwmxxn',
                                    isDefault: false,
                                    languageCode: '',
                                    locality: 'Littleton',
                                    locationCode: '',
                                    organization: '',
                                    postalCode: '80127',
                                    recipients: [],
                                    regionCode: 'US',
                                    regionName: '',
                                    revision: 0,
                                    sortingCode: '',
                                    sublocality: '',
                                    timezone: '',
                                },
                                company: 'VISA',
                                currency: '',
                                cvv: '',
                                expiry: [],
                                expiryMonth: 9,
                                expiryYear: 2028,
                                externalId: '',
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'reursbzyfvn',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                                vaultId: '00000000-0000-0000-0000-000000000000',
                            },
                            isLodgeCard: false,
                        },
                    },
                    paymentMethod: 'CREDIT_CARD',
                    paymentSourceType: 'CARD',
                    type: 'UNKNOWN',
                },
                netCharge: {
                    amount: 10,
                    convertedAmount: 10,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalCharge: {
                    amount: 10,
                    convertedAmount: 10,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
                totalRefund: {
                    amount: 0,
                    convertedAmount: 0,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                    otherCoinage: [],
                },
            },
        ],
        pnrCreationDetails: [],
        pnrId: '1516918334',
        pnrTravelers: [
            {
                businessInfo: {
                    // @ts-expect-error: Test data
                    companyId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    companyInfo: {
                        externalId: '',
                        id: {
                            id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                        },
                        name: 'aaeoxzjwi',
                    },
                    companySpecifiedAttributes: [
                        {
                            fixedColumnName: 'COMPANY_CODE',
                            value: '',
                        },
                        {
                            fixedColumnName: 'LOCATION_CODE',
                            value: '',
                        },
                    ],
                    legalEntity: {
                        companySpecifiedAttributes: [],
                        countryCode: 'US',
                        ein: '',
                        externalId: '',
                        id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                        name: 'pwbpiqwwqrtdyp',
                    },
                },
                loyalties: [],
                originalBusinessInfo: {
                    companyId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    companyInfo: {
                        externalId: '',
                        id: {
                            id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                        },
                        name: 'umrzcgske',
                    },
                    legalEntity: {
                        companySpecifiedAttributes: [],
                        countryCode: 'US',
                        ein: '',
                        externalId: '',
                        id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                        name: 'sbhwynzjwzfgog',
                    },
                },
                persona: 'EMPLOYEE',
                personalInfo: {
                    dob: {
                        iso8601: '1992-03-11',
                    },
                    email: 'qxnuccbych@jpgzbgsws.com',
                    gender: 'MALE',
                    // @ts-expect-error: Test data
                    name: '***',
                    phoneNumbers: [
                        {
                            countryCode: 0,
                            countryCodeSource: 'UNSPECIFIED',
                            extension: '',
                            isoCountryCode: '',
                            italianLeadingZero: false,
                            nationalNumber: 0,
                            numberOfLeadingZeros: 0,
                            preferredDomesticCarrierCode: '',
                            rawInput: '17206574277',
                            type: 'UNKNOWN_TYPE',
                        },
                    ],
                },
                tier: 'BASIC',
                travelerInfo: {
                    adhocTravelerInfo: [],
                    userId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                },
                userId: {
                    id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                },
            },
        ],
        policyInfo: {
            appliedPolicyInfo: {
                policies: [
                    {
                        id: 'b8225f6c-f9bd-4566-9dc0-f6b7fc0046b0',
                        version: '54',
                    },
                ],
                ruleResultInfos: [
                    {
                        actions: [
                            {
                                takeApproval: {
                                    allRequired: false,
                                    hardApprovalRequired: false,
                                    numHierarchyLevels: 1,
                                    positionTitles: [],
                                    userOrgIds: [],
                                },
                            },
                        ],
                        subViolationInfos: [],
                        violationInfos: [],
                    },
                ],
            },
            approverName: {
                family1: '',
                family2: '',
                given: 'Cole Eason',
                middle: '',
                preferred: '',
            },
            outOfPolicy: false,
            reason: '',
            reasonCode: 'UNKNOWN_CHECKOUT_ANSWER_TYPE',
        },
        preBookAnswers: {
            answers: [],
        },
        savingsFare: {
            fareAmount: {
                base: {
                    amount: 136.15,
                    convertedAmount: 136.15,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                },
                tax: {
                    amount: 40.81,
                    convertedAmount: 40.81,
                    convertedCurrency: 'USD',
                    currencyCode: 'USD',
                },
            },
            isTaxIncluded: true,
        },
        serviceFees: [
            {
                fare: {
                    base: {
                        amount: 10,
                        convertedAmount: 10,
                        convertedCurrency: 'USD',
                        currencyCode: 'USD',
                    },
                    tax: {
                        amount: 0,
                        convertedAmount: 0,
                        convertedCurrency: 'USD',
                        currencyCode: 'USD',
                    },
                },
                feeInfo: {
                    bookingFeeType: 'TRIP_FEE',
                    calculatedAmount: {
                        amount: 10,
                        convertedAmount: 10,
                        convertedCurrency: 'USD',
                        currencyCode: 'USD',
                    },
                    chargeProcessorInfo: {
                        chargeProcessorType: 'RULE_BASED_INFO',
                        ruleName: 'DEFAULT',
                    },
                    feeType: 'BOOKING_FEE',
                },
                fop: {
                    additionalInfo: '',
                    card: {
                        address: {
                            addressLines: ['9899 S Field Way'],
                            administrativeArea: 'Colorado',
                            administrativeAreaName: '',
                            continentCode: '',
                            description: 'bsvvbfnslrdjxsk',
                            isDefault: false,
                            languageCode: '',
                            locality: 'Littleton',
                            locationCode: '',
                            organization: '',
                            postalCode: '80127',
                            recipients: [],
                            regionCode: 'US',
                            regionName: '',
                            revision: 0,
                            sortingCode: '',
                            sublocality: '',
                            timezone: '',
                        },
                        company: 'VISA',
                        currency: '',
                        cvv: '',
                        expiry: [],
                        expiryMonth: 9,
                        expiryYear: 2028,
                        externalId: '',
                        id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                        label: 'Expensify Card',
                        name: 'vyfnaeligka',
                        number: '4XXXXXXXXXXX7280',
                        type: 'CREDIT',
                        vaultId: '00000000-0000-0000-0000-000000000000',
                    },
                    paymentMetadata: {
                        cardMetadata: {
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    administrativeArea: 'Colorado',
                                    administrativeAreaName: '',
                                    continentCode: '',
                                    description: 'aslcbtnlbaqanmz',
                                    isDefault: false,
                                    languageCode: '',
                                    locality: 'Littleton',
                                    locationCode: '',
                                    organization: '',
                                    postalCode: '80127',
                                    recipients: [],
                                    regionCode: 'US',
                                    regionName: '',
                                    revision: 0,
                                    sortingCode: '',
                                    sublocality: '',
                                    timezone: '',
                                },
                                company: 'VISA',
                                currency: '',
                                cvv: '',
                                expiry: [],
                                expiryMonth: 9,
                                expiryYear: 2028,
                                externalId: '',
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'pzeuiiuyhqz',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                                vaultId: '00000000-0000-0000-0000-000000000000',
                            },
                            isLodgeCard: false,
                        },
                    },
                    paymentMethod: 'CREDIT_CARD',
                    paymentSourceType: 'CARD',
                    type: 'UNKNOWN',
                },
                paymentTransactionInfo: {
                    gatewayInfo: {
                        stripeInfo: [],
                    },
                },
                status: 'PENDING',
                ticketNumber: '',
                visibleToTraveler: true,
            },
        ],
        sourceInfo: {
            bookingDateTime: {
                iso8601: '2025-10-13T16:57:37Z',
            },
            bookingSource: 'FARELOGIX_NDC',
            iataNumber: '',
            posDescriptor: 'A4L0',
            sourcePnrId: 'KM6STH',
            thirdParty: 'FARELOGIX_NDC',
        },
        totalFare: {
            amount: 186.96,
            convertedAmount: 186.96,
            convertedCurrency: 'USD',
            currencyCode: 'USD',
        },
        totalFareAmount: {
            base: {
                amount: 136.15,
                convertedAmount: 136.15,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
            tax: {
                amount: 40.81,
                // @ts-expect-error: Test data
                convertedAmount: 40.81,
                convertedCurrency: 'USD',
                currencyCode: 'USD',
            },
        },
        transactions: [
            {
                // @ts-expect-error: Test data
                bookerInfo: {
                    bookerId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                    bookerName: 'Alex Beaman',
                    bookerRole: 'TRAVELER',
                },
                ctc: [
                    {
                        amount: {
                            amount: 176.96,
                            convertedAmount: 176.96,
                            convertedCurrency: 'USD',
                            currencyCode: 'USD',
                        },
                        balanceDue: {
                            amount: 0,
                            convertedAmount: 0,
                            convertedCurrency: 'USD',
                            currencyCode: 'USD',
                        },
                        fop: {
                            additionalInfo: '',
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    postalCode: '80127',
                                    regionCode: 'US',
                                },
                                company: 'VISA',
                                cvv: '',
                                expiry: {
                                    expiry: {
                                        expiryMonth: 9,
                                        expiryYear: 2028,
                                    },
                                },
                                expiryMonth: 9,
                                expiryYear: 2028,
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'thdgezgwysp',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                            },
                            paymentMethod: 'CREDIT_CARD',
                            type: 'CARD',
                        },
                        isGuarantee: false,
                        isRefunded: false,
                        transactionStatus: 'CHARGED',
                    },
                ],
                itemGroups: [
                    {
                        confirmationNumber: '0162339781701',
                        invoiceData: {
                            buyer: {
                                address: 'Expensify, Inc,\n401 SW 5th Ave,\nPortland,\nOR US 97204',
                                idInfo: [],
                                name: 'yedajsgtnab',
                            },
                            invoiceNumber: 'SOLUTIONSTRAVEL-US-RPT-112039',
                            seller: {
                                address: '115 Broadway ST,\nNY,\nNY US 10006',
                                idInfo: [
                                    {
                                        idType: 'EIN',
                                        value: '842924335',
                                    },
                                ],
                                name: 'bjailgxf',
                            },
                        },
                        items: [
                            {
                                airItemType: 'FLIGHT',
                                ancillaryTypes: [],
                                flights: [
                                    {
                                        arrivalDateTime: {
                                            iso8601: '2026-01-25T11:58:00',
                                        },
                                        cabin: 'ECONOMY',
                                        departureDateTime: {
                                            iso8601: '2026-01-25T10:08:00',
                                        },
                                        destination: {
                                            airportCode: 'SFO',
                                            airportName: 'San Francisco International Airport',
                                            cityCode: '',
                                        },
                                        marketing: {
                                            airlineCode: 'UA',
                                            num: '2041',
                                        },
                                        operating: {
                                            airlineCode: 'UA',
                                            num: '2041',
                                        },
                                        origin: {
                                            airportCode: 'DEN',
                                            airportName: 'Denver International Airport',
                                            cityCode: '',
                                        },
                                    },
                                    {
                                        arrivalDateTime: {
                                            iso8601: '2026-01-31T20:12:00',
                                        },
                                        cabin: 'ECONOMY',
                                        departureDateTime: {
                                            iso8601: '2026-01-31T16:31:00',
                                        },
                                        destination: {
                                            airportCode: 'DEN',
                                            airportName: 'Denver International Airport',
                                            cityCode: '',
                                        },
                                        marketing: {
                                            airlineCode: 'UA',
                                            num: '1430',
                                        },
                                        operating: {
                                            airlineCode: 'UA',
                                            num: '1430',
                                        },
                                        origin: {
                                            airportCode: 'SFO',
                                            airportName: 'San Francisco International Airport',
                                            cityCode: '',
                                        },
                                    },
                                ],
                                itemType: 'AIR_ITEM',
                                oldFlights: [],
                            },
                        ],
                        previousTransactionFares: [],
                        totalAmount: {
                            base: {
                                amount: 136.15,
                                convertedAmount: 136.15,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                            tax: {
                                amount: 40.81,
                                convertedAmount: 40.81,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                        },
                        totalAmountDiff: {
                            base: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                            tax: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                        },
                        transactionAmount: {
                            base: {
                                amount: 136.15,
                                convertedAmount: 136.15,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                            tax: {
                                amount: 40.81,
                                convertedAmount: 40.81,
                                convertedCurrency: 'USD',
                                currencyCode: 'USD',
                            },
                        },
                        transactionAmountDiff: {
                            base: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                            tax: {
                                amount: 0,
                                convertedAmount: 0,
                                convertedCurrency: '',
                                currencyCode: '',
                            },
                        },
                        transactionDateTime: {
                            iso8601: '2025-10-13T16:58:15',
                        },
                        transactionFares: [
                            {
                                amount: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'BASE_AMOUNT',
                            },
                            {
                                amount: {
                                    amount: 40.81,
                                    convertedAmount: 40.81,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'OTHER_FEE_AND_TAXES',
                            },
                            {
                                amount: {
                                    amount: 136.15,
                                    convertedAmount: 136.15,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'CHARGE_BASE',
                            },
                            {
                                amount: {
                                    amount: 176.96,
                                    convertedAmount: 176.96,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'CHARGE_TOTAL',
                            },
                            {
                                amount: {
                                    amount: 176.96,
                                    convertedAmount: 176.96,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'TOTAL',
                            },
                            {
                                amount: {
                                    amount: 176.96,
                                    convertedAmount: 176.96,
                                    convertedCurrency: 'USD',
                                    currencyCode: 'USD',
                                },
                                transactionFareType: 'SUB_TOTAL',
                            },
                        ],
                        transactionType: 'AIR_TICKET_ISSUED',
                        userId: {
                            id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                        },
                    },
                ],
                pnrVersion: 2,
            },
        ],
        travelerPnrVisibilityStatus: 'VISIBLE',
        travelers: [
            {
                isActive: true,
                persona: 'EMPLOYEE',
                tier: 'BASIC',
                user: {
                    // @ts-expect-error: Test data
                    dob: {
                        iso8601: '1992-03-11',
                    },
                    email: 'qxnuccbych@jpgzbgsws.com',
                    gender: 'MALE',
                    name: '***',
                    paymentInfos: [
                        {
                            access: {
                                accessType: 'PERSONAL',
                                entities: [
                                    {
                                        centralCardAccessLevel: 'UNKNOWN',
                                        entityId: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                                    },
                                ],
                                entityIds: ['04156553-b7f4-4eeb-b265-bc7be23524f8'],
                            },
                            accessType: 'PERSONAL',
                            applicableTo: [],
                            card: {
                                address: {
                                    addressLines: ['9899 S Field Way'],
                                    administrativeArea: 'Colorado',
                                    description: 'lcjbunexhvxdsah',
                                    locality: 'Littleton',
                                    postalCode: '80127',
                                    regionCode: 'US',
                                },
                                company: 'VISA',
                                cvv: '',
                                expiry: [],
                                expiryMonth: 9,
                                expiryYear: 2028,
                                id: 'c7b76509-43d9-4299-89f4-bb74bd07bcff',
                                label: 'Expensify Card',
                                name: 'ebushzpgldg',
                                number: '4XXXXXXXXXXX7280',
                                type: 'CREDIT',
                            },
                        },
                    ],
                    phoneNumbers: [
                        {
                            countryCode: 0,
                            countryCodeSource: 'UNSPECIFIED',
                            extension: '',
                            isoCountryCode: '',
                            italianLeadingZero: false,
                            nationalNumber: 0,
                            numberOfLeadingZeros: 0,
                            preferredDomesticCarrierCode: '',
                            rawInput: '17206574277',
                            type: 'UNKNOWN_TYPE',
                        },
                    ],
                },
                userBusinessInfo: {
                    // @ts-expect-error: Test data
                    designation: '',
                    email: 'qxnuccbych@jpgzbgsws.com',
                    employeeId: '',
                    legalEntityId: {
                        id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                    },
                    managerBasicInfo: {
                        email: 'xahh@jtemomrrc.com',
                        isActive: true,
                        name: '***',
                        persona: 'EMPLOYEE',
                        profilePicture: {
                            data: '',
                            dimensions: {
                                height: 0,
                                width: 0,
                            },
                            url: '',
                        },
                        tier: 'BASIC',
                        userOrgId: {
                            organizationAgencyId: {
                                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                            },
                            organizationId: {
                                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                            },
                            userId: {
                                id: '8e2e29f8-4d2a-4112-baa4-f06896df1de6',
                            },
                        },
                    },
                    organizationId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                },
                userOrgId: {
                    organizationAgencyId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    organizationId: {
                        id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                    },
                    tmcBasicInfo: {
                        bookingTmc: {
                            id: {
                                id: 'c6f1c9ab-0e72-426c-8b34-22db270434b7',
                            },
                        },
                        contractingTmc: {
                            id: {
                                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                            },
                            logo: {
                                data: '',
                                dimensions: {
                                    height: 0,
                                    width: 0,
                                },
                                url: 'https://images.spotnana.com/c3b13b1b-1672-48ab-9267-e2de069c4e3b',
                            },
                            name: 'veebzmiey',
                        },
                    },
                    tmcInfo: {
                        id: {
                            id: 'c6f1c9ab-0e72-426c-8b34-22db270434b7',
                        },
                        partnerTmcId: {
                            id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                        },
                        primaryServiceProviderTmc: {
                            tmcId: {
                                id: 'c6f1c9ab-0e72-426c-8b34-22db270434b7',
                            },
                        },
                        secondaryServiceProviderTmcs: [],
                    },
                    userId: {
                        id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
                    },
                },
            },
        ],
        tripId: '3244189163',
        tripUsageMetadata: {
            eventMetadata: {
                eventId: '1726711769',
            },
            tripUsageType: 'EVENT',
        },
        version: 2,
    },
    pnrId: '1516918334',
};

const airReservationTravelers: PnrTraveler[] = [
    {
        businessInfo: {
            // @ts-expect-error: Test data
            companyId: {
                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
            },
            companyInfo: {
                externalId: '',
                id: {
                    id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                },
                name: 'aaeoxzjwi',
            },
            companySpecifiedAttributes: [
                {
                    fixedColumnName: 'COMPANY_CODE',
                    value: '',
                },
                {
                    fixedColumnName: 'LOCATION_CODE',
                    value: '',
                },
            ],
            legalEntity: {
                companySpecifiedAttributes: [],
                countryCode: 'US',
                ein: '',
                externalId: '',
                id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                name: 'pwbpiqwwqrtdyp',
            },
        },
        loyalties: [],
        originalBusinessInfo: {
            companyId: {
                id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
            },
            companyInfo: {
                externalId: '',
                id: {
                    id: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
                },
                name: 'umrzcgske',
            },
            legalEntity: {
                companySpecifiedAttributes: [],
                countryCode: 'US',
                ein: '',
                externalId: '',
                id: '45ff0fa3-ca90-4b54-b5ae-e0512cdfe08a',
                name: 'sbhwynzjwzfgog',
            },
        },
        persona: 'EMPLOYEE',
        personalInfo: {
            dob: {
                iso8601: '1992-03-11',
            },
            email: 'qxnuccbych@jpgzbgsws.com',
            gender: 'MALE',
            // @ts-expect-error: Test data
            name: '***',
            phoneNumbers: [
                {
                    countryCode: 0,
                    countryCodeSource: 'UNSPECIFIED',
                    extension: '',
                    isoCountryCode: '',
                    italianLeadingZero: false,
                    nationalNumber: 0,
                    numberOfLeadingZeros: 0,
                    preferredDomesticCarrierCode: '',
                    rawInput: '17206574277',
                    type: 'UNKNOWN_TYPE',
                },
            ],
        },
        tier: 'BASIC',
        travelerInfo: {
            adhocTravelerInfo: [],
            userId: {
                id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
            },
        },
        userId: {
            id: '04156553-b7f4-4eeb-b265-bc7be23524f8',
        },
    },
];

export {airReservationPnrData, airReservationTravelers};
