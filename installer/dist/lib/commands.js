//var mrutil = require('./mrtek_modules/mrutil.js');


exports.commandProcessor=function (socket,data){
    console.log('data.command:',data.command);
    switch(data.command.toUpperCase()){
        // case 'KEEPALIVE':
        //     mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, 'OK',data.requestid));
        // break;
        case 'TIME':
            var result={success:true, data:(new Date()).yyyymmddhhmmss()};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result,data.requestid));
        break;
        case 'WHOAREYOU':
            if(connectinfo.id==''){
                mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, 'NEW_ID',{success:true} ,data.requestid));
            }else{
                var result={success:true, data:connectinfo};
                mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
            }
        break;
        
        case 'UPDATE':
            console.log('data.command:',data.command);
            command_UPDATE(socket,data);
            
        break;
        case 'NEW_ID':
            var result={success:true,data:connectinfo};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
            break;
        case 'NEW_PASS':
            var result={success:true,data:connectinfo};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
            break;
        case 'MSSQL_CONNECTION_TEST':
            command_MSSQL_CONNECTION_TEST(socket,data);
        break;
         case 'MSSQL_QUERY':
            command_MSSQL_QUERY(socket,data);
        break;
        case 'MYSQL_CONNECTION_TEST':
            command_MYSQL_CONNECTION_TEST(socket,data);
        break;
        case 'MYSQL_QUERY':
            command_MYSQL_QUERY(socket,data);
        break;
        case 'CMD':
            command_CMD(socket,data);
        break;
        case 'JS':
        case 'WSCRIPT':
        case 'CSCRIPT':
        case 'BAT':
        case 'BASH':
            
            command_JS(socket,data);
        break;
        default:
            var result={success:false,error:{code:'UNKNOWN_COMMAND',message:'Unknown command.'}};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command,result,data.requestid));
        break;
    }
}

var mssql = require('mssql');

function command_MSSQL_CONNECTION_TEST(socket,data){

    var config = {
        user: data.params.connection.user ||data.params.connection.username || '',
        password: data.params.connection.password,
        server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
        database: data.params.connection.database,
        port:Number(data.params.connection.port || 1433),
        options: {
            encrypt: false // Use this if you're on Windows Azure 
        }
    }
    
   
    mssql.connect(config).then(function() {
        
        var request = new mssql.Request();
        request.query('SELECT GETDATE() as T').then(function(recordset) {
            mssql.close();

            
            var result={success:true,  data:'OK'};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
            
        }).catch(function(err) {
            mssql.close();
            var result={success:false, error:{code:err.code || err.name || 'SQLERROR',message:err.name || err.message || 'Sql error'}};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
        });

    }).catch(function(err) {
    		
        mssql.close();
        var result={success:false, error:{code: err.name || 'SQLSERVER_CONNECTION_ERROR',message: err.message || 'SqlServer connection error'}};
        mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
    });
    
}


function command_MSSQL_QUERY(socket,data){
    

    var config = {
        user: data.params.connection.user ||data.params.connection.username || '',
        password: data.params.connection.password,
        server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
        database: data.params.connection.database,
        port:data.params.connection.port || 1433,
        options: {
            encrypt: false // Use this if you're on Windows Azure 
        }
    }
    mssql.close();
            

    mssql.connect(config).then(function() {
        saveLastQuery((data.params.query || ''));
        var request = new mssql.Request();
        request.query(data.params.query).then(function(recordset) {
            mssql.close();
            
            var returnData={rows:[],rowsAffected:0,output:{}};

            if(recordset.recordsets!=undefined){
                returnData.rows=recordset.recordsets;              
            }
            if(recordset.rowsAffected!=undefined){
                returnData.rowsAffected=recordset.rowsAffected;
            }
            if(recordset.output!=undefined){
                returnData.output=recordset.output;
            }
            
            var result={success:true, data:returnData};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));

            // console.log('geri gonderim...');
            // var result={success:true, data:"merhaba dunya"};
            // mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
           

            
        }).catch(function(err) {
            mssql.close();
            var result={success:false, error:{code: err.code,message:'SQL ERROR : ' + err.message}};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
            mssql.close();
        }); 


    }).catch(function(err) {
        console.log(config);
        mssql.close();
        var result={success:false, error:{code: 'SQLSERVER_CONNECTION_ERROR',message:'SqlServer connection error'}};
        mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
    });
    
}


