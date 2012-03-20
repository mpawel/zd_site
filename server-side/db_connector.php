<?php

//initialize output
//test
//"addUser","addLuck","addExp"
// $actions=array("listUID","listLuck","listExp");
// $ID=34567;
// $when="2012-02-05";
// $where=1;
// $hour=12;
// $exp_id=1;
// $from="12:30";
// $to="13:30";
// foreach ($actions as $i => $action) {

$db;
$responseDOM = new DOMDocument('1.0', 'utf-8');
$response = $responseDOM->createElement("response");
$responseDOM->appendChild($response);


function leadZero($arg) {
	if ( $arg < 10 ) {
		return "0".$arg;
	}
	return $arg;
}

function gt($first , $second) {
	return intval(intval($first,10) >= intval($second,10),10);
}

/**
*
* Function evaluate how many tokens of given data is contained by two other strings
* @param $match string with tokens to search
* @parem $str1 string to search tokens
* @parem $str2 string to search tokens
*/
function evalContainScore($match, $str1, $str2,$str3) {
	$score = 0;
	$patterns = preg_split("/\s+/", $match);
	foreach ($patterns as $p) {
// 		print $p."\t".$str1." ".preg_match("/".$p."/i",$str1)."\n\t".$str2." ".preg_match("/".$p."/i",$str2)."\n";
		$score+=preg_match("/".$p."/i",$str1);
		$score+=preg_match("/".$p."/i",$str2);
		$score+=preg_match("/".$p."/i",$str3);
	}
	return intval($score,10);
}

//connect db
try {
	
	global	$db;
	$db = new PDO('sqlite:../zd.sqlite');
	$db->sqliteCreateFunction('leadZero','leadZero',1);
	$db->sqliteCreateFunction('gt','gt',2);
	$db->sqliteCreateFunction('containScore','evalContainScore',4);
// 	$name="leg dwur";
// 	$query = "SELECT * FROM Equipment WHERE containScore('".$name."',name,type) > 0  ORDER BY containScore('".$name."',name,type) DESC;";
// 	$query="SELECT * FROM Expedition WHERE gt(strftime('%Y%m%d','now','-1 day'),strftime('%Y%m%d',_when)) AND strftime('%H',leadZero(hour)||':00') < strftime('%H','now');";	
// 	$res=$db->query($query);
// 	print_r($res);
// 	foreach ($res as $r) {
// 		print_r($r);
// 	}
// 	$url="http://r1.bloodwars.interia.pl/showmsg.php?mid=100765306&key=2181a54e86";
// 	$action="listMir";
	

	//read arguments
	foreach($_POST as $key => $value){
		$$key=$value;
	}
	

	switch($action) {
		case "addUser" :		insertUser($ID,$name,$lvl,$pts);		 	break;
		case "addExp" :			insertExpedition($ID, $when, $where, $hour);			break;
	 	case "joinExp" : 		insertJoin2Expedition($ID, $where);	 		break;
	 	case "leaveExp" : 		deleteLeaveExpedition($ID, $where);	 		break;
	 	case "delExp" :	 		deleteExpedition($exp_id);	 		break;
	 	case "addLuck" : 		insertLuck($ID, $timestamp,$from,$to);	 		break;
	 	case "delLuck" : 		deleteLuck($ID);	 		break;
	 	case "addEq" :	 		insertEquipment($ID, $type, $name, $tags);	 		break;
	 	case "delEq" :	 		deleteEquipment($ID);			break;
	 	case "addMir" :	 		insertMirror($url);	 		 break;
	 	case "delMir" :	 		deleteMirror($ID);	 		break;
	 	case "queryEq" :		queryEquipment($match);	 		break;	 		
		case "listExp" :		listExps();		 	break;
		case "listLuck" :		listLuck();		 	break;
		case "listUID" :		listUIDs();			break;
		case "listMir" :		listMirrors();			break;
		case "flushExp" :		flushOldExp();			break;
		case "flushLuck" :		flushOldLuck();			break;			
		case "updateUID" :		updateUser($ID, $name, $lvl, $pts);			break;
		case "mayIGO" :			mayIGOToo($exp_id, $mem_id);			break;
		default: break;
	}
	
	$element = $responseDOM->createElement("status","ok");
	$response->appendChild($element);

} catch (Exception $e) {
	$element = $responseDOM->createElement("status","bad");
	$response->appendChild($element);
	die();
}

echo $responseDOM->saveXML();
//test foreach
// }
// print $ID;



