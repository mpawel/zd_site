<?php

// error_reporting(0);

// read arguments
foreach($_POST as $key => $value){
	$$key=$value;
}

$domain = $_SERVER['SERVER_NAME'];

$link = explode("/", $_SERVER['REQUEST_URI']);
for ($i = 0; $i < count($link)-1; $i++) {
	$domain.=$link[$i].'/';
}


$output = new DOMDocument('1.0', 'utf-8');

// $ID="99384";
// $name="Pavel";
// $lvl="69";
// $pts="679";

$url = 'buddy_info.php';
$data = "ID=".$ID;


$response = curl_postData($url, $data);

$DOM = new DOMDocument;
$DOM->loadXML($response);

$xpath = new DOMXpath($DOM);
$namec=select_nodeValue("name", $xpath);
$lvlc=select_nodeValue("level", $xpath);
$ptsc=select_nodeValue("points", $xpath);

// echo $namec.$lvlc.$ptsc;

if ( $name != $namec || $lvl != $lvlc) {
	
	$url = 'db_connector.php';
	$data = "action=updateUID&ID=".$ID."&name=".$namec."&lvl=".$lvlc."&pts=".$ptsc;
	$ret = curl_postData($url, $data);
	$DOM->loadXML($ret);
	$xpath = new DOMXpath($DOM);
	$status=select_nodeValue("status", $xpath);
	if ($status=="ok") {
		$response=$output->createElement("status","updated");
	} else {
		$response=$output->createElement("status","update problem");
		
	}
		
} else {
	$response=$output->createElement("status","no update");
}

function select_nodeValue($nodeName,$xpath) {
	$node = $xpath->query("//".$nodeName);
	$node=$node->item(0)->nodeValue;
	return $node;
}

function curl_postData($url,$data) {
	global $domain;
	$ch = curl_init($domain.$url);
	curl_setopt($ch, CURLOPT_POST, true);
	curl_setopt($ch, CURLOPT_POSTFIELDS,$data);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	
	$response = curl_exec($ch);
	curl_close($ch);
	return $response;
}

$output->appendChild($response);

echo $output->saveXML();

?>