const fs = require('fs')
const { registerFont, loadImage, createCanvas } = require('canvas')


/**
 * Creates a rounded rect path that is used to clip the context
 * 
 * @param {*} context Draw context
 * @param {number} x Start horizontal position
 * @param {number} y Start vertical position
 * @param {number} w Rectangle width
 * @param {number} h Rectangle height
 * @param {number} r Rectangle radius
 */
function createRoundRectPath(context, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.clip();
}

/**
 * Creates a gradient
 * 
 * @param {object} ctx 
 * @param {*} gradientData 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 */
function createGradient(ctx, gradientData, x, y, w, h) {
    if (gradientData) {
        const gradient = ctx.createLinearGradient(x, y, w, h);
        gradientData.forEach(g => {
            gradient.addColorStop(g.stop, g.color)
        })
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, w, h);
    }
}

/**
 * Draw the text on multiple lines if necessary.
 * Text is split by space, and the words are fit on lines.
 * If the text is a single big text, with no spaces, it will be displayed on
 * one line no matter how big it is. 
 * 
 * @param {string} text The text to draw
 * @param {object} context The draw context
 * @param {number} x Horizontal posititon
 * @param {number} y Vertical position of the text middle
 * @param {number} maxWidth Maximum width of the text
 * @param {number} lineHeight The line height
 */
function drawWrappedText(text, context, x, y, maxWidth, lineHeight) {
    const { actualBoundingBoxAscent, actualBoundingBoxDescent } = context.measureText(text);
    const textHeight = actualBoundingBoxAscent + actualBoundingBoxDescent;
    const words = text.split(' ');
    const lines = [];
    let line = '';

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;

        // if line too big 
        if (testWidth > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    if (line) lines.push(line.trim());

    // y will always be the center line
    let fistLineY = - (lines.length * lineHeight) / 2 + lineHeight / 2;
    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, - textHeight + y + fistLineY + i * lineHeight + (lineHeight - textHeight) * i);
    }
}


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
    borderLeft
}) {

    // load fonts before any drawing
    if (fonts) {
        fonts.forEach(aFont => registerFont(aFont.file, { family: aFont.family }))
    }

    const WIDTH = width || 1280;
    const HEIGHT = height || 669;

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top';

    if (roundedBorder) {
        if (roundedBorder.color) {
            ctx.fillStyle = roundedBorder.color;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
        if (roundedBorder.gradient) {
            createGradient(ctx, roundedBorder.gradient, 0, 0, WIDTH, HEIGHT);
        }

        let x = roundedBorder.width, y = roundedBorder.width, w = WIDTH - 2 * x, h = HEIGHT - 2 * y, r = roundedBorder.radius;
        createRoundRectPath(ctx, x, y, w, h, r)
    }


    // fill all with bg color
    if (backgroundColor) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, WIDTH, HEIGHT)
    }

    // draw template image
    if (templateImage) {
        const template = await loadImage(templateImage)
        ctx.drawImage(template, 0, 0)
    }

    if (borderTop) {
        if (borderTop.color) {
            ctx.fillStyle = borderTop.color
            ctx.fillRect(0, 0, WIDTH, borderTop.width)
        }
        if (borderTop.gradient) {
            createGradient(ctx, borderTop.gradient, 0, 0, WIDTH, borderTop.width);
        }
    }
    if (borderRight) {
        if (borderRight.color) {
            ctx.fillStyle = borderRight.color
            ctx.fillRect(WIDTH - borderRight.width, 0, WIDTH - borderRight.width, HEIGHT)
        }
        if (borderRight.gradient) {
            createGradient(ctx, borderRight.gradient, WIDTH - borderRight.width, 0, WIDTH - borderRight.width, HEIGHT);
        }
    }
    if (borderBottom) {
        if (borderBottom.color) {
            ctx.fillStyle = borderBottom.color
            ctx.fillRect(0, HEIGHT - borderBottom.width, WIDTH, HEIGHT - borderBottom.width)
        }
        if (borderBottom.gradient) {
            createGradient(ctx, borderBottom.gradient, 0, HEIGHT - borderBottom.width, WIDTH, HEIGHT - borderBottom.width);
        }
    }
    if (borderLeft) {
        if (borderLeft.color) {
            ctx.fillStyle = borderLeft.color
            ctx.fillRect(0, 0, borderLeft.width, HEIGHT)
        }
        if (borderLeft.gradient) {
            createGradient(ctx, borderLeft.gradient, 0, 0, borderLeft.width, HEIGHT);
        }
    }

    if (texts) {
        texts.forEach(aText => {
            ctx.fillStyle = aText.color;
            ctx.font = aText.font;

            let metrics = {
                width: 0,
            };
            if (aText.x === 'center' || aText.y === 'center') {
                metrics = ctx.measureText(aText.text);
            }
            const x = aText.x === 'center' ? WIDTH / 2 - metrics.width / 2 : aText.x;
            const y = aText.y === 'center' ? HEIGHT / 2 : aText.y;
            drawWrappedText(aText.text, ctx, x, y, aText.maxWidth || 700, aText.lineHeight || 20)
        })
    }

    // output 

    if (!output) output = 'test.jpeg';
    const stream = /.png$/i.test(output)
        ? canvas.createPNGStream()
        : canvas.createJPEGStream({
            quality: 0.95,
            chromaSubsampling: false
        })

    const out = fs.createWriteStream('./' + output)
    stream.pipe(out)
    out.on('finish', () => console.log(`${output} image was created.`))

}

module.exports = makeCard;