var mysql = require('mysql');

function command_MYSQL_QUERY(socket,data){
    

    var config = {
        user: data.params.connection.user ||data.params.connection.username || '',
        password: data.params.connection.password,
        server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
        database: data.params.connection.database,
        port:data.params.connection.port || 3306,
        multipleStatements: true,
        options: {
            encrypt: true // Use this if you're on Windows Azure 
        },

    }
     
    var connection=mysql.createConnection(config);

    connection.connect(function(err){
        if(!err){
            connection.query(data.params.query,function(err,rows,fields){
                if(!err){
                    var rowsAffected=[];
                    var insertId=[];
                    var fieldList=[];
                    var isMultipleQuery=false;

                    if(fields){
                        if(Array.isArray(fields)){
                            for(var i=0;i<fields.length;i++){
                                if(fields[i]==null){
                                    fieldList.push([]);
                                    if(i>0) isMultipleQuery=true;

                                }else{
                                    if(Array.isArray(fields[i])){
                                        isMultipleQuery=true;
                                        var f=[];
                                        for(var j=0;j<fields[i].length;j++){
                                            f.push(fields[i][j].name);
                                        }
                                        fieldList.push(f);
                                    }else{
                                        if(fieldList.length==0){
                                            fieldList.push([fields[i].name]);
                                        }else{
                                            fieldList[fieldList.length-1].push(fields[i].name);
                                        }
                                        
                                    }
                                    
                                }
                            }
                        }
                    }

                    if(!Array.isArray(rows)){
                        rowsAffected.push(rows.affectedRows || 0);
                        insertId.push(rows.insertId || 0);
                        rows=[[]];
                        fields=[[]];
                    }else{
                        if(!isMultipleQuery){
                            rowsAffected.push(rows.length);
                            insertId.push(0);
                            rows=new Array(rows);
                        }else{
                            for(var i=0;i<rows.length;i++){
                                if(!Array.isArray(rows[i])){
                                    if(isMultipleQuery){
                                        rowsAffected.push(rows[i].affectedRows || 0);
                                        insertId.push(rows[i].insertId || 0);
                                        rows[i]=[];
                                    }
                                }else{
                                    rowsAffected.push(rows[i].length);
                                    insertId.push(0);
                                    
                                }
                            }
                        }
                    }
                    
                   

                    var result={success:true, data:{fields:fieldList,rowsAffected:rowsAffected,insertId:insertId,rows:rows}};
                    mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
                }else{
                    var result={success:false, error:{code: err.code,message:'SQL ERROR : ' + err.message}};
                    mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
                }
            });
        }else{
            var result={success:false, error:{code: 'MSQL_CONNECTION_ERROR',message:err.message}};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
        }
    });
    
}



function command_MYSQL_CONNECTION_TEST(socket,data){
   
    console.log('command_MYSQL_CONNECTION_TEST');
    var config = {
        user: data.params.connection.user ||data.params.connection.username || '',
        password: data.params.connection.password,
        server: data.params.connection.server, // You can use 'localhost\\instance' to connect to named instance 
        database: data.params.connection.database,
        port:data.params.connection.port || 3306,
        options: {
            encrypt: true // Use this if you're on Windows Azure 
        }
    }
    var connection=mysql.createConnection(config);

    connection.connect(function(err){
        if(!err){
            connection.query('SELECT CURDATE() as T',function(err,rows,fields){
                if(!err){
                    console.log(JSON.stringify(rows,null,2));
                    var result={success:true,  data:'OK'};
                    mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
                }else{
                    var result={success:false, error:{code: err.code,message:err.message}};
                    mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
                }
            });
        }else{
            var result={success:false, error:{code: 'MSQL_CONNECTION_ERROR' ,message:err.message}};
            mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
        }
    });
   
    
}

function saveLastQuery(query){
    try{
        //var fs=require('fs');
        
        fs.writeFile('./last_query.sql', query, function (err) {
            console.log('err:',err);
          
        });
    }catch(err){
        console.log('saveLastQuery error:',err);
    }
}


