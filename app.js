var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter= require('./routes/admin');
var mongoose= require('mongoose');
var app = express();
var session= require('express-session');
var passport= require('passport');
var flash= require('connect-flash');
var ModbusData= require('./models/modbusData');
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
 mongoose.connect('mongodb+srv://vietbk02:vietbk02@cluster0.8yaqq.mongodb.net/nodemailer?retryWrites=true&w=majority',
{
    useUnifiedTopology: true,
    useNewUrlParser: true
} 
    );
    const db= mongoose.connection;
db.on('error', (error)=> {console.log(error)})
db.once('open', ()=> {console.log('connected to db')})

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


/*  setInterval(async function(){
 var ipList=  await Modbus.ipList();
 console.log(ipList.length);
 console.log(ipList[0]);
 
  //var ipList=["192.168.1.10", "192.168.1.20", "192.168.1.110"];
  for(var i =0;i<ipList.length;i++){
      console.log(ipList[i]);
      Modbus.readData(ipList[i],0);
      }
    },10000);  */
  //  Modbus.destroy();

module.exports = app;

//authentiication user
//implement validation
//provide a public representational state transferrest api to send and receive 