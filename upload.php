<?php
if ($_FILES["fileData"]["error"] > 0)
{
  echo "Error: " . $_FILES["fileData"]["error"];
}
else
{
	  echo "" . $_FILES["fileData"]["name"];
}
?>