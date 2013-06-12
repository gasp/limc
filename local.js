// 
//  local.js copes with local storage
//  lightim client
//  
//  Created by gaspard on 2013-01-10.
//  WTFPL
// 

var local = {
	init:function(){
		try {
			(window.localStorage.getItem) // will throw in Firefox under some settings
		} catch(e){
			return false; // quit because dom.storage.enabled is false
		}
		return true;
		
	},
	load:function(){
		// get local storage value (config ou friends)
		try{
			var cstring =  window.localStorage.getItem("config");
			// if string is longer than "{}"
			if(cstring.length>2){ 
				// load it
				config = JSON.parse(cstring);
				return true
			}
			else return false;
		}
		catch(e){ return false}


	},
	save:function(){
		// value : config, data : whattostore
		try{
			window.localStorage.setItem("config", JSON.stringify(config));
		}
		catch(e){ return false; }
		return true;
	},
	delete:function(){
		window.localStorage.removeItem("config");
		return true;
	}
}
