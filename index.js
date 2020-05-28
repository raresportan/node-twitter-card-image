const fs = require('fs')
const { registerFont, loadImage, createCanvas } = require('canvas')
const draw = require('./src/draw')


/**
 * Make the card
 * @param {object} options 
 */
async function makeCard({
    width,
    height,
    output,
    texts,
    templateImage,
    fonts,
    backgroundColor,
    roundedBorder,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    tinypngApiKey,
    guides
}) {

    // load fonts before any drawing
    if (fonts) {
        fonts.forEach(aFont => registerFont(aFont.file, { family: aFont.family }))
    }

    const template = templateImage ? await loadImage(templateImage) : null;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    draw(
        ctx,
        {
            width,
            height,
            output,
            texts,
            templateImage: template,
            fonts,
            backgroundColor,
            roundedBorder,
            borderTop,
            borderRight,
            borderBottom,
            borderLeft,
            guides
        }
    )

    // output 

    return new Promise((resolve, reject) => {
        if (!output) output = './test.jpeg';
        const stream = /.png$/i.test(output)
            ? canvas.createPNGStream()
            : canvas.createJPEGStream({
                quality: 0.95,
                chromaSubsampling: false
            })

        if (tinypngApiKey) {
            const tinify = require("tinify");
            tinify.key = tinypngApiKey;

            const buffer = canvas.toBuffer(/.png$/i.test(output) ? 'image/png' : 'image/jpeg')
            tinify.fromBuffer(buffer).toFile(output);
        }
        else {
            const out = fs.createWriteStream(output)
            stream.pipe(out)
            out.on('finish', () => { resolve(`${output} created`) })
            stream.on('error', reject)
        }
    })

}

exports.drawCard = draw;

module.exports = makeCard;