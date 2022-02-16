var passport= require('passport');
var User= require('../models/user.model');
var ModbusData= require('../models/modbusData')
var LocalStrategy= require('passport-local').Strategy;
passport.serializeUser(function(user, done){
    done(null, user.id);
})
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
})
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField:'password',
    passReqToCallback: true
}, async function(req, email, password, done){
    User.findOne({'email': email},  async function(err, user){
        if (err) {return done(err);}
        if (user) {
            return done(null, false, {message: 'Email already in use'})
        }
        
        var newUser= new User();
        newUser.email= email;
        newUser.password= newUser.encryptPassword(password);
        newUser.username= req.body.username;
        //Room: room 3, 
        var splitData= req.body.meter.split(',');
        var room= splitData[0].split(':')[1].trim();
        var slaveId=splitData[1].split(':')[1].trim();
        var ip= splitData[2].split(':')[1].trim();
       var meter= await ModbusData.findOne({room: room, slaveId: slaveId, ip_address: ip});
       newUser.meter= meter._id;
       console.log(meter);
        newUser.save(function(err, result){
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        })
    })
}));
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
  User.findOne({'email': email}, function(err, user){
      if (err) {return done(err);}
      if ((user==null) || (user==undefined)) {
          return done(null, false, {message: 'not username found'});
      }
      if (!user.validPassword(password)) {
          return done(null, false,{message: 'wrong password'});
      }
      return done(null, user);
  })  
}
))