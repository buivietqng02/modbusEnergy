var express = require('express');
var router = express.Router();
var passport= require('passport');
var ModbusData= require('../models/modbusData');
var Modbus= require('../modbus.js');
var User= require('../models/user.model');

/* GET users listing. */
//index page
router.get('/', function(req, res, next) {
  res.render('index');
});
//dang nhap page
router.get('/signin', function(req, res, next){
  var messages= req.flash('error');
  res.render('signin', 
  {
    messages: messages,
    hasErrors: messages.length>0
  });
});
//create a new user
router.get('/signup', function(req, res, next){
    var messages= req.flash('error')
    res.render('signup', {
      messages: messages,
      hasErrors: messages.length>0
    });
  })
//signup
router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/signin',
  failureRedirect:'/signup',
  failureFlash: true
}));
//sign in
router.post('/signin', passport.authenticate('local.signin', {
  
  failureRedirect:'/signin',
  failureFlash: true
}), function(req, res){
  res.redirect(req.user.id);
});
//plot a user data using query month or date
router.get('/:id/plot', async function(req, res){
 var user= await User.find({_id: req.params.id});
 console.log(user[0].email);
 var ipAddress= user[0].ipAddress;
 console.log(ipAddress);
 let obj=await ModbusData.find({ip_address: ipAddress});
 var datas=obj[0].datas;


 res.render('user_page', {email: user[0].email, datas: datas});
})
//get all users
router.get('/users', async function(req, res, next){
  let users= await User.find({});
  res.render('users', {users: users});

})
//get session
router.get('/get_session', function(req, res){
  if (req.session) {
    return res.status(200).json({status:'success', session:req.session});
  }
  return res.status(200).json({status: 'error', session: 'no session'});
})
//delete a user
router.get('/user/:id/delete', function(req, res, next){
  User.findById(req.params.id).exec(function(err, user){
    if (err) {return next(err);}
    if (!user) res.redirect('/users');
    res.render('user_delete', {user:user});
  })
})
router.post('/user/:id/delete', function(req, res, next){
  User.findById(req.params.id, function(err, user){
    if (err) {return next(err);};
    User.findByIdAndRemove(req.body.userid, function(err){
      if (err) {return next(err);}
      res.redirect('/users');
    })
  })
})


//plot data on a date of all user
//plot data the days in month of all user
//create bill and send email

module.exports = router;
