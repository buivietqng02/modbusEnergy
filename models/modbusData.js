var mongoose= require('mongoose');
var User= require('./user');
var DataSchema= new mongoose.Schema({
    ip_address:{type: String, required: true},
    datas:[{type: mongoose.Schema.Types.Mixed}],
     
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User1'}
});
module.exports= mongoose.model('ModbusData', DataSchema);
