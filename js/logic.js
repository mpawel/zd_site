var userList = [];
var users = [];
	
var userCookie = readCookie("userID");
var lastUserDataUpdate = readCookie("lastUpdate");
var msc = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień','październik','listopad','grudzień'] ;

//expedition name list
var locationList = [[],['BIAŁA WIEŻA',120,'1:20'],['PUSTYNIA ROZPACZY',180,'1:50'],['PUSTYNIA EFERMEH',220,'2:10'],['OAZA GORĄCYCH ŹRÓDEŁ',260,'2:30'],['WIELKI STEP',320,'3:00'],['ZŁOTA WIEŻA',380,'3:30'],['PALEC DIABŁA',440,'4:00'],['PUSTYNIA EFERMEH II',490,'4:25'],['KAMIENNE BAGNA',580,'5:10'],['PAJĘCZA PRZEPAŚĆ',690,'6:05'],['WIELKI STEP II',780,'6:50'],['GÓRY MĄDROŚCI',850,'7:25'],['SKORUPIA PUSTYNIA',950,'8:15'],['GÓRY PRZEMIANY',1120,'9:40'],['ŚWIĄTYNIA ŚMIERCI',1300,'11:10'],['POLE WIELU KOŚCI',2000,'17:00'],['???',3000,'25:20']];
//eq type list
var eqList = ['broń biała dwuręczna','broń biała jednoręczna','broń palna jednoręczna','broń palna dwuręczna','hełm','zbroja','spodnie','pierścień','amulet'];

