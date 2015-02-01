<?php

// @todo edit below with your own database details
$con = mysqli_connect("localhost","root","","sb_hackathon_test");
 
// Check connection
if (mysqli_connect_errno()) {
    echo 'Failed to connect to MySQL: ' . mysqli_connect_error();
    exit();
}

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

$tableName = generateRandomString();

$sql = "CREATE TABLE ".$tableName." (
ip VARCHAR(255),
id INT(255) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
cmd VARCHAR(255),
verts1 VARCHAR(255),
verts2 VARCHAR(255),
func VARCHAR(255)
)";

if ($con->query($sql) === TRUE) {
	echo "Table ".$tableName." created successfully";
} else {
    echo "Error creating table: " . $con->error;
}

mysqli_close($con);
?>