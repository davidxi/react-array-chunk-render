[![npm](https://img.shields.io/badge/npm-0.0.1-blue.svg)]()

# react-array-chunk-render

I had some experience in using React in IE-8 that when rendering a component has children of a long array input, it leads to `long script running alert` in the browser. So this react component mixin is to avoid the `long script running alert` by chopping long array children into chunks, and render those children in an asynchornous way.

## example

```js
var arrayChunkRenderMixin = require('react-array-chunk-render');

var MyComponent = React.createClass({
  mixins: [arrayChunkRenderMixin],
  render: function() {
    this.arrayChunkRender(this.props.data, {
      // called on each item in the array
      iterator: function(item) {
        return React.createElement('li', {children: item});
      },
      // called when all children are processed
      after: function(result) {
        return React.createElement('ul', {children: result});
      },
      // called to set the placeholder dom node when in async process
      loading: function() {
        return React.createElement('span', {children: 'loading ...'});
      }
    });
    return React.createElement('div', {children: this._vars.arrayChunkResult});
  }
});
```