$(function() {
	
	///////////////
	//////INIT/////
	///////////////

	var date = new Date();
	var hour = date.getHours();
	var min = parseInt(date.getMinutes()/5);
	
	for ( var i = 1; i < locationList.length; i++) {
		$( "#where" ).append("<option value=\""+i+"\">"+locationList[i][0]+"</option>");
	}
	for ( var i = 0; i < eqList.length; i++) {
		$( "#type" ).append("<option value=\""+eqList[i]+"\">"+eqList[i]+"</option>");
	}

	for ( var i = 1; i <= 24; i++) {
		if ( i == (((parseInt(hour)+2-1)%24)+parseInt(1)) ) {
			$( "#to" ).append("<option value=\""+i+"\" selected >"+i+"</option>");
		} else 
			$( "#to" ).append("<option value=\""+i+"\">"+i+"</option>");
		if (i == parseInt(hour) )
			$( "#from,#oktorej" ).append("<option value=\""+i+"\" selected >"+i+"</option>");
		else
			$( "#from,#oktorej" ).append("<option value=\""+i+"\">"+i+"</option>");
	}
	
	for ( var i = 0; i <= 11; i++) {
		if ( i == min ) {
			$( "#fromm,#tom" ).append("<option value=\""+(i*5)+"\" selected >"+(i*5)+"</option>");
		} else 
			$( "#fromm,#tom" ).append("<option value=\""+(i*5)+"\">"+(i*5)+"</option>");
		
	}
	// Accordion
	$("#expy,#luck,#sprzety,#mirrory").accordion({
		header : "h3",
		autoHeight : false,
//		fillSpace : true,
//		change: function(event, ui) {$(this).accordion("resize");}
	});
	
	
	//get buddys information
	$.post("server-side/db_connector.php",
		{action: "listUID"}
	, function(xml) {
		
		$("user",xml).each(function(i) {
			var uid = $("id",this).text(),
				name=$("name",this).text(),
				level=$("level",this).text();
			//add currently in database
			users.push([uid,name,level]);
			userList.push(name);
			
		});
		
		
		if ( userCookie ) {

	//		if ( ((((date-(new Date(lastUserDataUpdate)))/1000)/60)/60) > 12 ) {
	//			eraseCookie("lastUpdate");
	//			createCookie("lastUpdate",date);
				var level, name, pts=0;
				for ( var i = 0; i < users.length; i++) {
					if (users[i][0] == userCookie) {
						level=users[i][2];
						name=users[i][1];
						break;
					}
					
				}
			// check for changes
			$.ajax({
				async : true,
				type : 'POST',
				url : "server-side/checkUp2Date.php",
				data : {
					ID : userCookie,
					name : name ,
					lvl : level,
					pts : $("points",this).text()
					},
					dateType : "xml",
					complete : function (xml) {
						//noop
					}
					});
		//	}
		}
			
		$( "#you1,#you2,#you3" ).autocomplete({
				source: userList
		});
		//init all other()
		refreshExpList();
		refreshLuckList();
		refreshMirrorList();
		//pseudo trigger
		//exp flush
		$.post("server-side/db_connector.php",{action :"flushExp"});
		$.post("server-side/db_connector.php",{action :"flushLuck"});
		//luck flush
	},"xml");
	
	//user autocompetition
	$( "#you1,#you2,#you3" ).autocomplete({
		source: userList
	});
	
	$( "#when" ).datepicker({dateFormat : 'yy-mm-dd'});


	// Tabs
	$('#tabs').tabs();
		

	// Dialog Link
	$('#dialog_link').click(function() {
		$('#addGamer').dialog('open');
		return false;
	});
	

	$('#dialog_link, ul#icons li,#expListRefresh,#addMem,#delMem,#delExp,#delLuck,#mirrorListRefresh').live("mouseenter",function() {
		$(this).addClass('ui-state-hover');
	});
	$('#dialog_link, ul#icons li,#expListRefresh,#addMem,#delMem,#delExp,#delLuck,#mirrorListRefresh').live("mouseleave", function() {
		$(this).removeClass('ui-state-hover');
	});

	
	$("#addMem").hide();
	$("#delMem").hide();
	$("#delExp").hide();
	$("#delLuck").hide();
	$("#delEq").hide();
	$("#delMir").hide();
	

	$("#expListRefresh").click(function() {		refreshExpList();	});
	$("#luckListRefresh").click(function() {		refreshLuckList();	});	
	$("#mirrorListRefresh").click(function() {		refreshMirrorList();	});
	
	
	
	/////////////
	///ADD NEW///
	////GAMER////
	/////////////
	
	
	// Dialog			
	$('#addGamer').dialog({
		autoOpen : false,
		width : 600,
		buttons : {
			"Ok" : function() {
				var flag = 0,id = $("#id").val();
				for ( var i = 0; i < users.length; i++) {
					if (id == users[i][0] ) {
						flag = 1; break;
					}
				}
				if ( !flag ) {
					var id = $("#id").val();
					$.post("server-side/buddy_info.php",{
						ID : id,
					}, function(xml) {
						var name, lvl, pts;
						name = $("name",xml).text();
						lvl = $("level",xml).text();
						pts = $("points",xml).text();
						if ( name != "") {
							$.post("server-side/db_connector.php",{
								action: "addUser",
								ID: id,
								name : name,
								lvl : lvl,
								pts : pts
								}, function(xml) {
									if ( $("status",xml).text() == "ok" ) {
										$("#addGamer > p.err").remove();
										$( "#you1,#you2" ).autocomplete({
											source: userList
										});
										$("#addGamer").dialog("close");
										users.push([id,name,lvl]);
										userList.push(name);
										if ( userCookie == null) {
											createCookie("userID", id);
											createCookie("lastUpdate",date);
										}
									} else {
										$("#addGamer").append("<p class=\"err\">Błąd bazy danych.</p>");
									}
								},"xml");
						} else {
							$("#addGamer").append("<p class=\"err\">nie ma takiego użytkownika!</p>");
						}
				},"xml");
			} else {
				//show somehow that given ID is already in db
				$("#addGamer").append("<p class=\"err\">Użytkownik o podanym ID już istnieje.</p>");
			}
				},
			"Cancel" : function() {
				$(this).dialog("close");
				$("#addGamer > p.err").remove();
			}
		}
	});
	
	
	/////////////////
	///EXPEDITIONS///
	/////////////////
	

	$("#addExpedition").submit(function() {
		var name = $("#you1").val(), id="", flag=0;
		for ( var i = 0; i < users.length; i++) {
			if (users[i][1] == name) {
				id=users[i][0];
				flag=1;
				break;
			}
		}		
		if (flag) {
			$.post("server-side/db_connector.php", {
				action : "addExp",
				ID : id,
				when : $("#when").val(),
				where : $("#where").val(),
				hour : $("#oktorej").val()
				}, function(xml) {
					//handle possible database error
					alert("dodało się, milordzie!");
					if ( userCookie == null) {
						createCookie("userID", id);
						createCookie("lastUpdate",date);
					}
			}, "xml");
			$("#expy/div:first > p.err").remove();
		} else {
			$("#expy/div:first").append("<p class=\"err\">Błędna nazwa postaci.</p>");
		}
		//stop submitting form
		return false;
	});
	
	
	
	$("#addMem").live("click",function() {
		var curr = $(this);
		var name = curr.prev("input").val(),
		exp_id=curr.closest("tr").attr("id"),		
		flag=0,id=0,lvl;
		for ( var i = 0; i < users.length; i++) {
			if (users[i][1] == name) {
				id=users[i][0];
				lvl=users[i][2];
				flag=1;
				break;
			}
		}
		if ($(curr.closest("tr").get(0).firstChild).text() == name ) {
			flag=0;
		}
		if(flag) {
			$.post("server-side/db_connector.php",{
				action : "mayIGO",
				exp_id : exp_id,
				mem_id : id
					},
			 function(xml) {
						if ( $("count",xml).text() == "0" ) {
							//add new member
							$.post("server-side/db_connector.php",{
								action : "joinExp",
								ID : id,
								where : exp_id
							}, function(xml) {
								if ( $("status",xml).text() == "ok" ) {
									$(curr.parent().get(0).previousSibling.previousSibling.firstChild)
									.append("<option>"+name+"</option>");
									var limit = curr.parent().get(0).previousSibling.firstChild.nodeValue.split('/');
									
									limit[0]=parseInt(limit[0])+parseInt(lvl);
									curr.parent().get(0).previousSibling.firstChild.nodeValue=limit[0]+'/'+limit[1];
									if ( userCookie == null) {
										createCookie("userID", id);
										createCookie("lastUpdate",date);
									}
								} else {
								//error
								}
							},"xml");
						}
			 },"xml");
		} else {
			//no such gamer
			
		}
		return false;
	});
	
	$("#delMem").live("click",function() {
		var curr = $(this);
		var name = $(curr.get(0).previousSibling.previousSibling).val(),
		exp_id=curr.closest("tr").attr("id"),
		flag=0,id=0;
		for ( var i = 0; i < users.length; i++) {
			if (users[i][1] == name) {
				id=users[i][0];
				flag=1;
				break;
			}
		}
		if(flag) {
		//leave expedition
			$.post("server-side/db_connector.php",{
				action : "leaveExp",
				ID : id,
				where : exp_id
			}, function(xml) {
				if ( $("status",xml).text() == "ok" ) {
					$(":contains('"+name+"')",
							curr.parent().get(0).previousSibling.previousSibling.firstChild)
					.remove();
				} else {
					//error
				}
			},"xml");
		} else {
			//no such gamer
			
		}
		return false;
	});
	$("#delExp").live("click",function() {
		var curr = $(this);
		exp_id=curr.closest("tr").attr("id"),id="",cookieName="",
		name=$(curr.closest("tr").get(0).firstChild).text();
		
/////////TO BE USED In the future :)///////////
//		for ( var i = 0; i < users.length; i++) {
//			if (users[i][1] == name) {
//				id=users[i][0];
//			}
//			if (users[i][0]==userCookie) {
//				cookieName=users[i][1];
//			}
//		}
//		if (id == userCookie) {
			var answer = confirm ("Ta ekspedycja należy do "+name+",\n czy na pewno chcesz ją usunąć?");
			if (answer) {
			
				$.post("server-side/db_connector.php",{
					action : "delExp",
					exp_id : exp_id
				}, function(xml) {
					if ( $("status",xml).text() == "ok" ) {
						curr.closest("tr").remove();
					} else {
					//error
					}
				},"xml");
			} else {
			}
//		} else {
//			alert("To nie twoja ekspa, na stronie zapamiętany jesteś jako '"+cookieName
//					+"', aby to zmienić, usuń ciasteczka z tej strony, oraz:" +
//							" dodaj ekspe lub dołącz do ekspy lub wpisz się na lucka");
//		}
		return false;
	});
	
	
	
	
	/////////////////
	////EQUIPMENT////
	/////////////////
	
	
	
	
	$("#addEq").submit(function() {;
		var name = $("#you3").val(), id="", flag=0;
		for ( var i = 0; i < users.length; i++) {
			if (users[i][1] == name) {
				id=users[i][0];
				flag=1;
				break;
			}
		}

		if (flag) {
			$.post("server-side/db_connector.php", {
				action : "addEq",
				ID : id,
				name : $("#name").val(),
				type : $("#type").val(),
				tags : $("#tags").val()
				}, function(xml) {
					//handle possible database error
					alert("dodało się, milordzie!");
					if ( userCookie == null) {
						createCookie("userID", id);
						createCookie("lastUpdate",date);
					}
			}, "xml");
			$("#sprzety/div:first > p.err").remove();
		} else {
			$("#sprzety/div:first").append("<p class=\"err\">Błędna nazwa postaci.</p>");
		}

		return false;
	});
	
	

	$("#eqQuery").submit(function () {
		$("#sprzety table").empty();
		$.post("server-side/db_connector.php",
				{match : $("#query").val(),
				 action : "queryEq"
				},function (xml) {
					$("#sprzety table").append(
					"<tr><th>posiadacz</th><th>nazwa</th><th>typ</th><th>tagi</th><th>usuń</th></tr>");
				$("item",xml).each(function(i) {
					var id =$(this).attr("id"),
					who = $("who",this).text(),
					name= $("name",this).text(),
					type= $("type",this).text(),
					tags=$("tags",this).text();
					
					for ( var j = 0; j < users.length; j++) {
						if(who == users[j][0]){
							who=users[j][1];
							break;
						}
					}

					$("#sprzety table").append(
							"<tr id=\""+id+"\">" +
							"<td>"+who+"</td>" + 
							"<td>"+name+"</td>" +
							"<td>"+type+"</td>"+
							"<td>"+tags+"</td>"+
							"</tr>"
					);
				});
				$("#sprzety tr:gt(0)").each(function() {
					$(this).append("<td>"+
							$("#delEq").clone().show().outerHTML()+"</td>");
				});

			
		},"xml");
		$("#sprzety").accordion("resize");
		return false;
	});
	
	$("#delEq").live("click",function () {
		var curr = $(this),
		eq_id=curr.closest("tr").attr("id"),id="",cookieName="",
		name=$(curr.closest("tr").get(0).firstChild).text();
		
/////////TO BE USED In the future :)///////////
//		for ( var i = 0; i < users.length; i++) {
//			if (users[i][1] == name) {
//				id=users[i][0];
//			}
//			if (users[i][0]==userCookie) {
//				cookieName=users[i][1];
//			}
//		}
//
//	if (id == userCookie) {
		var answer = confirm ("Ten sprzęt należy do "+name+",\n czy na pewno chcesz go usunąć?");
		if (answer) {
		
			$.post("server-side/db_connector.php",{
				action : "delEq",
				ID : eq_id
			}, function(xml) {
				if ( $("status",xml).text() == "ok" ) {
					curr.closest("tr").remove();
				} else {
				//error
				}
			},"xml");
	} else {
		//nothing to do
	}
//	} else {
//		alert("To nie twój sprzęt, na stronie zapamiętany jesteś jako '"+cookieName
//				+"', aby to zmienić, usuń ciasteczka z tej strony, oraz:" +
//						" dodaj ekspe lub dołącz do ekspy lub wpisz się na lucka");
//	}
	return false;
});
	
	
	
	//////////////////////////
	//		LUCK		//////
	//////////////////////////
	
	$("#addLuck").submit(function() {
		var name = $("#you2").val(), id="", flag=0,
		from=$("#from").val(),fromm=$("#fromm").val(),
		to=$("#to").val(),tom=$("#tom").val();
		for ( var i = 0; i < users.length; i++) {
			if (users[i][1] == name) {
				id=users[i][0];
				flag=1;
				break;
			}
		}
		var od=parseInt(from), ddo=parseInt(to);
		if ( od> ddo && (parseInt(from) + parseInt(to))%24 > 2 ) {
			flag=false;
		}
		if ( ( parseInt(from)==parseInt(to) ) && parseInt(fromm)>=parseInt(tom)) {
			flag=false;
		}
		from = parseInt(from) < 10 ? "0"+from : from ;
		to = parseInt(to) < 10 ? "0"+ to : to ;
		fromm = parseInt(fromm) < 10 ? "0"+fromm : fromm ;
		tom = parseInt(tom) < 10 ? "0"+tom : tom ;

		if (flag) {
			
			$.post("server-side/db_connector.php", {
				action : "addLuck",
				ID : id,
				timestamp : $.datepicker.formatDate('yy-mm-dd',date),
				from : from+":"+fromm,
				to : to+":"+tom
				}, function(xml) {
					//handle possible database error
					alert("dodało się, milordzie!");
			}, "xml");
			$("#luck/div:first > p.err").remove();
		} else {
			$("#luck/div:first").append("<p class=\"err\">Błędna nazwa postaci || od <= do .</p>");
		}
		//stop submitting form
		return false;
	});
	
	
	$("#delLuck").live("click",function () {
		var curr = $(this),
			luck_id=curr.closest("tr").attr("id"),id="",cookieName="",
			name=curr.parent().prev().text();
			
/////////TO BE USED In the future :)///////////
//			for ( var i = 0; i < users.length; i++) {
//				if (users[i][1] == name) {
//					id=users[i][0];
//				}
//				if (users[i][0]==userCookie) {
//					cookieName=users[i][1];
//				}
//			}
//	
//		if (id == userCookie) {
			var answer = confirm ("Ten wpis należy do "+name+",\n czy na pewno chcesz go usunąć?");
			if (answer) {
			
				$.post("server-side/db_connector.php",{
					action : "delLuck",
					ID : luck_id
				}, function(xml) {
					if ( $("status",xml).text() == "ok" ) {
						curr.closest("tr").remove();
					} else {
					//error
					}
				},"xml");
		} else {
			//nothing to do
			}
//		} else {
//			alert("To nie twój wpis, na stronie zapamiętany jesteś jako '"+cookieName
//					+"', aby to zmienić, usuń ciasteczka z tej strony, oraz:" +
//							" dodaj ekspe lub dołącz do ekspy lub wpisz się na lucka");
//		}
		return false;
	});
	
	
	
	
	//////////////////////////
	//		RAPORTY		//////
	//////////////////////////
	
	
	
	$("#addRaport").submit(function() {;
		var raport_url = $("#raport").val();

		$.post("server-side/db_connector.php", {
			action : "addMir",
			url : raport_url,
			}, function(xml) {
				//handle possible database error
				alert("dodało się, milordzie!");
//				if ( userCookie == null) {
//					createCookie("userID", id);
//					createCookie("lastUpdate",date);
//				}
		}, "xml");

	return false;
	});
	
	$("#delMir").live("click",function () {
		var curr = $(this),
			mirror_id=curr.closest("tr").attr("id"),id="",
			name=curr.parent().prev().prev().prev().text();
			
			var answer = confirm ("Ten raport należy do "+name+",\n czy na pewno chcesz go usunąć?");
			if (answer) {
			
				$.post("server-side/db_connector.php",{
					action : "delMir",
					ID : mirror_id
				}, function(xml) {
					if ( $("status",xml).text() == "ok" ) {
						curr.closest("tr").remove();
					} else {
					//error
					}
				},"xml");
		} else {
			//nothing to do
			}

		return false;
	});
	
	
	
	
	
});

