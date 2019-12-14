
Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var HH = this.getHours().toString();
    var min = this.getMinutes().toString();
    var sec = this.getSeconds().toString();
    return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0]); 
};

Date.prototype.yyyymmddhhmmss = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var HH = this.getHours().toString();
    var min = this.getMinutes().toString();
    var sec = this.getSeconds().toString();
    return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0]) + ' ' + (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0]) + ':' + (sec[1]?sec:"0" + sec[0]); 
};

Date.prototype.yyyymmddmilisecond = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    var HH = this.getHours().toString();
    var min = this.getMinutes().toString();
    var sec = this.getSeconds().toString();
    var msec = this.getMilliseconds().toString();
    return yyyy + '-' + (mm[1]?mm:"0" + mm[0]) + '-' + (dd[1]?dd:"0" + dd[0]) + ' ' + (HH[1]?HH:"0" + HH[0]) + ':' + (min[1]?min:"0" + min[0]) + ':' + (sec[1]?sec:"0" + sec[0]) + ':' + msec; 
};


exports.timeStamp = function () { return (new Date).yyyymmddhhmmss() };  //UTC time stamp

exports.wait = function (milisecond) {
    var t = new Date().getTime();
    while (t + milisecond > new Date().getTime()) {
        setTimeout('', 5);
    };
    return;
};


exports.console = function (text) {
    console.log('[' + (new Date).yyyymmddhhmmss() + '] ' + text);
};  //UTC time stamp

exports.sendadminmail = function (subject, body){
    return;
    exports.console('Mail Subject : ' + subject);
    exports.console('Mail body : ' + body);
    return;
    var nodemailer = require('nodemailer');
    var smtpTransport = require('nodemailer-smtp-transport');
    // create reusable transporter object using the default SMTP transport
    
    var transporter = nodemailer.createTransport(smtpTransport({
        host: 'mail.mrtek.com.tr',
        port: 587,
        secure:false,
        auth: {
            user: 'automail@mrtek.com.tr',
            pass: 'Atabar18!2'
        },
        tls: { rejectUnauthorized: false }
    }));
    
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"MrTEK Centric Server" <support@mrtek.com.tr>', // sender address
        to: 'alitek@gmail.com',  //to: 'alitek@gmail.com, baz@blurdybloop.com', // list of receivers
        subject: subject + '', // Subject line
        text: body + '', // plaintext body
        html: body + '' // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return exports.console('Mailer // error : ' + error);
        }
        exports.console('Mailer // Message sent: ' + info.response);
    });
}

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

String.prototype.trim = function () {
return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

exports.replaceAll= function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

exports.randomNumber=function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


var crypto = require('crypto'),
    algorithm = 'aes-256-cbc',
    password = 'metinalifeyyaz',
    key = crypto.createHash('md5').update(password, 'utf-8').digest('hex').toUpperCase();

exports.encrypt=function(text){
  //var cipher = crypto.createCipheriv(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

    //var key = Buffer.from(password,'utf8');
    var iv = Buffer.alloc(16);
    var cipher = crypto.createCipheriv(algorithm, key, iv);

  var crypted = cipher.update(text.toString(),'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

exports.decrypt=function(text){

  //var decipher = crypto.createDecipher(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const decipher = crypto.createDecipher('aes-128-cbc', key, iv);
    //var key = Buffer.from(password,'utf8');
    var iv = Buffer.alloc(16);
    var decipher = crypto.createDecipheriv(algorithm, key, iv);

  var dec = decipher.update(text.toString(),'hex','utf8')
  dec += decipher.final('utf8');
  return dec;

}


exports.encryptbuffer=function(buffer){
  //var cipher = crypto.createCipheriv(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

   //var key = Buffer.from(password,'utf8');
    var iv = Buffer.alloc(16);
    var cipher = crypto.createCipheriv(algorithm, key, iv);

  var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
  return crypted;
}

exports.decryptBuffer=function(buffer){
  //var decipher = crypto.createDecipher(algorithm,password)
  // const key = Buffer.from('6d6574696e616c6966657979617a', 'hex');
  // const iv  = Buffer.from('363637373130', 'hex');
  // const decipher = crypto.createDecipher('aes-128-cbc', key, iv);

   //var key = Buffer.from(password,'utf8');
    var iv = Buffer.alloc(16);
    var decipher = crypto.createDecipheriv(algorithm, key, iv);
  var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
  return dec;
}






exports.reqPackage=function(connectinfo, command, params,requestid) {
    requestid=requestid || uuid.v4();
    return JSON.stringify({ connectinfo:connectinfo, type : 'REQUEST', requestid:requestid, command: command || '', params:params || ''});
};

exports.resPackage=function(connectinfo, command, data,requestid) {
    requestid=requestid || uuid.v4();
    return JSON.stringify({ connectinfo:connectinfo, type : 'RESPONSE',requestid:requestid, command: command || '', data:data || ''});
};


exports.socketwrite=function(socket,data,callback){
  socket.write(exports.encrypt(data) + '\0',callback);
}

exports.socketread=function(data){
  return exports.decrypt(data.toString('utf-8'));
}

exports.datefromyyyymmddd = function (text) {
    var yyyy = Number(text.substring(0,4));
    var mm = Number(text.substring(5,7));
    var dd = Number(text.substring(8,10));
    var tarih=new Date(yyyy,mm-1,dd,5,0,0);
    //tarih.setDate(tarih.getDate() + 1);
    return tarih;
};

exports.getdim = function(arr)
{
  if (!Array.isArray(arr)) {
    return 0; 
  }else{
    if (!Array.isArray(arr[0])) {
      return 1;
    }else{
      return 1+exports.getdim(arr[0]);
    }
  }
}

var http = require('http');
var fs = require('fs');

exports.download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err);
  });
}