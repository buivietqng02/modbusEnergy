var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var nodemailer= require('nodemailer');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter= require('./routes/admin');
var mongoose= require('mongoose');
var app = express();
var session= require('express-session');
var passport= require('passport');
var flash= require('connect-flash');
var ModbusData= require('./models/modbusData');
var User= require('./models/user.model');
require('dotenv').config();
var fs= require('fs');
var pdf= require('html-pdf');

var modbus= require('jsmodbus')
app.use(session({
  secret:'cat',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:600}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
try {
  mongoose.connect('mongodb+srv://vietbk02:vietbk02@cluster0.8yaqq.mongodb.net/nodemailer?retryWrites=true&w=majority',
{
    useUnifiedTopology: true,
    useNewUrlParser: true

} 
    );
    const db= mongoose.connection;
db.on('error', (error)=> {throw error;})
db.once('open', ()=> {console.log('connected to db')})
}
catch (err) {
  
}

require('./config/passport');
//app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler

//require('./modbus');

//section for read modbus data

var Modbus= require('./modbus');


  
  var ipList=  [];
  
  
 
  ipList.push('192.168.1.101');
  ipList.push('127.0.0.1');
  ipList.push('192.168.0.102');
  
  //var ipList=["192.168.1.10", "192.168.1.20", "192.168.1.110"];
 for (let ip of ipList){
  
      Modbus.readData(ip,1);
      
 }
  // Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date()})
  //  Modbus.destroy();
 // Modbus.createFolder();const date2 = new Date('1995-12-17T03:24:00');
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-19T07:00:00')});
 // Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T01:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T02:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T03:00:00')});
//Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T04:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T05:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T06:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 14.0, time:new Date('2021-12-17T07:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T08:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T09:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T10:00:00')});
// Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T11:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T12:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T14:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T15:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T20:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T21:00:00')});
 //Modbus.addRecord('192.168.1.101', {value: 10.0, time:new Date('2021-12-17T23:00:00')});
 
  // Modbus.sendEmail('quocvietqng02@gmail.com', './test.js');

  //Modbus.createFolder();
 // Modbus.createBill('61d9ae086a431a77e177087a', '2021-12');
//Modbus.convertToPDF('./bill/viet100@gmail.com_bill/2021-12.html');

var automateSendEmail= async function(month) {
  var users= await User.find({});
  users.forEach(function(user){
    Modbus.createBill(user._id, month);

  })

}
//automateSendEmail('2021-03');

module.exports = app;

