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

console.log('GANYGO LOCAL CONNECTOR Ver1');
console.log('--------------------------------');
console.log('CONNECTOR ID       : ', idstr);
console.log('CONNECTOR PASSWORD : ', connectinfo.password);
console.log('');

var readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
})

enterNewPassword();

function enterNewPassword(){
	readline.question('Enter new password:', (newpassword) => {
		if(!checkPassword(newpassword)){
			setTimeout(enterNewPassword,0);
		}else{
			enterSecondPassword(newpassword,(e)=>{

				if(e=='cancel'){

					setTimeout(()=>{
						readline.close();
					},4000);
					
				}else if(e=='success'){
					saveNewPassword(newpassword,(err)=>{
						if(!err){
							console.log('Your Etulia Connector password changed to ',newpassword);
							setTimeout(()=>{
								readline.close();
								
							},4000);
						}else{
							console.log('Error: Password changing was not successful');
							console.log(err);
							setTimeout(()=>{
								readline.close();
								
							},4000);
						}
					});
					
				}else{
					console.log('Error: Password changing was not successful');
					setTimeout(()=>{
						readline.close();
						
					},4000);
				}
			});
		}
		
	})
}

function enterSecondPassword(firstPass,cb){
	readline.question('Re-enter new password:', (renewpassword) => {
		if(renewpassword.trim()==''){
			console.log('Change password was cancelled.');
			return cb('cancel');
		}
		if(firstPass!=renewpassword){
			console.log('Please re-enter password correctly');
			enterSecondPassword(firstPass,(e)=>{
				cb(e);
			});
		}else{
			cb('success');
		}
	})
}

function checkPassword(pass){
	if(pass.trim()==''){
		console.log('Password is required.');
		return false;
	}else{
		if(pass.indexOf(' ')>-1){
			console.log('You\'ve entered password is wrong.');
			return false;
		}
	}
	return true;
}

function saveNewPassword(newPassword,cb){
	try{
		var fs=require('fs');
		connectinfo['newPassword']=newPassword;
		fs.writeFile('./../connectinfo.json', JSON.stringify(connectinfo), function (err) {
			console.log('err:',err);
	      cb(err)
	    });
	}catch(err){
		cb(err)
	}
}