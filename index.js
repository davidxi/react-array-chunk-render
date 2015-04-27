/**
 *  var arrayChunkRenderMixin = require('react-array-chunk-render');
 *
 *  var MyComponent = React.createClass({
 *    mixins: [arrayChunkRenderMixin],
 *    render: function() {
 *      this.arrayChunkRender(this.props.data, {
 *        iterator: function(item) {
 *          return React.createElement('li', {children: item});
 *        },
 *        after: function(result) {
 *          return React.createElement('ul', {children: result});
 *        },
 *        loading: function() {
 *          return React.createElement('span', {children: 'loading ...'});
 *        }
 *      });
 *      return React.createElement('div', {children: this._vars.arrayChunkResult});
 *    }
 *  });
 */
module.exports = {
    componentWillMount: function() {
        this._vars = this._vars || {};
    },
    arrayChunkRender: function(arr, opts) {
        if (this._vars.inAsyncDoneRender) return;

        if (!Array.isArray(arr)) {
            throw new TypeError('@param \'arr\' should be array type');
        }

        var K = function(a) { return a; };

        var options = React.__spread({}, {
            iterator: K,
            after: K,
            loading: 'Loading ...',
            chunkSize: 1000
        }, opts);

        var timestamp = (new Date()).getTime();
        this._vars.chunkAsyncTs = timestamp;
        this._vars.chunkAsyncTimeout = this._vars.chunkAsyncTimeout || [];

        var len = arr.length;
        var chunk;
        var results = [];
        var inprocess = 0;
        var timeout;

        function processChunk(chunk, index) {
            var list = chunk.map(function(item) {
                return options.iterator(item);
            });
            results = results.concat(list);

            inprocess = inprocess - 1;
            console.log(index + ' ' + inprocess);
            if (inprocess <= 0) {
                this._onArrayChunkDone({
                    result: results,
                    ts: timestamp
                }, options);
            }
        }

        for (var i = 0; i < len; i = i + options.chunkSize) {
            chunk = arr.slice(i, i + options.chunkSize);
            inprocess = inprocess + 1;

            timeout = window.setTimeout(processChunk.bind(this, chunk, i), 0);
            this._vars.chunkAsyncTimeout.push(timeout);
        }

        this._vars.arrayChunkResult =
            typeof options.loading === 'function' ?
            options.loading.call(this, arr) :
            options.loading;
    },
    _onArrayChunkDone: function(memo, options) {
        if (memo.ts < this._vars.chunkAsyncTs) {
            return;
        }
        this._vars.arrayChunkResult = memo.result;
        this._vars.inAsyncDoneRender = true;
        var self = this;
        this.forceUpdate(function onRenderCalled() {
            self._vars.inAsyncDoneRender = false;
        });
    },
    componentWillUnmount: function() {
        if (this._vars.chunkAsyncTimeout) {
            this._vars.chunkAsyncTimeout.forEach(function(timeout) {
                window.clearTimeout(timeout);
            });
        }
    }
};