function refreshExpList() {
	$("#expy table").empty();
	$.post("server-side/db_connector.php", {
		action : "listExp"
		}, function(xml) {
			$("#expy table").append(
				"<tr><th>kto</th><th>gdzie</th><th>kiedy</th><th>sklad</th><th>limit</th><th>zmień</th></tr>");
			$("expedition",xml).each(function(i) {
				var id =$(this).attr("id"),
				who = $("who",this).text(),
				date= $("when",this).text(),
				hour= $("hour",this).text(),
				members=[],members_lvl=parseInt("0", 10),member_select="";
				
				$("members > id",this).each(function () {
					members.push($(this).text());
				});
				for ( var j = 0; j < users.length; j++) {
					if(who == users[j][0]){
						members_lvl+=parseInt(users[j][2]);
						who=users[j][1];
					}
				}
				for ( var i = 0; i < members.length; i++) {
					for ( var j = 0; j < users.length; j++) {
						if(members[i] == users[j][0]){
							members_lvl+=parseInt(users[j][2]);
							members[i]=users[j][1];
						}
					}
					member_select+="<option>"+members[i]+"</option>";
				}
				$("#expy table").append(
						"<tr id=\""+id+"\">" +
						"<td>"+who+"</td>" + 
						"<td>"+locationList[$("where",this).text()][0]+"</td>" +
						"<td>"+date+",godz"+hour+"</td>"+
						"<td><select>"+
						member_select+
						"</select></td>" +
						"<td>"+members_lvl+"/"+locationList[$("where",this).text()][1]+"</td>" +
						"</tr>"
				);
			});
			$("#expy tr:gt(0)").each(function() {
				$(this).append("<td>"+
						$("#you1").clone().attr("id","you").outerHTML()+
						$("#addMem").clone().show().outerHTML()+
						$("#delMem").clone().show().outerHTML()+
						$("#delExp").clone().show().outerHTML()+"</td>");
				$("#you").autocomplete({
					source: userList
				});

			});
			 
	}, "xml");
	$("#expy").accordion("resize");
}


