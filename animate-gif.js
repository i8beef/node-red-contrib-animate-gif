module.exports = function(RED) {
    "use strict";
    const GifEncoder = require('gif-encoder');
    const sharp = require('sharp');

    function AnimateGifNode(config) {
        RED.nodes.createNode(this, config);

        // Settings
        this.delay = config.delay;
        this.dimensionX = config.dimensionX;
        this.dimensionY = config.dimensionY;
        this.quality = config.quality;
        this.repeat = config.repeat;

        let node = this;

        // Initialize status
        this.status({ fill: "green", shape: "dot", text: "idle" });

        /*
         * Global error handler
         */
        this.onError = function(error) {
            node.status({ fill: "red", shape: "dot", text: "error" });
            node.error(error);
        };

        /*
         * Recursive add images to GIF
         */
        this.addImagesToGif = function(gif, buffers, counter = 0) {
            sharp(buffer[counter])
                .resize(msg.dimensionX, msg.dimensionY)
                .raw()
                .toBuffer()
                .then(data => {
                    gif.addFrame(data);

                    // Necessary to bypass an issue where frame additions require buffer clearing
                    gif.read();
    
                    if (counter === buffers.length - 1) {
                        gif.finish();
                    } else {
                        node.addImageToGif(gif, buffers, ++counter);
                    }
                })
                .catch(err => {
                    node.onError(err);
                });
        };

        /*
         * Node-red input handler
         */
        this.on("input", function(msg) {
            // Validate incoming message
            if (msg.payload == null || !Array.isArray(msg.payload)) {
                msg.payload = [];
            }

            msg.delay = msg.delay || node.delay;
            msg.dimensionX = msg.dimensionX || node.dimensionX;
            msg.dimensionY = msg.dimensionY || node.dimensionY;
            msg.quality = msg.quality || node.quality;
            msg.repeat = msg.repeat || node.repeat;

            if (msg.quality < 1) msg.quality = 1;
            if (msg.quality > 20) msg.quality = 20;

            try {
                node.status({ fill: "yellow", shape: "dot", text: "combining" });

                let gifOptions = {
                  highWaterMark: 2 * 1024 * 1024 // 2MB
                };

                let gif = new GifEncoder(msg.dimensionX, msg.dimensionY, gifOptions);
                gif.setRepeat(msg.repeat)
                gif.setQuality(msg.quality);
                gif.setDelay(msg.delay);

                const chunks = [];
                gif.on('data', function (chunk) {
                    chunks.push(chunk);
                });

                gif.on('end', function() {
                    msg.payload = Buffer.concat(chunks);
                    node.send(msg);
                    node.status({ fill: "green", shape: "dot", text: "idle" });
                });

                gif.writeHeader();
                node.addImageToGif(gif, msg.payload, 0);
            } catch (exception) {
                node.onError(exception.message);
            }
        });
    }

    RED.nodes.registerType("animate-gif", AnimateGifNode);
}