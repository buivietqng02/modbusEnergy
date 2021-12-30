var mongoose= require('mongoose');
var User= require('./user.model');
var DataSchema= new mongoose.Schema({
    ip_address:{type: String, required: true},
    datas:[{type: mongoose.Schema.Types.Mixed}],
    port: {type: Number},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});
module.exports= mongoose.model('ModbusData', DataSchema);
