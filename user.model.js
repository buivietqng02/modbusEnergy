var mongoose= require('mongoose');
var Schema= mongoose.Schema;
var bcrypt= require('bcrypt');
var schema= new Schema({
    username: {type: String},
    email: {type: String, required: true},
    password: {type: String, required: true},
    ipAddress: {type: String},
    port: {type: Number},
    room: {type: String}
});
schema.methods.encryptPassword= function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);

};
schema.methods.validPassword= function(password) {
    return bcrypt.compareSync(password, this.password);
};
module.exports= mongoose.model('User', schema);

