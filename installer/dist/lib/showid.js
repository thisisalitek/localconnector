require('./defines.js');

var connectinfo=require('./../connectinfo.json');
var idstr="";
var id=connectinfo.id.toString();

for(var i=0;i<id.length;i++){
	idstr =id.substr(id.length-i-1,1) + idstr;
	if(i>0 && ((id.length-i-1) % 3==0)){
		idstr =' ' + idstr;
	}
}
idstr = idstr.trim();

console.log('TR216 LOCAL CONNECTOR Ver:' + version);
console.log('--------------------------------');
console.log('CONNECTOR ID       : ', idstr);
console.log('CONNECTOR PASSWORD : ', connectinfo.password);
console.log('');
