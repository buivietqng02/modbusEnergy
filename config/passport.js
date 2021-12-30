var passport= require('passport');
var User= require('../models/user.model');
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
}, function(req, email, password, done){
    User.findOne({'email': email},  async function(err, user){
        if (err) {return done(err);}
        if (user) {
            return done(null, false, {message: 'email already in use'})
        }
        var findUser= await User.find({ipAddress:req.body.modbus});
        if (findUser.length>0) return done(null,false, {message: 'modbus address already in use'})
        var newUser= new User();
        newUser.email= email;
        newUser.password= newUser.encryptPassword(password);
        newUser.username= req.body.username;
        newUser.ipAddress= req.body.modbus;
        newUser.port= req.body.port;
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
      if (!user) {
          return done(null, false, {message: 'not username found'});
      }
      if (!user.validPassword(password)) {
          return done(null, false,{message: 'wrong password'});
      }
      return done(null, user);
  })  
}
))