module.exports = function(RED) {
    "use strict";
    const getPixels = require('get-pixels')
    const GifEncoder = require('gif-encoder');

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
        this.addImageToGif = function(gif, images, counter) {
            getPixels(images[counter], function(err, pixels) {
                if (err) {
                    node.onError(err);
                    return;
                }

                gif.addFrame(pixels.data);
                if (counter === images.length - 1) {
                    gif.finish();
                } else {
                    node.addImageToGif(gif, images, ++counter);
                }
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

            try {
                node.status({ fill: "yellow", shape: "dot", text: "combining" });

                let gif = new GifEncoder(msg.dimensionX, msg.dimensionY);
                gif.on('readable', function () {
                    msg.payload = gif.read();
                    node.send(msg);
                });

                gif.setRepeat(msg.repeat)
                gif.setQuality(msg.quality);
                gif.setDelay(msg.delay);
                gif.writeHeader();

                node.addImageToGif(gif, msg.payload, 0);
            } catch (exception) {
                node.onError(exception.message);
            }
        });
    }

    RED.nodes.registerType("animate-gif", AnimateGifNode);
}