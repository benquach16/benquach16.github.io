<?php

$con = mysqli_connect("localhost","root","","sb_hackathon_test");

$sql = mysqli_query( $con, 
"SELECT ip, id, cmd, verts1, verts2, func from ".$_POST["tableName"]." ORDER BY id DESC LIMIT 1"
);

if(!empty($sql))
{	
	while($id = mysqli_fetch_assoc($sql)) 
	{
		if($_POST["id"] > $id["id"])
			echo "";
			
		else
		{
			$result = mysqli_query( $con,
			"select ip, id, cmd, verts1, verts2, func from ".$_POST["tableName"]." where id = ".$_POST["id"]
			);
			
			if(mysqli_num_rows($result) > 0)
			{
				while($row = mysqli_fetch_assoc($result)) 
				{
					echo $row["ip"]."&".$row["id"]."&".$row["cmd"]."&".$row["verts1"]."&".$row["verts2"]."&".$row["func"];
				}	
			}
		}
	}	
}

mysqli_close($con);
?>