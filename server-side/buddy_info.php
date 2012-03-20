<?php
error_reporting(0);

// read arguments
foreach($_POST as $key => $value){
	$$key=$value;
}

// $ID = "99384";

$html=file_get_contents("http://r1.bloodwars.interia.pl/showmsg.php?a=profile&uid=".$ID);

$DOM = new DOMDocument;
$DOM->loadHTML($html);
$xpath = new DOMXpath($DOM);

$element = $xpath->query('//div[@class="profile-hdr"]/.');
if (!is_null($element)) {
	$name=$element->item(0)->nodeValue;
	$name=substr($name,15);
	$name=trim($name);
}
$element = $xpath->query('//tr[td//text()[contains(.,"PUNKTY")]]/td[2]');
if (!is_null($element)) {
	$ptk=$element->item(0)->nodeValue;
	$ptk=trim($ptk);
}
$element = $xpath->query('//tr[td//text()[contains(.,"POZIOM")]]/td[2]');
if (!is_null($element)) {
	$lvl=$element->item(0)->nodeValue;
	$lvl=trim($lvl);
}

$output = new DOMDocument('1.0', 'utf-8');
$response= $output->createElement("response");
$child = $output->createElement('id', $ID);
$response->appendChild($child);
$child = $output->createElement('name', $name);
$response->appendChild($child);
$child = $output->createElement('points', $ptk);
$response->appendChild($child);
$child = $output->createElement('level', $lvl);
$response->appendChild($child);
$output->appendChild($response);
echo $output->saveXML();


?>