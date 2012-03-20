<?php

$db;
$responseDOM = new DOMDocument('1.0', 'utf-8');
$response = $responseDOM->createElement("response");
$responseDOM->appendChild($response);


//connect db
try {
	
	$db = new PDO('sqlite:../zd.sqlite');

	//read arguments
	foreach($_GET as $key => $value){
		$$key=$value;
	}
	
	$query="SELECT data FROM Mirrors WHERE mirror_id=".$ID.";";
	$res=$db->query($query);
	print bzdecompress($res->fetchColumn(0));
		
} catch (Exception $e) {
	print $e->getMessage();
}
?>