function insertUser($ID,$name,$lvl,$pts) {
	global $db;
	$query="INSERT INTO Users VALUES(".$ID.",'".$name."',".$lvl.",".$pts.");";
	$sth=$db->prepare($query);
	$sth->execute();
	// 	global $response;
// 	$response->appendChild($response->createTextNode($query));
// 	$db->exec($query);
}
function updateUser($ID,$name,$lvl,$pts) {
	global $db;
	$query="UPDATE Users SET ID=".$ID.",name='".$name."',lvl=".$lvl.",points=".$pts." WHERE ID=".$ID.";";
	$sth=$db->prepare($query);
	$sth->execute();
	global $response,$responseDOM;
	$response->appendChild($responseDOM->createTextNode($query));
}

/**
 * 
 * Join 2 Expedition
 * @param ID $who
 * @param exp_id $where
 */
function insertJoin2Expedition($who, $where) {
	global $db;
	$query="INSERT INTO Exp_members VALUES(".$who.",".$where.");";
// 	global $response,$responseDOM;
// 	$response->appendChild($responseDOM->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
}

/**
 * 
 * Leave Expedition
 * @param ID $who
 * @param exp_id $where
 */
function deleteLeaveExpedition($who, $where) {
	global $db;
	$query="DELETE FROM Exp_members WHERE exp_id=".$where." AND mem_id=".$who.";";
// 	global $response,$responseDOM;
// 	$response->appendChild($responseDOM->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
}

function deleteExpedition($where) {
	global $db;	
	$query="DELETE FROM Expedition WHERE exp_id=".$where.";";
	$sth=$db->prepare($query);
	$sth->execute();
	$query="DELETE FROM Exp_members WHERE exp_id=".$where.";";
	$sth=$db->prepare($query);
	$sth->execute();
}

function insertExpedition($who,$when,$where,$hour) {
	global $db;
	$query="INSERT INTO Expedition VALUES(NULL,".$who.",'".$when."',".$where.",".$hour.");";
// 	global $response, $responseDOM;
// 	$response->appendChild($responseDOM->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
}

