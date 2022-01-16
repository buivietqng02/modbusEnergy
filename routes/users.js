var express = require('express');
var router = express.Router();
var passport= require('passport');
var ModbusData= require('../models/modbusData');
var Modbus= require('../modbus.js');
var User= require('../models/user.model');


const {body, validationResult} = require('express-validator');
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
    
    
  });
});
//create a new user

//signup

//sign in
router.post('/signin', passport.authenticate('local.signin', {
  
  failureRedirect:'/signin',
  failureFlash: true
}), function(req, res){
  if (req.user.email=="admin@gmail.com") {res.redirect('/admin/users');}

 else  res.redirect('/user/'+req.user.id);
});
//plot a user data using query month or date
router.get('/user/:id', async function(req, res, next){
  try {
 var user= await User.find({_id: req.params.id});
  }
  catch(err) {
    next(err);
    }
 console.log(user[0].email);
 
 var formActionDate=  req.url+'/plot/date';
var formActionMonth= req.url+'/plot/month';
 res.render('user_page', {email: user[0].email, req: req, formActionDate:formActionDate, formActionMonth:formActionMonth} );
})
//return data to plot
router.get('/user/:id/plot/date',async  function(req, res, next){
     User.findById({_id: req.params.id}, function(err, result){
      if (err) {next(err);}
      console.log(result);
      var ip= result.ipAddress;
      var formActionDate=  '/user/'+ req.params.id + '/plot/date';
      var formActionMonth=  '/user/'+ req.params.id + '/plot/month';

      ModbusData.findOne({ip_address: ip}, function(err, mb){
      
          if (err) {next(err);}
          console.log(mb);
          if ((mb=== null)||(mb===undefined)) {
            console.log("here");
            res.render("plot", {data: false, formActionDate: formActionDate, formActionMonth: formActionMonth});

          return;
      }
          else {

            var datas= mb.datas.map(item=>Object.assign(item, {"time": (new Date(item.time)).toLocaleTimeString()}));
            var time=[];
            var value=[];
            datas.forEach(data=> {
            time.push(data.time)
            value.push(data.value)
          });
          console.log("original length"+ datas.length);
          //consider already have day in datas 
          //Date.getDay() 1-31
          //Date.getFullYear()
          //Date.getMonth()  0-11
          //nghien cuu function only take 24 data points in a days.
          function dataFilterByDate(datas){
            //function get number of distributedd point from an array
            function reducer(arr) {
              let retArr=[];
              let done;
                for (let i=0; i<24; i++)
                  done=false;
                {
                  for (let j=0; j< arr.length; j++){
                    if (arr[j].time.getHours()==i){
                          retArr.push(arr[j]);
                          done= true;
                          break;
                    }
                    
                  }
                  if(!done) retArr.push(null);
                }

                return retArr;
            }
            const q= req.query;//date
            console.log(q.date);
            var obj= q.date.split('-');
            var year= obj[0];
            var month= obj[1];
            var date= obj[2];
            console.log(year);
            console.log(month);
            console.log(date);
            var filter= datas.filter(data=> {
              return  (data.time.getFullYear()==year)&&((data.time.getMonth()+1)==month)&&(data.time.getDate()== date)
              })
            
            console.log("filter length: "+filter.length);

            return filter;
        }
       // var filer= dataFilterByDate(datas);

          
          var time2= time.slice(10, 1000);
          var value2= value.slice(10,1000);
          res.render('plot', {time1: time2, value1: value2, data:true, formActionDate: formActionDate, 
          formActionMonth: formActionMonth});
          }
      });
  })
});
//get all users

router.get('/user/:id/plot/month',async  function(req, res, next){
  
  function dataFilterByMonth(datas){
    //function get number of distributedd point from an array
    function reducer(arr) {
      //assume arr hold all data in the same month
      let retArr=[];
      let done;
      for (let i=0; i< 31; i++)
      {
        done= false;
        for (let j=0; j< arr.length;j++){
          if (arr[j].time.getDate()==(i+1)) {
            retArr.push(arr[j]);
            done=true;
            break;

          }
        }
        if (!done) retArr.push(null);
      }
      return retArr;

    }
    const q= req.query;//date
    console.log(q.month);
    var obj= q.month.split('-');
    var year= obj[0];
    var month= obj[1];
    console.log(year);
    console.log(month);
    
    var filter= datas.filter(data=> {
      return  (data.time.getFullYear()==year)&&((data.time.getMonth()+1)==month)
      })
    
    console.log("filter length: "+filter.length);

    return filter;
}
  User.findById({_id: req.params.id}, function(err, result){
    if (err) {next(err);}
    console.log(result);
    var ip= result.ipAddress;
    var formActionDate=  '/user/'+ req.params.id + '/plot/date';
    var formActionMonth=  '/user/'+ req.params.id + '/plot/month';
    ModbusData.findOne({ip_address: ip}, function(err, mb){
    
        if (err) {next(err);}
        
        if ((mb=== null)||(mb===undefined)) {
          console.log("here");
          res.render("plot", {data: false, formActionDate: formActionDate, 
          formActionMonth: formActionMonth});

        return;
    }
        else {

          var datas= mb.datas.map(item=>Object.assign(item, {"time": new Date(item.time)}));
          var time=[];
          var value=[];
          datas.forEach(data=> {
          time.push(data.time)
          value.push(data.value)
        });
        console.log(datas.length);
        //consider already have day in datas 
        //Date.getDay() 1-31
        //Date.getFullYear()
        //Date.getMonth()  0-11
        
         
        
        var time2= time.slice(10, 20);
        var value2= value.slice(10,20);
        res.render('plot', {time1: time2, value1: value2, data:true, formActionDate: formActionDate,
        formActionMonth: formActionMonth});
        }
    });
})
  
});
//get all users


//delete a user





//plot data the days in month of all user
//create bill and send email

router.get('/change_password_get', function(req, res){
  res.render('change_password')
})
router.post('/change_password_post', 
  
 async function(req, res, next){
   var errorMessage;
  console.log(req.body.email);
  console.log(req.body.oldpassword);
  console.log(req.body.newpassword);
    
  User.findOne({email: req.body.email}, function(err, user){
    if (err) {return next(err);}
    
    if (user==null || user==undefined)
    {
       console.log('no user');
       errorMessage = "changed password not successfully: Wrong email or password";
       res.render('signin', {errorMessage: errorMessage});

    }
     else {
       console.log(user.password);
      var re= user.validPassword(req.body.oldpassword);
      console.log(re);
      if (re) {
      user.password= user.encryptPassword(req.body.newpassword);
      user.save(function(err){
        if (err) throw err;
        req.flash('info', 'You have changed the password successfully');
        res.redirect('/signin');
      });
    } else {
        errorMessage= "old password is not correct"
       res.render('signin',{errorMessage: errorMessage});
    }

     }
    
  });
})


module.exports = router;