function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}


$.fn.outerHTML = function() {
    $t = $(this);
    if( "outerHTML" in $t[0] ) {
    	return $t[0].outerHTML;
    } else {
        var content = $t.wrap('<div></div>').parent().html();
        $t.unwrap();
        return content;
    }
};

function refreshLuckList() {
	$("#luck table").empty();
	$.post("server-side/db_connector.php", {
		action : "listLuck"
		}, function(xml) {
			$("#luck table").append(
				"<tr><th>dzień</th><th>od</th><th>do</th><th>kto</th><th>usuń</th></tr>");
			$("item",xml).each(function(i) {
				var id =$(this).attr("id"),
				who = $("who",this).text(),
				from= $("from",this).text(),
				to= $("to",this).text(),
				tmstp=$("timestamp",this).text();
				
				for ( var j = 0; j < users.length; j++) {
					if(who == users[j][0]){
						who=users[j][1];
						break;
					}
				}
				tmstp = new String(tmstp);
				tmstp = tmstp.split("-");
				tmstp = new Date(tmstp[0],tmstp[1],tmstp[2]);
				tmstp = tmstp.getDate()+" "+msc[parseInt(tmstp.getMonth())-1];
				
				$("#luck table").append(
						"<tr id=\""+id+"\">" +
						"<td>"+tmstp+"</td>" + 
						"<td>"+from+"</td>" +
						"<td>"+to+"</td>"+
						"<td>"+who+"</td>"+
						"</tr>"
				);
			});
			$("#luck tr:gt(0)").each(function() {
				$(this).append("<td>"+
						$("#delLuck").clone().show().outerHTML()+"</td>");
			});

			 
	}, "xml");
	$("#luck").accordion("resize");
}

function refreshMirrorList() {
	$("#mirrory table").empty();
	$.post("server-side/db_connector.php", {
		action : "listMir"
		}, function(xml) {
			$("#mirrory table").append(
				"<tr><th>gdzie</th><th>kto</th><th>kiedy</th><th>pokaż</th><th>usuń</th></tr>");
			$("raport",xml).each(function(i) {
				var id =$(this).attr("id"),
				who = $("who",this).text(),
				when= $("when",this).text(),
				what= $("what",this).text();
				
				
				$("#mirrory table").append(
						"<tr id=\""+id+"\">" +
						"<td>"+what+"</td>" +
						"<td>"+who+"</td>" +
						"<td>"+when+"</td>"+
						"<td><a href=\"server-side/mirror.php?ID="+id+"\" target=\"_blank\" class=\"raport\">klik</a></td>"+
						"</tr>"
				);
			});
			$("#mirrory tr:gt(0)").each(function() {
				$(this).append("<td>"+
						$("#delMir").clone().show().outerHTML()+"</td>");
			});

			 
	}, "xml");
	$("#mirrory").accordion("resize");
}
