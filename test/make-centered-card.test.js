const { loadImage, createCanvas } = require('canvas');
const makeCard = require('../index');

test('image with centered text to be created correctly', async () => {

    await makeCard({
        width: 1280,
        height: 669,
        output: './test/centered.png',
        fonts: [
            {
                file: './test/Roboto-Bold.ttf',
                family: 'Roboto'
            }
        ],
        texts: [
            {
                text: 'Will Grizzly Bears Survive Being Hunted?',
                font: '84px "Roboto"',
                x: 'center',
                y: 'center',
                color: '#fff',
                maxWidth: 700,
                lineHeight: 104
            },
        ],
        backgroundColor: 'red',
    })

    const expected = await loadImage('./test/expected-centered.png');
    const actual = await loadImage('./test/centered.png');

    let expectedCtx = createCanvas(expected.width, expected.height).getContext('2d');
    expectedCtx.drawImage(expected, 0, 0);
    const expectedData = expectedCtx.getImageData(0, 0, expected.width, expected.height).data;

    let actualCtx = createCanvas(actual.width, actual.height).getContext('2d');
    actualCtx.drawImage(actual, 0, 0);
    const actualData = expectedCtx.getImageData(0, 0, actual.width, actual.height).data;

    expect(String(expectedData)).toEqual(String(actualData))
});