function insertLuck($who,$timestamp,$from,$to) {
	global $db;
	$query="INSERT INTO Luck VALUES(NULL,'".$from."','".$to."',".$who.",'".$timestamp."');";
	global $response,$responseDOM;
	$response->appendChild($responseDOM->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
}

function deleteLuck($id) {
	global $db;
	$query="DELETE FROM Luck WHERE luck_id=".$id.";";
// 	global $response;
// 	$response->appendChild($response->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
}

function insertEquipment($who_id,$type,$name,$tags) {
	global $db;
	$query="INSERT INTO Equipment VALUES(NULL,".$who_id.",'".$name."','".$type."','".$tags."');";
	global $response,$responseDOM;
	$response->appendChild($responseDOM->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
}


function deleteEquipment($ID) {
	global $db;
	$query="DELETE FROM Equipment WHERE eq_id=".$ID.";";
	// 	global $response;
	// 	$response->appendChild($response->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
}

/**
 * 
 * insert survey, to do in the future
 * @param int $title
 * @param string[] $questions
 */
function insertSurvey($title, $questions) {
	global $db;
	$query="INSERT INTO Equipment VALUES(".$who_id.",'".$type."','".$name."');";
	$sth=$db->prepare($query);
	$sth->execute();
}


function queryEquipment($match) {
	global $db,$response,$responseDOM;
	preg_replace("/\+/", " ", $match);
	$query = "SELECT * FROM Equipment WHERE containScore('".$match."',name,type,tag) > 0  ORDER BY containScore('".$match."',name,type,tag) DESC;";
	$result=$db->query($query);
	foreach($result as $row) {
		$element = $responseDOM->createElement("item");
		$element->setAttribute("id", $row['eq_id']);
		$child = $responseDOM->createElement("who",$row['owner']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("name",$row['name']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("type",$row['type']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("tags",$row['tag']);
		$element->appendChild($child);
		$response->appendChild($element);
	}
}

function listUIDs() {
	global $db,$responseDOM,$response;
	$query="SELECT * FROM Users";
	$result=$db->query($query);
	foreach($result as $row)  {
		$user = $responseDOM->createElement("user");
		$element = $responseDOM->createElement("id",$row['ID']);
		$user->appendChild($element);
		$element = $responseDOM->createElement("name",$row['name']);
		$user->appendChild($element);
		$element = $responseDOM->createElement("level",$row['lvl']);
		$user->appendChild($element);
		$element = $responseDOM->createElement("points",$row['points']);
		$user->appendChild($element);
		$response->appendChild($user);
	}
}

function listLuck() {
	global $db,$response,$responseDOM;
	$query="SELECT * FROM Luck ORDER BY luck_id DESC,date(timestamp) DESC";
	$result=$db->query($query);
	foreach($result as $row) {
		$element = $responseDOM->createElement("item");
		$element->setAttribute("id", $row['luck_id']);
		$child = $responseDOM->createElement("timestamp",$row['timestamp']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("who",$row['who']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("from",$row['from']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("to",$row['to']);
		$element->appendChild($child);
		$response->appendChild($element);
	}
}

function flushOldLuck() {
	global $db;
	$query = "DELETE FROM Luck WHERE gt(strftime('%Y%m%d','now','-7 day'),strftime('%Y%m%d',timestamp))";
	$db->exec($query);
	
}


function listExps(){
	global $db,$response,$responseDOM;
	$query="SELECT * FROM Expedition ORDER BY date(_when) DESC";
	$result1=$db->query($query);
	foreach($result1 as $row1) {
		$element = $responseDOM->createElement("expedition");
		$element->setAttribute("id", $row1['exp_id']);
		$child=$responseDOM->createElement("who",$row1['who']);
		$element->appendChild($child);
		$child=$responseDOM->createElement("where",$row1['_where']);
		$element->appendChild($child);
		$child=$responseDOM->createElement("when",$row1['_when']);
		$element->appendChild($child);
		$child=$responseDOM->createElement("hour",$row1['hour']);
		$element->appendChild($child);
		$query="SELECT mem_id FROM Exp_members WHERE exp_id=".$row1['exp_id'].";";
		$result2=$db->query($query);
		$child=$responseDOM->createElement("members");
		foreach($result2 as $row2) {
			$cchild = $responseDOM->createElement("id",$row2['mem_id']);
			$child->appendChild($cchild);
		}
		$element->appendChild($child);
		$response->appendChild($element);
	}
}

function flushOldExp() {
	global $db;
	$query="DELETE FROM Exp_members WHERE exp_id IN (SELECT exp_id FROM Expedition WHERE gt(strftime('%Y%m%d','now','-2 day'),strftime('%Y%m%d',_when)) AND strftime('%H',leadZero(hour)||':00') < strftime('%H','now'));";
	$db->exec($query);
	$query="DELETE FROM Expedition WHERE gt(strftime('%Y%m%d','now','-2 day'),strftime('%Y%m%d',_when)) AND strftime('%H',leadZero(hour)||':00') < strftime('%H','now');";
	$db->exec($query);
}

function mayIGOToo($exp_id, $mem_id) {
	global $db,$response,$responseDOM;
	$query="SELECT count(*) FROM Exp_members WHERE exp_id =".$exp_id." AND mem_id=".$mem_id.";";
	$sth=$db->prepare($query);
	$sth->execute();
	$result=$sth->fetchAll();
	$element=$responseDOM->createElement("count",$result[0]['count(*)']);
	$response->appendChild($element);
	
}




function insertMirror($url) {
	global $db,$response,$responseDOM;
	
	$html=file_get_contents($url);
	
	$DOM = new DOMDocument;
	$DOM->loadHTML($html);
	$xpath = new DOMXpath($DOM);
	$info=$xpath->query("//table/tr");
	
	$name=$info->item(0)->lastChild->nodeValue;
	$time=$info->item(1)->lastChild->nodeValue;
	$ID=preg_replace(
		array('/\(/','/\)/','/\s*/'),
		array('','',''),
		$info->item(2)->lastChild->nodeValue);
	$query="SELECT name FROM Users WHERE ID=".$ID.";";
	$res=$db->query($query);
	$nick=$res=$res->fetchColumn(0);
	
// 	print $nick."\n".$name."\n".$time."\n";
// 	print $html;
	$html=bzcompress($html,9);
// 	print gzuncompress($html);
// 	$html=addslashes($html);
	
	$query=$db->prepare("INSERT INTO Mirrors VALUES(NULL,:blob_data,'".$name."','".$nick."','".$time."');");
	$query->bindValue(':blob_data', $html, PDO::PARAM_LOB);
	$query->execute();
// 	$query="SELECT data FROM Mirrors;";
// 	$res=$db->query($query);
// 	print gzuncompress($res->fetchColumn(0));
	
// 	$element=$responseDOM->createElement("response","ok");
// 	$response->appendChild($element);
}




function deleteMirror($ID) {
	global $db;
	$query="DELETE FROM Mirrors WHERE mirror_id=".$ID.";";
	// 	global $response;
	// 	$response->appendChild($response->createTextNode($query));
	$sth=$db->prepare($query);
	$sth->execute();
} 



function listMirrors() {
	global $db,$responseDOM,$response;
	$query="SELECT who,what,time,mirror_id FROM Mirrors;";
	$result=$db->query($query);
	foreach($result as $row)  {
		$element = $responseDOM->createElement("raport");
		$element->setAttribute("id", $row['mirror_id']);
		$child = $responseDOM->createElement("who",$row['who']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("when",$row['time']);
		$element->appendChild($child);
		$child = $responseDOM->createElement("what",$row['what']);
		$element->appendChild($child);
		$response->appendChild($element);
	}
}


?>