function command_CMD(socket,data){
 
 
    if(Array.isArray(data.params)){
        for(var i=0;i<data.params.length;i++){
            cmd.run(data.params[i]);
        }
        var result={success:true,  data:'OK'};
        mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
    }else{
        cmd.get(data.params,(err, data, stderr)=>{
                if(!stderr){
                    var result={success:true,  data:data};
                    mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
                }else{
                    var result={success:false, error:{code:'CMD_ERROR',message:stderr}};
                    mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
                }
            }
        );
    }
    
}

function command_UPDATE(socket,data){
    if(os.platform()=='win32'){
        mrutil.download(data.params.url,'./update.zip',(err)=>{
            if(!err){
                try{
                    cmd.get('7z.exe x update.zip -y',(err, data, stderr)=>{
                        if(stderr){
                            console.log('stderr:',stderr);
                        }
                        process.exit(0);
                        // cmd.get('node.exe start.js',(err, data, stderr)=>{
                        //     if(stderr){
                        //         console.log('Error:',stderr);
                        //     }
                        //     process.exit(0);
                        // });
                    });
                }catch(e){
                    var result={success:false,error:{code:'UNZIP_ERROR',message:(err.message || 'error')}};
                    mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
                }
            }else{
                var result={success:false,error:{code:'DOWNLOAD_ERROR',message:(err.message || 'error')}};
                mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
            }
            
        });
    }else{
        var result={success:false,error:{code:'ERROR',message:'OS not supported'}};
        mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
    }
}



function runCommand(command){
    //return refrence to the child process
    return exec(
        command
    );
}

function execCmd(executeCommand,params,cb){
    const cp = require('child_process')
    // const child = cp.spawn(exec, [fileName, '-e']);
    const child = cp.spawn(executeCommand, params);

    let buf = ''
    child.stdout.on('data', (c) => {
      buf += c
    })

    child.stderr.on('data', (data) => {
        cb({name:'child_process Error', message:data.toString('UTF-8')},'',data.toString('UTF-8'));
    });

    child.stdout.on('end', () => {
      cb(null,buf.toString('UTF-8'),'');
    })
}

function command_JS(socket,data){

     try{
        var extension='';
        var execParams=[];
        var exec='node';
        switch(data.command.toUpperCase()){
            case 'JS':
                extension='.js';
                exec='node.exe';
            break;
            case 'WSCRIPT':
                extension='.vbs';
                // execParams='/logo /h:wscript /i'
                execParams=['/logo', '/h:wscript', '/i'];
                exec='wscript.exe';
            break;
            case 'CSCRIPT':
                extension='.vbs';
                exec='cscript.exe';
            break;
            case 'BAT':
                extension='.bat';
                exec='';
            break;
            case 'BASH':
                extension='.sh';
                exec='';
            break;
        }
        var fileName=path.join(os.tmpdir() , 'tr216_' + uuid.v4() + extension);

        if(exec==''){
            exec=fileName;
            fileName='';
        }else{
            execParams.unshift(fileName);
        }

        var content='';
        if(data.params.content!=undefined){
            content=data.params.content;
        }else{
            content=data.params;
        }

        fs.writeFile(fileName, content, 'utf8', (err)=>{
            if(!err){
                execCmd(exec,execParams,(err,veri,stderr)=>{
                    if(stderr.trim()==''){
                        var result={success:true,  data:veri};
                        mrutil.socketwrite(socket,mrutil.resPackage(connectinfo,data.command, result ,data.requestid));
                        return;
                    }else{
                        console.log('error:',err);
                        var result={success:false,error:{code:'cmd_JS_ERROR',message:stderr}};
                        mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
                        return;
                    }
                })
                
            }else{
                var result={success:false,error:{code:'cmd_JS_ERROR',message:(err.message || 'command_JS error')}};
                mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
            }
        });

    }catch(err){
        console.log('hata:',err);
        var result={success:false,error:{code:'cmd_JS_ERROR',message:(err.message || 'command_JS error')}};
        mrutil.socketwrite(socket,mrutil.resPackage(connectinfo, data.command,result ,data.requestid));
    }
 
    
    
}