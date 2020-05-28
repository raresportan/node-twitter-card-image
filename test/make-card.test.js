const { loadImage, createCanvas } = require('canvas');
const makeCard = require('../index');

test('image to be created correctly', async () => {

    await makeCard({
        width: 1280,
        height: 669,
        output: './test/card.png',
        templateImage: './test/twitter-card-template.png',
        fonts: [
            {
                file: './test/Roboto-Bold.ttf',
                family: 'Roboto'
            }
        ],
        texts: [
            {
                text: 'Will Grizzly Bears Survive Being Hunted?',
                font: '64px "Roboto"',
                x: 500,
                y: 669 / 2,
                color: '#222',
                maxWidth: 700,
                lineHeight: 64
            },
            {
                text: 'savethebear.com',
                font: '26pt "Roboto"',
                x: 'center',
                y: 669 - 36,
                color: '#444',
            }
        ],
        backgroundColor: '#fff',
        borderTop: {
            color: '#ffc100',
            gradient: [
                {
                    color: '#e66465',
                    stop: 0
                },
                {
                    color: '#9198e5',
                    stop: 50
                },
            ],
            width: 20
        }
    });

    const expected = await loadImage('./test/expected.png')
    const actual = await loadImage('./test/card.png');

    let expectedCtx = createCanvas(expected.width, expected.height).getContext('2d');
    expectedCtx.drawImage(expected, 0, 0);
    const expectedData = expectedCtx.getImageData(0, 0, expected.width, expected.height).data;

    let actualCtx = createCanvas(actual.width, actual.height).getContext('2d');
    actualCtx.drawImage(actual, 0, 0);
    const actualData = expectedCtx.getImageData(0, 0, actual.width, actual.height).data;

    expect(String(expectedData)).toEqual(String(actualData))

})