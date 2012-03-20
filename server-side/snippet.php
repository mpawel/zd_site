<?php

global	$db;
 $db = new PDO('sqlite:../zd.sqlite');
 
 $tokens="demon dwuręczna";
 $str1="broń biała dwuręczna";
 $str2="doskonały demoniczny miecz dwuręczny";
echo evalContainScore($tokens, $str1, $str2);
/**
 * 
 * Function evaluate how many tokens of given data is contained by two other strings
 * @param $match string with tokens to search
 * @parem $str1 string to search tokens
 * @parem $str2 string to search tokens
 */
function evalContainScore($match, $str1, $str2) {
	$score = 0;
	$patterns = preg_split("/\s+/", $match);
	foreach ($patterns as $p) {
		print $p."\t".$str1." ".preg_match("/".$p."/i",$str1)."\n\t".$str2." ".preg_match("/".$p."/i",$str2)."\n";
		$score+=preg_match("/".$p."/i",$str1);
		$score+=preg_match("/".$p."/i",$str2);
	}
	return intval($score,10);
}
 
?>