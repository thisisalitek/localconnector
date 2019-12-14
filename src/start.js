require('./lib/defines.js');

if(process.argv.length>=3){
    if(process.argv[2]=='localhost' || process.argv[2]=='-l'){
        _HOST='localhost';
    }
}
var net = require('net');
global.os = require('os');
var client = new net.Socket();






global.uuid = require('node-uuid');
global.mrutil = require('./lib/mrutil.js');


var util = require('util');

var fs = require("fs");
var rs_command=require('./lib/commands.js');
var path=require('path');





if(!fs.existsSync('./connectinfo.json')){
    fs.writeFileSync('./connectinfo.json', '{"id":"", "password": "","uuid":""}', function (err) {
      if (err) throw err;
      console.log('ConnectionInfo Saved!');
    });
}




loadConnectInfo();

console.log('TR216 LOCAL CONNECTOR ver:' + version);
console.log('HOST:' + _HOST);
console.log('--------------------------------');
console.log('CONNECTOR ID       : ', connectinfo.id);
console.log('CONNECTOR PASSWORD : ', connectinfo.password);

var deneme=0;


function retryConnect(){
    loadConnectInfo();
    // if(_HOST=='localhost' && deneme>=2 && _CONNECTION_STATE!=1){
    //     _HOST=_HOST2;
    //     console.log('_HOST changed:',_HOST);

    // }else{
    //     deneme++;
    // }
    client.connect(_PORT, _HOST);
}

client.on('connect', function () {
    if(connectinfo.id=='' || connectinfo.id==undefined){
        mrutil.console('[connect] request new id. ' + _HOST + ':' + _PORT + '');
        var reqid=uuid.v4();
        mrutil.socketwrite(client,mrutil.reqPackage(connectinfo,'NEW_ID','',reqid));
    }else{
        _CONNECTION_STATE = 1;
        mrutil.console('[connect] Connected to ' + _HOST + ':' + _PORT + '  CONNECTOR ID/PASS : ' + connectinfo.id + '/' + connectinfo.password);
        var reqid=uuid.v4();
        var result={
                version:version,
                datetime:(new Date()).yyyymmddhhmmss(),
                platform:os.platform(),
                architecture:os.arch(),
                uptime:os.uptime(),
                release:os.release(),
                hostname:os.hostname()
            }
        mrutil.socketwrite(client,mrutil.reqPackage(connectinfo,'CONNECT',result,reqid));
    }
  
   
});

var buffer = '';
client.on('data', function (data) {
    try {
        buffer += data.toString('utf8');
        var data2;
        if (buffer.charCodeAt(buffer.length - 1) == 0) {
            data2= mrutil.socketread(buffer.substring(0, buffer.length - 1)); 
            buffer='';
        }else{
            return;
        }

        var ondata = JSON.parse(data2);

        if(ondata.type=='REQUEST'){
            rs_command.commandProcessor(client,ondata);
            
        }else if(ondata.type=='RESPONSE'){
            if(ondata.command=='NEW_ID'){
               
                if(ondata.data.success){
                    
                    var conninfotext={id:ondata.data.data.id,password:ondata.data.data.password,uuid:ondata.data.data.uuid};
                    
                    fs.writeFileSync('./connectinfo.json', JSON.stringify(conninfotext), function (err) {
                      if (err) throw err;
                      loadConnectInfo();
                      mrutil.console('[NEW_ID] OK:' + JSON.stringify(conninfotext));
                      

                    });
                }else{
                    mrutil.console('[NEW_ID] error:' + ondata.data.error.code + ' - ' + ondata.data.error.message);
                    //mrutil.console('[NEW_ID] error:');
                }
            }
            if(ondata.command=='CONNECT'){
                if(ondata.data.success){
                    mrutil.console('Connected');
                }else{
                    mrutil.console('Connection was not successful! Error:' + ondata.data.error.code + ' - ' + ondata.data.error.message);
                }
            }
            if(ondata.command=='KEEPALIVE'){
                
                console.log('Keepalive responsed. Response:' + JSON.stringify(ondata.data));
            }
            if(ondata.command=='NEW_PASS'){
                
                if(ondata.data.success){
                    
                    var conninfotext={id:ondata.data.data.id,password:ondata.data.data.password,uuid:ondata.data.data.uuid};
                    
                    fs.writeFile('./connectinfo.json', JSON.stringify(conninfotext), function (err) {
                      if (err) throw err;
                      loadConnectInfo();
                      mrutil.console('[NEW_PASS] OK:' + connectinfo.password);
                    });
                }else{
                    mrutil.console('[NEW_PASS] error:' + ondata.data.error.code + ' - ' + ondata.data.error.message);
                    //mrutil.console('[NEW_ID] error:');
                }
                

            }
        }
    }
    
    catch(err) {
        mrutil.console(err.message);
    }
});

client.on('close', function () {
    mrutil.console('[onclose] Connection closed.');
    _CONNECTION_STATE = 0;
    
  
});

client.on('end', function () {
    mrutil.console('[onend] Connection ended.');
    _CONNECTION_STATE = 0;
    
  
});

client.on('error', function (err) {
    
    mrutil.console('[onerror] Error: ' + err);
    _CONNECTION_STATE = -1;
    if (err.code == 'ECONNREFUSED') {
        
    }
   
   
});


setInterval(function () {
    
    if (_CONNECTION_STATE != 1) {
        retryConnect();
    }
}, _CONNECTION_RETRY_INTERVAL);

// keep alive and version signal
setInterval(function () {
    if (_CONNECTION_STATE == 1) {
        var reqid=uuid.v4();
        loadConnectInfo();
        
        if(connectinfo.newPassword!=undefined){
            
            mrutil.socketwrite(client,mrutil.reqPackage(connectinfo,'NEW_PASS',connectinfo,reqid));
        }else{
            // var result={
            //     version:version,
            //     datetime:(new Date()).yyyymmddhhmmss()
            // }
            mrutil.socketwrite(client,mrutil.reqPackage(connectinfo,'KEEPALIVE',(new Date()).yyyymmddhhmmss(),reqid));
        }
        
    }
}, 10000);


function loadConnectInfo(){
    try{
        var file_content = fs.readFileSync('./connectinfo.json');
        global.connectinfo = JSON.parse(file_content);
    }catch(err){
        console.log(err);
    }
}
// process.on('uncaughtException', function (err) {
//     mrutil.console('Caught exception: ' + err);
// });
