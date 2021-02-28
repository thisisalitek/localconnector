global.version='01.00.0002';
global._HOST ='connector.tr216.com';


global._PORT = 33216;
global.connectinfo={id:"", password: "",uuid:""};

global._CONNECTION_STATE = -99;  //  0 = Closed  , 1 = Connected , -1 = Error  , -99 = startup
global._CONNECTION_RETRY_INTERVAL = 5000;
global.path = require('path');
global.uuid = require('node-uuid');
global.fs=require('fs');
global.os=require('os');
global.util = require('util');
global.cmd=require('node-cmd');
