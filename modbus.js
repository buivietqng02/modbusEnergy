const modbus= require('jsmodbus');
const net= require('net');
var ModbusData= require('./models/modbusData');
var mongoose= require('mongoose');
mongoose.connect('mongodb+srv://vietbk02:vietbk02@cluster0.8yaqq.mongodb.net/nodemailer?retryWrites=true&w=majority',
{
    useUnifiedTopology: true,
    useNewUrlParser: true
} 
    );
    const db= mongoose.connection;
db.on('error', (error)=> {console.log(error)})
db.once('open', ()=> {console.log('connected to db')})

//const socket= new net.Socket();

//const client = new modbus.client.TCP(socket);


  function readData(ipAddress, registerAddress){
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
                 if (list.length==0) {console.log('no db');
                 var obj= {ip_address: ipAddress};
                 var modbusdata= new ModbusData(obj);
                 modbusdata.save(function(err){
                     if (err) throw err;
                     console.log('new db insert');
                 })
                }
                if (list.length>0) {
                    console.log(list);
                        console.log(list[0].datas);
                        var data= {
                            value: 10+ Math.random()*10,
                            time: Date.now()
                        }
                       list[0].datas.push(data);
                       list[0].save(function(err){
                           if (err) throw err;
                           console.log(list[0].datas.length);
                           console.log(list[0].datas)
                       })
                       
                }
             });
            

        })
        
    });
    socket.on('error', function(error){
        console.log(error.code);
       
        socket.end();
        //socket.end();
    })
   

}
var ipList= [
    '192.168.1.1',
    '192.145.2.1',
    '192.168.43.75'
];
setInterval(function(){
    for(var ip of ipList){
        readData(ip,0);
        }
},10000)
