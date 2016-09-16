<?php

$ip=$_SERVER['REMOTE_ADDR'];
$data = array(
    array(  // record 1, or row 1
        $ip, $_POST["cmd"], $_POST["verts1"], $_POST["verts2"], $_POST["func"]
    )
);
 
$data = array_filter($data);
 
// @todo edit below with your own database details
$con = mysqli_connect("localhost","root","","sb_hackathon_test");
 
// Check connection
if (mysqli_connect_errno()) {
    echo 'Failed to connect to MySQL: ' . mysqli_connect_error();
    exit();
}
 
foreach ($data as $row) {
 
$sql = mysqli_query( $con, 
"INSERT INTO ".$_POST["tableName"]." (
ip,
cmd,
verts1,
verts2,
func
)
VALUES (
'$row[0]',
'$row[1]',
'$row[2]',
'$row[3]',
'$row[4]'
)
" );

if (!empty($sql)) {
	$last_id = $con->insert_id;
	echo $last_id;
} else {
	echo "Error creating row: " . $con->error;
}
}
 
mysqli_close($con);
?>