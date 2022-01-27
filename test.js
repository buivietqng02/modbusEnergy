const Modbus= require('jsmodbus');
const net= require('net');
const socket= new net.Socket();
const client= new Modbus.client.TCP(socket, 1);
const options= {
  'host': '192.168.1.101',
  'port': 502
}
 
try {
  socket.connect(options);
}
catch (err) {
  console.log(err);
}

console.log("here");
  socket.on('connect', async function(){
    console.log('connected');
   console.log(socket.remoteAddress);
   console.log(socket);
      setInterval(async function(){
        var response=await client.readHoldingRegisters(0,4)
        console.log(response.response._body._valuesAsArray);
        await client.writeSingleRegister(2, 12);
        await client.writeSingleRegister(3, 13);
       
      },5000)
     
    
   
    }


  )
  socket.on('error', function(err){
    console.log("server error ",err.code);
    socket.end();
  })



