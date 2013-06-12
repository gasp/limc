$(document).ready(function(){
		
	$("div[data-role='page']").live('pageshow', function(){
		var id = $(this).attr("id");
		if(id=="page-contacts") ui.contacts();

	    //More stuff to do
	    console.log("changing page to"+id);
//	    $.mobile.hidePageLoadingMsg();
	});
	ui.init();
});

var ui = {
	init:function(){
		
		ui.autoconnect();
		ui.bindswipes();
		ui.bindforms();
	},
	autoconnect:function(){
		if(config.me.user != null)
			ui.dologin({user:config.me.user,password:config.me.password});
	},
	dologin:function(udata){
		ajax.login({user:udata.user,password:udata.password},function(data){
			$.mobile.changePage("#page-contacts",{
				reverse: false,
				changeHash: false
			})
			ui.contacts();
			ui.refresh();
		});
	},
	docreate:function(udata){
		ajax.create({user:udata.user,password:udata.password},function(data){
			$.mobile.changePage("#page-contacts",{
				reverse: false,
				changeHash: false
			})
			ui.contacts();
			ui.refresh();
		});
	},
	refresh:function(){
		ajax.inbox({},function(inbox){
			if(inbox.length){
				if(typeof config.current !== "undefine")
					if(!config.current) // it's false
						ui.contacts();
					else
						ui.messages(config.current);
			}
		});
		
		// kill timer and recreate a new one
		window.clearTimeout(config.timer);
		config.timer = window.setTimeout(function(){
			ui.refresh()
		},30000);
	},
	contacts:function(){
		config.current = false;
		
		$("#page-contacts ul").empty();
		$.each(config.friends,function(key,val){
			var span = $("<span>").addClass("ui-li-count").html(val.unread),
				a = $("<a>").attr({"href":"#page-chat"}).html(key)
				.data({transition:"slide"})
				.bind("click",function(){
					ui.messages(key);
				});
			if(val.unread>0) $(a).append(span)
			 var li = $("<li>").append(a);
			$("#page-contacts ul").append(li);
		});
		
		
		if(typeof $("#page-contacts ul").data().listview === "undefined")
			$("#page-contacts ul").listview({
				filter:true,
				inset: true

			});
		else $("#page-contacts ul").listview("refresh");
		

	},
	messages:function(friend){
		config.current = friend;
		
		console.log(config.friends[friend].inbox.length,"messages,",config.friends[friend].unread,"unread");
		config.friends[friend].unread=0;

		$("#page-chat h1").html(friend);
		$("#page-chat ul").empty();
		$.each(config.friends[friend].inbox,function(key,val){
			var li = $("<li>").text(decodeURIComponent(val.message));
			if(val.from==config.me.user) $(li).addClass("me");
			$("#page-chat ul").append(li);
		});
		
		//setTimeouts allows the transition to end
		window.setTimeout(function(){
			// scrolldown
			var maxY = document.documentElement.scrollHeight - document.documentElement.clientHeight;
			window.scrollTo(0,maxY);
			console.log("scroll to",maxY);
		},400);
		
		if(typeof $("#page-chat ul").data().listview === "undefined")
			window.setTimeout(function(){
				$("#page-chat ul").listview();
			},300);
		else $("#page-chat ul").listview("refresh");
		
		
		
	},
	say:function(data,callback){
		console.log("say",data.message,"to",data.dest);
		ajax.tell(data,function(dt){
			data.dt = dt;
			ajax.storeout(data);
			callback(data);
		})
	},
	new:function(data){
		ui.say(data,function(data){
			$.mobile.changePage("#page-chat",{
				reverse: false,
				transition: "fade"
			});
			ui.messages(data.dest);
			
			$("input#new_dest, textarea#new_message").val("");
			
		});
	},
	chat:function(data){
		ui.say(data,function(data){
			ui.messages(data.dest);
			$("textarea#say_message").val("")
		});
	},
	bindswipes:function(){
		$(".topbar").bind("swipedown",function(){
			ui.refresh();
		});
		$(document).bind("swiperight",function(){
			$.mobile.changePage("#page-contacts",{
				transition:"slide",
				reverse:true
			});
		});
		
	},
	bindforms:function(){
		$("#page-connect form.login").bind("submit",function(e){
			var data ={
				user : $("input#login_user_input",this).val(),
				password : $("input#login_password_input",this).val()
			};
			ui.dologin(data);
			
			e.preventDefault();
			return false;
		});
		$("#page-connect form.create").bind("submit",function(e){
			var data = {
				user : $("input#create_user_input",this).val(),
				password : $("input#create_password_input",this).val()
			}
			ui.docreate(data);
			
			e.preventDefault();
			return false;
		});
		$("#page-new form").bind("submit",function(e){
			var data = {
				dest : $("input#new_dest",this).val(),
				message : $("textarea#new_message",this).val()
			};
			ui.new(data);
			
			e.preventDefault();
			return false;
		});
		$("#page-chat form").bind("submit",function(e){
			var data = {
				dest : config.current,
				message : $("textarea#say_message",this).val()
			};
			if(data.message.length)
				ui.chat(data);
			
			e.preventDefault();
			return false;
		});
		$("#page-chat form textarea").bind("keydown",function(e){
			if(e.keyCode==13){
				e.preventDefault();
				$("#page-chat form").submit();
				return false;
			}
		})
	}
};