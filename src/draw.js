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
 * @param {object} context 
 * @param {*} gradientData 
 * @param {number} x 
 * @param {number} y 
 * @param {number} w 
 * @param {number} h 
 */
function createGradient(context, gradientData, x, y, w, h) {
    if (gradientData) {
        const gradient = context.createLinearGradient(x, y, w, h);
        gradientData.forEach(g => {
            gradient.addColorStop(g.stop, g.color)
        })
        context.fillStyle = gradient;
        context.fillRect(x, y, w, h);
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

    const lineDiff = lineHeight - (lineHeight - textHeight) / 2;
    let firstLineY = y - (lines.length * lineDiff) / 2
    for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, firstLineY + i * lineDiff);
    }
}


/**
 * Draw the card using context
 * @param {object} options 
 */
function draw(context, {
    width,
    height,
    texts,
    templateImage,
    backgroundColor,
    roundedBorder,
    borderTop,
    borderRight,
    borderBottom,
    borderLeft,
    guides
}) {

    const WIDTH = width || 1280;
    const HEIGHT = height || 669;
    context.textBaseline = 'top';

    if (roundedBorder) {
        if (roundedBorder.color) {
            context.fillStyle = roundedBorder.color;
            context.fillRect(0, 0, WIDTH, HEIGHT);
        }
        if (roundedBorder.gradient) {
            createGradient(context, roundedBorder.gradient, 0, 0, WIDTH, HEIGHT);
        }

        let x = roundedBorder.width || 0, y = roundedBorder.width || 0, w = WIDTH - 2 * x, h = HEIGHT - 2 * y, r = roundedBorder.radius || 0;
        createRoundRectPath(context, x, y, w, h, r)
    }


    // fill all with bg color
    if (backgroundColor) {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, WIDTH, HEIGHT)
    }

    // draw template image
    if (templateImage) {
        context.drawImage(templateImage, 0, 0)
    }

    if (borderTop) {
        if (borderTop.color) {
            context.fillStyle = borderTop.color
            context.fillRect(0, 0, WIDTH, borderTop.width)
        }
        if (borderTop.gradient) {
            createGradient(context, borderTop.gradient, 0, 0, WIDTH, borderTop.width);
        }
    }

    if (borderRight) {
        if (borderRight.color) {
            context.fillStyle = borderRight.color
            context.fillRect(WIDTH - borderRight.width, 0, WIDTH - borderRight.width, HEIGHT)
        }
        if (borderRight.gradient) {
            createGradient(context, borderRight.gradient, WIDTH - borderRight.width, 0, WIDTH - borderRight.width, HEIGHT);
        }
    }

    if (borderBottom) {
        if (borderBottom.color) {
            context.fillStyle = borderBottom.color
            context.fillRect(0, HEIGHT - borderBottom.width, WIDTH, HEIGHT - borderBottom.width)
        }
        if (borderBottom.gradient) {
            createGradient(context, borderBottom.gradient, 0, HEIGHT - borderBottom.width, WIDTH, HEIGHT - borderBottom.width);
        }
    }

    if (borderLeft) {
        if (borderLeft.color) {
            context.fillStyle = borderLeft.color
            context.fillRect(0, 0, borderLeft.width, HEIGHT)
        }
        if (borderLeft.gradient) {
            createGradient(context, borderLeft.gradient, 0, 0, borderLeft.width, HEIGHT);
        }
    }

    if (texts) {
        texts.forEach(aText => {
            context.fillStyle = aText.color;
            context.font = aText.font;
            if (aText.x === 'center') {
                context.textAlign = 'center';
            }
            const x = aText.x === 'center' ? WIDTH / 2 : aText.x;
            const y = aText.y === 'center' ? HEIGHT / 2 : aText.y;
            drawWrappedText(aText.text, context, x, y, aText.maxWidth || 700, aText.lineHeight || 20)
        })
    }

    if (guides) {
        context.fillStyle = 'lime';
        context.fillRect(0, HEIGHT / 2, WIDTH, 1)
        context.fillRect(WIDTH / 2, 0, 1, HEIGHT)
    }

}

module.exports = draw;