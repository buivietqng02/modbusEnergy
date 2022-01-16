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
    const q= req.query;//date
    console.log(q.date);
    var obj= q.date.split('-');
    console.log(q);
    var year= obj[0];
    var month= obj[1];
    var date= obj[2];
    console.log(year);
    console.log(month);
    console.log(date);
  
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
          var filter= datas.filter(data=> {
           return  (data.time.getFullYear()==year)&&((data.time.getMonth()+1)==month)&&(data.time.getDate()== date)
          })
            
            console.log(filter.length);
           
          
          var time2= time.slice(10, 20);
          var value2= value.slice(10,20);
          res.render('admin_user_plot', {time1: time2, value1: value2, data:true
          });
          }
      });
  })
  })
  router.get('/users/:id/plot/month', function(req, res, next){
    const q= req.query;//date
    console.log("dsvsjdvksd" +q.month);
    
  
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
            res.render("admin_user_plot", {data: false}
            );
  
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
          res.render('admin_user_plot', {time1: time2, value1: value2, data:true
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

  module.exports= router;
