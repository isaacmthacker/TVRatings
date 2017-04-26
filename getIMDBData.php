<?php
$data = file_get_contents("http://www.imdb.com/title/" . $_GET["id"] . "/episodes?season=". $_GET["season"]);
echo $data
?>
