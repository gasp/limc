$(document).ready(function(){


});

start =  function(){
	ajax.login({user:"gasp",password:"pass"},function(res){
		console.log(res);
		ui.refresh()
	});
}