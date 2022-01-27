var express = require('express');
var router = express.Router();
var passport= require('passport');
var ModbusData= require('../models/modbusData');
var Modbus= require('../modbus.js');
var User= require('../models/user.model');
var async = require('async');
router.get('/users', async function(req, res, next){
    
    let users= await User.find({});
  
  
    res.render('users', {users: users});
  
  })
  router.get('/users/search', async function(req, res, next){
    
    let users= await User.find({});
    var info= req.query.search_info;
    console.log(req.query.search_info);
    var filterUsers=[];
    users.forEach(function(user){
        if ((user.email && user.email.includes(info))
        || (user.username && user.username.includes(info))
        || (user.room && user.room.includes(info)))
        {
            filterUsers.push(user);
            
        }
    })
    res.render('users', {users: filterUsers});
  
  })
  router.post('/user/:id/delete', function(req, res, next){
    User.findById(req.params.id, function(err, user){
      if (err) {return next(err);};
      User.findByIdAndRemove(req.body.userid, function(err){
        if (err) {return next(err);}
        res.redirect('/admin/users');
      })
    })
  })
  


//plot data on a date of all user
router.get('/admin/plot1/date', async function(req, res, next){
    var users= await User.find({});
    var result=[];
    for(let user of users) {
       if (user.ipAddress!='') {
        /*  var modbusdata= await ModbusData.findOne({ip_address: user.ipAddress});
         if (modbusdata!= null) { 
           
           result.push(modbusdata);
         console.log(modbusdata.ip_address); */
  
        // }
        result.push(ModbusData.findOne({ip_address: user.ipAddress}));
       }
  
     }
      Promise.all(result)
        .then(allResult=> {
            allResult.forEach(item=> console.log(item));
            res.end("sfasf");
     })
  })
  router.get('/user/:id/delete', function(req, res, next){
    User.findById(req.params.id).exec(function(err, user){
      if (err) {return next(err);}
      if (!user) res.redirect('/users');
      res.render('user_delete', {user:user});
    })
  })
  router.get('/signup', function(req, res, next){
    var messages= req.flash('error')
    res.render('signup', {
      messages: messages,
      hasErrors: messages.length>0
    });
  })
  router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/admin/users',
    failureRedirect:'/admin/signup',
    failureFlash: true
  }));
  router.get('/users/:id', async function(req, res, next){
    try {
    var user= await User.findById({_id: req.params.id});
  }
  catch(err) {
      throw(err);
  }
    res.render('user_data', {user: user});
  })
  router.get('/users/:id/change_info', function(req,res){
    res.send('under construction');
  })
  router.get('/users/:id/plot/date', function(req, res, next){
    var date= req.query.date
    console.log('data input: '+ date);
     User.findById({_id: req.params.id}, function(err, result){
      if (err) {next(err);}
      console.log(result);
      var ip= result.ipAddress;
      

      ModbusData.findOne({ip_address: ip}, function(err, mb){
      
          if (err) {next(err);}
          console.log(mb);
          if ((mb=== null)||(mb===undefined)) {
            console.log("here");
            res.render("admin_user_plot", {data: false});

          return;
      }
          else {
            var filterArr=Modbus.dataFilterByDate(mb.datas, date);
            var reduceArr= Modbus.reducerDate(filterArr);
            var time=[];
            var value=[];
            reduceArr.forEach(data=> {
            time.push(data.time)
            value.push(data.value)
          });
          
          
          res.render('admin_user_plot', {time1: time, value1: value, data:true
         });
          }
      });
  })
  })
  router.get('/users/:id/plot/month', function(req, res, next){
    const q= req.query.month;//month
    
    User.findById({_id: req.params.id}, function(err, result){
      if (err) {next(err);}
      console.log(result);
      var ip= result.ipAddress;
      
      ModbusData.findOne({ip_address: ip}, function(err, mb){
          if (err) {next(err);}
          if ((mb=== null)||(mb===undefined)) {
          console.log("here");
          res.render("admin_user_plot", {data: false 
          });
          return;
    }
        else {
          var datas= mb.datas;
          var filterArr= Modbus.dataFilterByMonth(datas,q);
          var reduceArr= Modbus.reducerMonth(filterArr);
          var time=[];
          var value=[];
          reduceArr.forEach(data=> {
          time.push(data.time)
          value.push(data.value)
        });
        console.log("original length: "+ datas.length);
        console.log("filter length: "+ filterArr.length);
        console.log("reducer length: "+ reduceArr.length);
        
        res.render('admin_user_plot', {time1: time, value1: value, data:true
        });
        }
    });
})
  
  })
  router.get('/users/plot/date', async function(req, res, next){
    var data=[];
    var users= await User.find({});
    users.forEach(async function(user){
        if (user.ipAddress!='') {
          var modbusData=  await ModbusData.findOne({ipAddress: user.ipAddress});
          if (modbusData!= null && modbusData!= undefined) {
            data.push(Modbus.dataFilterByDate(modbusData.datas));
          }
        }
    });
    //data aray contain an array; each element is an array[0-23] is energy value at each hour
    //[[1,2,.., 24], []]
    //need test with data
    //each element is {value, time} or null
    var res=new Array(24).fill(0);
      for(let j=0; j< 24; j++)
      for(let i= 0; i<data.length; i++) {
        if (data[i][j]!=null) {
          res[j]= res[j]+data[i][j].value
        } 

        
        //value thu 0 cua mang i
      }
      //res will hold sume value 

    res.send('under construction');
  })
  router.get('/users/plot/month', function(req, res, next){
    res.send("under construction");
  })
  router.get('/users/bill_create', function(req, res){
      //Modbus.createBill
      //Modbus.convertToPDF
      
      
  })
  router.get('/users/send_email', function(req, res){

  })

  module.exports= router;
