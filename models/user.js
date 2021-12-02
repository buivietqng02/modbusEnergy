const mongoose= require('mongoose');
const schema= mongoose.Schema;
var UserSchema= new schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true}
});
module.exports= mongoose.model('User1', UserSchema);