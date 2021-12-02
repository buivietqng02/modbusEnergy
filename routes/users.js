var express = require('express');
var router = express.Router();
var passport= require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/signin', function(req, res, next){
  var messages= req.flash('error');
  res.render('signin', 
  {
    messages: messages,
    hasErrors: messages.length>0
  });
  router.get('/signup', function(req, res, next){
    var messages= req.flash('error')
    res.render('signup', {
      messages: messages,
      hasErrors: messages.length>0
    });
  })
})
router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/signin',
  failureRedirect:'/signup',
  failureFlash: true
}));
router.post('/signin', passport.authenticate('local.signin', {
  
  failureRedirect:'/signin',
  failureFlash: true
}), function(req, res){
  res.redirect(req.user.id);
});

module.exports = router;
