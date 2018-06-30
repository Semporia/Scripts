var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('yiYan', new Schema({
    content: String,
    from: String,
    type: String,
    creator: String,
    yid: String,
    created_at: {type: Number, default: (Date.now()/1000).toPrecision(10)}
}));