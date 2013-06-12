var config ={
	servers:{
		'aws':'http://lightim.aws.af.cm/',
		'freelancis':'http://node.freelancis.net/',
		'kw':'http://dev.kw-creation.com:8989/',
		'hermes':'http://hermes.local:8989/',
		'local':'http://localhost:8989/',
		'current':'aws'
	},
	me:{
		user:null,
		password:null,
		token:null
	},
	friends:{},
	timer : {}
};

var ajax = {
	ping: function(data,callback){
		ajax.query("ping").success(function(json){
			callback(json.ping);
		});
	},
	create:function(data,callback){
		data = $.extend( config.me, data);
		var qs = "create/"+data.user+"/"+data.password;
		ajax.query(qs).success(function(json){
			config.me.token = json.token;
			config.me.user = data.user;
			config.me.password = data.password;
			callback("created with token: "+json.token);
		})
	},
	login:function(data,callback){
		data = $.extend( config.me, data);
		var qs = "login/"+data.user+"/"+data.password;
		ajax.query(qs).success(function(json){
			config.me.token = json.token;
			config.me.user = data.user;
			config.me.password = data.password;
			callback("new token: "+json.token);
		})
	},
	tell:function(data,callback){
		data = $.extend( config.me, data);
		if(typeof data.message !== "undefined"){
			data.message = encodeURIComponent(data.message);
			var qs = "tell/"+data.user+"/"+data.token+"/"+data.dest+"/"+data.message;
			ajax.query(qs).success(function(json){
				callback(json.dt);
			});
		}
	},
	inbox:function(data,callback){
		data = $.extend( config.me, data);
		var qs = "inbox/"+data.user+"/"+data.token;
		ajax.query(qs).success(function(json){
			ajax.store(json.inbox);
			callback(json.inbox);
		});
	},
	about:function(data,callback){
		var qs = "about/"+data.user;
		ajax.query(qs).success(function(json){
			callback(json.dt);
		});
	},
	// query as pseudo-callable returning $.ajax object
	// http://jsfiddle.net/jW68r/
	query:function(q){
		var url = config.servers[config.servers.current]+q;
		console.log("query on url",url);
		return $.ajax({
			url: url,
			dataType: "jsonp",
			jsonpCallback:"lightim",
			error: function(err){
				console.log("ca plante",err);
			}
		});
	},
	store:function(inbox){
		$(inbox).each(function(){
			ajax.storein(this);
		});
	},
	storein:function(m){ // inbox
		if(typeof config.friends[m.from] === "undefined"){
			config.friends[m.from] = {
				inbox: [m],
				unread: 1,
				dt: m.dt
			};
		}
		else{
			config.friends[m.from].inbox.push(m);
			config.friends[m.from].unread++;
			config.friends[m.from].dt = m.dt;
		}
	},
	storeout:function(m){ // outbox
		m.from = config.me.user;
		if(typeof config.friends[m.dest] === "undefined"){
			config.friends[m.dest] = {
				inbox: [m],
				unread: 1,
				dt: m.dt
			};
		}
		else{
			config.friends[m.dest].inbox.push(m);
			config.friends[m.dest].unread++;
			config.friends[m.dest].dt = m.dt;
		}
	},
	reset:function(){
		local.delete();
		config={};
		location.reload();
	}
};

var log = function(message){
	console.log("!#>",message);
}




$(document).ready(function(){
	$("a.action").bind("click",function(e){
		var action = $(this).attr('href').substring(1);
		if(typeof ajax[action] === "function"){
			data = $(this).data()
			console.log("called action",action,data);

			ajax[action].call(this,data,log);
		}
		e.preventDefault();
	});
	
});

if(local.load()){
	console.log("local loaded");
}
$(window).bind('unload',function(){
	local.save();
})