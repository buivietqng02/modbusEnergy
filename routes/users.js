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
  res.redirect('/users/'+req.user.id);
});
//plot a user data using query month or date
router.get('/users/:id', async function(req, res){
 var user= await User.find({_id: req.params.id});
 console.log(user[0].email);
 var formAction= '/users/'+ req.params.id+'/plot';


 res.render('user_page', {email: user[0].email, req: req, formAction:formAction} );
})
//return data to plot
router.get('/users/:id/plot',async  function(req, res, next){
  const q= req.query;//date
  console.log(q.date);
  var obj= q.date.split('-');
  console.log('year: '+ obj[0]);
  console.log('month: '+ obj[1]);
  console.log('day: '+ obj[2]);
   User.findById({_id: req.params.id}, function(err, result){
    if (err) {next(err);}
    console.log(result);
    var ip= result.ipAddress;
    ModbusData.findOne({ip_address: ip}, function(err, mb){
      console.log("here");
      if (err) {next(err);}
       console.log(mb);
       if (mb== 'undefined') res.send("no data");
       
     var datas= mb.datas.map(item=>Object.assign(item, {"time": new Date(item.time)}));

    res.json(datas);
       
     
    })
    
  });
  

 
 
})
//get all users
router.get('/users', async function(req, res, next){
  console.log(req.query);
  console.log(req.query.room);
  console.log(req.query.useremail);
  console.log(req.query.ipaddress);
  let users= await User.find({});
 var usersfilter= users.filter(user=> 
    (user.email.includes(req.query.useremail))&&
    (user.room ? user.room.includes(req.query.room) : true)
    &&(user.ipAddress ? user.ipAddress.includes(req.query.ipaddress) : true));

  res.render('users', {users: usersfilter});

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
router.get('/users/plot', function(req, res, next){

})

//plot data on a date of all user
//plot data the days in month of all user
//create bill and send email

router.get('/change_password_get', function(req, res){
  res.render('change_password')
})
router.put('/change_password_put', function(req, res, next){
  console.log(req.email);
  console.log(req.oldpassword);
  console.log(req.newpassport);
  res.send("OK");
})
module.exports = router;
