# node-red-contrib-animate-gif

Node-red node for combining a set of buffers into an animated gif.

## Getting Started

Install directly from your NodeRED's Setting Pallete

or

This assumes you have [node-red](http://nodered.org/) already installed and working, if you need to install node-red see [here](http://nodered.org/docs/getting-started/installation)

```shell
$ cd ~/.node-red
$ npm install node-red-contrib-animate-gif
```
## Usage

This package provides a single node, `animate-gif`, which will be under the "functions" group in the pallete. The node exposes configuration settings for delay between frames, image dimensions, quality, and whether to repeat the loop or not. These settings can be set on the node settings, or on the incoming message.

```js
{
  delay: 500,
  dimensionX: 100,
  dimensionY: 100,
  quality: 100,
  repeat: true,
  payload: [
      Buffer(...)
  ]
}
```