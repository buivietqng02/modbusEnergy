const modbus= require('jsmodbus');
const net= require('net');
var ModbusData= require('./models/modbusData');
var mongoose= require('mongoose');
var User= require('./models/user.model');
/* mongoose.connect('mongodb+srv://vietbk02:vietbk02@cluster0.8yaqq.mongodb.net/nodemailer?retryWrites=true&w=majority',
{
    useUnifiedTopology: true,
    useNewUrlParser: true
} 
    );
    const db= mongoose.connection;
db.on('error', (error)=> {console.log(error)})
db.once('open', ()=> {console.log('connected to db')}) */
//list all ip address modbus

exports.ipList= async  function() {
    var ipList=new Array();
    var list= await User.find({});
        list.forEach((item)=> {
            if (item.ipAddress)
            ipList.push(item.ipAddress);
        })

    console.log(ipList);
    return ipList;
    
}


  exports.readData=function(ipAddress, registerAddress){
    const socket= new net.Socket();
    const client = new modbus.client.TCP(socket);
    var options= {
        'host': ipAddress,
        'port': "502"
    };
     socket.connect(options);
    socket.on('connect', function(){
        console.log('connected');
        client.readHoldingRegisters(registerAddress, 1)
        .then(function(res){
            console.log(res.response._body.valuesAsArray);
            ModbusData.find({ip_address: ipAddress}).exec(function(err, list){
                 if (err) throw err;
                 //if not found, create new 
                 if (list.length==0) {console.log('no db');
                 var obj= {ip_address: ipAddress};
                 var modbusdata= new ModbusData(obj);
                 modbusdata.save(function(err){
                     if (err) throw err;
                     console.log('new db insert');
                 })
                }
                    // if ip found, add data to db
                if (list.length>0) {
                    
                        
                        var data= {
                            value: 10+ Math.random()*10,
                            time: Date.now()
                        }
                       list[0].datas.push(data);
                       list[0].save(function(err){
                           if (err) throw err;
                           console.log(list[0].datas.length);
                           
                       })
                       
                }
             });
            

        })
        .catch(err=> console.error(err))
           
        
    });
    socket.on('error', function(error){
        console.log('error when access ip:'+ ipAddress+' error code '+ error.code);
       
        socket.end();
        //socket.end();
    })
   

}
//delete all users
exports.destroy= async function() {
    var users= await User.find({});
    users.forEach(async function(user) {
        await user.remove();
    })
    
}
exports.dataFilterByDate= function(datas){
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
exports.dataFilterByMonth = function(datas){
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