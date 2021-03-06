var scene, camera, renderer;
var light;
var grid;
var geometry;
var raycaster;
var mouse = new THREE.Vector2();
var mouseOld = new THREE.Vector2();
var angleX = 0.0;
var angleY = 0.0;

var globalObjects = [];

var middleMouseDown = false;
var rightMouseDown = false;
var leftMouseDown = false;
//bounding box
var boundBox;
var initX;
var initY;
var mouseOffset = 24;
var selectedVertices = [];
var vertexindices = [];
var selectedGeometry = null;
var selectedFace = null;


var allObjects = [];

var differenceVector = new THREE.Vector3();


var modeEnum = {
	SELECTION_MODE : "selection_mode",
	EDIT_MODE : "edit_mode",
	EXTRUDE_MODE : "extrude_mode",
};

var transformModeEnum = {
	TRANSLATE_MODE : "translate_mode",
	SCALE_MODE: "scale_mode",
	ROTATE_MODE: "rotate_mode"
};

var axisModeEnum = {
	X : "X",
	Y : "Y",
	Z : "Z"
};

var CURRENT_MODE = modeEnum.SELECTION_MODE;
var CURRENT_TRANSFORM_MODE = transformModeEnum.TRANSLATE_MODE;
var CURRENT_AXIS = axisModeEnum.X;

var extrude_amnt = extrudetext.extrudeAmount;

init();
render();
onMouseMove(event);

function switchMode( mode )
{
	CURRENT_MODE = mode;
}

function switchTransformMode( mode )
{
	CURRENT_TRANSFORM_MODE = mode;
}

function deselectMesh()
{
	if(selectedGeometry != null)
	{
		selectedGeometry.material.emissive.setHex(0x999999);
		selectedGeometry = null;
	}
}

function pickFace()
{
	var intersects = raycaster.intersectObjects(scene.children);
	if(intersects.length > 0)
	{
		selectedFace = intersects[0].face;
		selectedFace.color = new THREE.Color(0xeeff00);
	}
}

function onMouseMove( event )
{
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = (( event.clientX / window.innerWidth ) * 4 - 1) * window.innerWidth;
	mouse.y = - (( event.clientY / window.innerHeight ) * 4 + 1) * window.innerHeight;
	if(boundBox) 
	{
		//drawBoundBox(event);
	}

	highlightVertices();

	if(selectedGeometry != null)
	{
		if(CURRENT_MODE == modeEnum.EDIT_MODE)
		{
			if(CURRENT_TRANSFORM_MODE == transformModeEnum.TRANSLATE_MODE)
			{
				if(CURRENT_AXIS == axisModeEnum.X)
				{
					for(var i = 0 ; i < selectedVertices.length; i ++)
					{
						selectedVertices[i].x += (mouse.x - mouseOld.x);

					}
					selectedGeometry.geometry.verticesNeedUpdate = true;
					differenceVector.x += (mouse.x - mouseOld.x);
				}
				else if(CURRENT_AXIS == axisModeEnum.Y)
				{
					for(var i = 0 ; i < selectedVertices.length; i ++)
					{
						selectedVertices[i].y -= (mouseOld.y - mouse.y);

					}
					selectedGeometry.geometry.verticesNeedUpdate = true;
					differenceVector.y -= (mouse.y - mouseOld.y);
				}
				else if(CURRENT_AXIS == axisModeEnum.Z)
				{
					for(var i = 0 ; i < selectedVertices.length; i ++)
					{
						selectedVertices[i].z+= (mouse.x - mouseOld.x);

					}
					selectedGeometry.geometry.verticesNeedUpdate = true;
					differenceVector.z += (mouse.x - mouseOld.x);
				}
			}
			
			else if(CURRENT_TRANSFORM_MODE == transformModeEnum.SCALE_MODE)
			{
				var average = 0;
				var i = 0;
				if(CURRENT_AXIS == axisModeEnum.X)
				{
					
					for(i = 0; i < selectedVertices.length; i++)
					{
						average += selectedVertices[i].x;
					}
					average /= i;
					for(i = 0; i < selectedVertices.length; i++)
					{
						selectedVertices[i].x -= average;
						selectedVertices[i].x *= 1+(mouse.x - mouseOld.x)/window.innerWidth;
						selectedVertices[i].x += average;
					}
					differenceVector.x *= (1+(mouse.x - mouseOld.x)/window.innerWidth);
				}
				
				if(CURRENT_AXIS == axisModeEnum.Y)
				{
					for(i = 0; i < selectedVertices.length; i++)
					{
						average += selectedVertices[i].y;
					}
					average /= i;
					for(i = 0; i < selectedVertices.length; i++)
					{
						selectedVertices[i].y -= average;
						selectedVertices[i].y *= 1+(mouse.y - mouseOld.y)/window.innerWidth;
						selectedVertices[i].y += average;
					}
					differenceVector.y *= (1+(mouse.y - mouseOld.y)/window.innerHeight);
				}
				
				if(CURRENT_AXIS == axisModeEnum.Z)
				{
					for(i = 0; i < selectedVertices.length; i++)
					{
						average += selectedVertices[i].z;
					}
					average /= i;
					for(i = 0; i < selectedVertices.length; i++)
					{
						selectedVertices[i].z -= average;
						selectedVertices[i].z *= 1+(mouse.x - mouseOld.x)/window.innerWidth;
						selectedVertices[i].z += average;
					}
					differenceVector.z *= (1+(mouse.x - mouseOld.x)/window.innerWidth);
				}
			}
			else if(CURRENT_TRANSFORM_MODE == transformModeEnum.ROTATE_MODE)
			{
				if(CURRENT_AXIS == axisModeEnum.X)
				{
					var avg_x = 0;
					var avg_y = 0;
					var avg_z = 0;
					var i;
					for(i = 0 ; i < selectedVertices.length; i++) {
							avg_x += selectedVertices[i].x;
							avg_y += selectedVertices[i].y;
							avg_z += selectedVertices[i].z;
						}
					avg_x /= i;
					avg_y /= i;
					avg_z /= i;
					
					var avgVec = new THREE.Vector3(avg_x, avg_y, avg_z);
					var axis = new THREE.Vector3(1,0,0);
					var angle = (mouseOld.y - mouse.y)*5/window.innerHeight;
					
					var matrix3 = new THREE.Matrix3;
					matrix3.set(1,0,0,
							0, Math.cos(angle), -Math.sin(angle),
							0, Math.sin(angle), Math.cos(angle));
					
					
					for(i = 0; i < selectedVertices.length; i++) {
						selectedVertices[i].sub(avgVec);
						selectedVertices[i].applyMatrix3(matrix3);
						selectedVertices[i].add(avgVec);
					}
					differenceVector.x += (mouseOld.y - mouse.y)*5/window.innerHeight;
				}
				else if(CURRENT_AXIS == axisModeEnum.Y)
				{
					var avg_x = 0;
					var avg_y = 0;
					var avg_z = 0;
					var i;
					for(i = 0 ; i < selectedVertices.length; i++) {
							avg_x += selectedVertices[i].x;
							avg_y += selectedVertices[i].y;
							avg_z += selectedVertices[i].z;
						}
					avg_x /= i;
					avg_y /= i;
					avg_z /= i;
					
					var avgVec = new THREE.Vector3(avg_x, avg_y, avg_z);
					var axis = new THREE.Vector3(0,1,0);
					var angle = (mouse.x - mouseOld.x)*5/window.innerWidth;
					
					var matrix3 = new THREE.Matrix3;
					matrix3.set(Math.cos(angle),0,Math.sin(angle),
							0, 1, 0,
							-Math.sin(angle), 0, Math.cos(angle));
					
					
					for(i = 0; i < selectedVertices.length; i++) {
						selectedVertices[i].sub(avgVec);
						selectedVertices[i].applyMatrix3(matrix3);
						selectedVertices[i].add(avgVec);
					}
					differenceVector.y += (mouse.x - mouseOld.x)*5/window.innerWidth;
				}
				else if(CURRENT_AXIS == axisModeEnum.Z)
				{
					var avg_x = 0;
					var avg_y = 0;
					var avg_z = 0;
					var i;
					for(i = 0 ; i < selectedVertices.length; i++) {
							avg_x += selectedVertices[i].x;
							avg_y += selectedVertices[i].y;
							avg_z += selectedVertices[i].z;
						}
					avg_x /= i;
					avg_y /= i;
					avg_z /= i;
					
					var avgVec = new THREE.Vector3(avg_x, avg_y, avg_z);
					var axis = new THREE.Vector3(0,0,1);
					var angle = (mouse.y - mouseOld.y)*5/window.innerWidth;
					
					var matrix3 = new THREE.Matrix3;
					matrix3.set(Math.cos(angle),-Math.sin(angle),0,
							Math.sin(angle), Math.cos(angle), 0,
							0, 0, 1);
					
					
					for(i = 0; i < selectedVertices.length; i++) {
						selectedVertices[i].sub(avgVec);
						selectedVertices[i].applyMatrix3(matrix3);
						selectedVertices[i].add(avgVec);
					}
					differenceVector.z += (mouse.y - mouseOld.y)*5/window.innerWidth;
				}
			}
		}
		else if(CURRENT_MODE == modeEnum.SELECTION_MODE)
		{
			if(leftMouseDown)
			{
				var average = 0;
				var i = 0;
				if(CURRENT_AXIS == axisModeEnum.X)
				{
					if(CURRENT_TRANSFORM_MODE == transformModeEnum.TRANSLATE_MODE)
					{
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							selectedGeometry.geometry.vertices[i].x += (mouse.x - mouseOld.x);
						}
						differenceVector.x += (mouse.x - mouseOld.x);
					}
					else if(CURRENT_TRANSFORM_MODE == transformModeEnum.SCALE_MODE)
					{
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							average += selectedGeometry.geometry.vertices[i].x;
						}
						average /= i;
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							selectedGeometry.geometry.vertices[i].x -= average;
							selectedGeometry.geometry.vertices[i].x *= 1+(mouse.x - mouseOld.x)/window.innerWidth;
							selectedGeometry.geometry.vertices[i].x += average;
						}
						differenceVector.x *= 1+(mouse.x - mouseOld.x)/window.innerWidth;
					}
					else if(CURRENT_TRANSFORM_MODE == transformModeEnum.ROTATE_MODE)
					{
						var avg_x = 0;
						var avg_y = 0;
						var avg_z = 0;
						var i;
						for(i = 0 ; i < selectedGeometry.geometry.vertices.length; i++) {
								avg_x += selectedGeometry.geometry.vertices[i].x;
								avg_y += selectedGeometry.geometry.vertices[i].y;
								avg_z += selectedGeometry.geometry.vertices[i].z;
							}
						avg_x /= i;
						avg_y /= i;
						avg_z /= i;
						
						var avgVec = new THREE.Vector3(avg_x, avg_y, avg_z);
						var axis = new THREE.Vector3(1,0,0);
						var angle = (mouseOld.y - mouse.y)*5/window.innerHeight;
						
						var matrix3 = new THREE.Matrix3;
						matrix3.set(1,0,0,
								0, Math.cos(angle), -Math.sin(angle),
								0, Math.sin(angle), Math.cos(angle));
						
						
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++) {
							selectedGeometry.geometry.vertices[i].sub(avgVec);
							selectedGeometry.geometry.vertices[i].applyMatrix3(matrix3);
							selectedGeometry.geometry.vertices[i].add(avgVec);
						}
						differenceVector.x += (mouseOld.y - mouse.y)*5/window.innerHeight;
					}
					selectedGeometry.geometry.verticesNeedUpdate = true;


 					//translatePoints(selectedGeometry.geometry.vertices,vect,allObjects.indexOf(selectedGeometry.geometry));
				}
				else if(CURRENT_AXIS==axisModeEnum.Y)
				{
					if(CURRENT_TRANSFORM_MODE == transformModeEnum.TRANSLATE_MODE)
					{
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							selectedGeometry.geometry.vertices[i].y += (mouse.y - mouseOld.y);
						}
						differenceVector.y += (mouse.y - mouseOld.y);
					}
					else if(CURRENT_TRANSFORM_MODE == transformModeEnum.SCALE_MODE)
					{
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							average += selectedGeometry.geometry.vertices[i].y;
						}
						average /= i;
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							selectedGeometry.geometry.vertices[i].y -= average;
							selectedGeometry.geometry.vertices[i].y *= 1+(mouse.y - mouseOld.y)/window.innerWidth;
							selectedGeometry.geometry.vertices[i].y += average;
						}
						differenceVector.y *= 1+(mouse.y - mouseOld.y)/window.innerWidth;
					}
					else if(CURRENT_TRANSFORM_MODE == transformModeEnum.ROTATE_MODE)
					{
						var avg_x = 0;
						var avg_y = 0;
						var avg_z = 0;
						var i;
						for(i = 0 ; i < selectedGeometry.geometry.vertices.length; i++) {
								avg_x += selectedGeometry.geometry.vertices[i].x;
								avg_y += selectedGeometry.geometry.vertices[i].y;
								avg_z += selectedGeometry.geometry.vertices[i].z;
							}
						avg_x /= i;
						avg_y /= i;
						avg_z /= i;
						
						var avgVec = new THREE.Vector3(avg_x, avg_y, avg_z);
						var axis = new THREE.Vector3(0,1,0);
						var angle = (mouseOld.x - mouse.x)*5/window.innerWidth;
						
						var matrix3 = new THREE.Matrix3;
						matrix3.set(Math.cos(angle),0,Math.sin(angle),
								0, 1, 0,
								-Math.sin(angle), 0, Math.cos(angle));
						
						
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++) {
							selectedGeometry.geometry.vertices[i].sub(avgVec);
							selectedGeometry.geometry.vertices[i].applyMatrix3(matrix3);
							selectedGeometry.geometry.vertices[i].add(avgVec);
						}

						differenceVector.y += (mouseOld.x - mouse.x)*5/window.innerWidth;
					}
					selectedGeometry.geometry.verticesNeedUpdate = true;
					
				}
				else if(CURRENT_AXIS==axisModeEnum.Z)
				{
					if(CURRENT_TRANSFORM_MODE == transformModeEnum.TRANSLATE_MODE)
					{
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							selectedGeometry.geometry.vertices[i].z += (mouse.x - mouseOld.x);
						}
						differenceVector.z += (mouse.x - mouseOld.x);
					}
					else if(CURRENT_TRANSFORM_MODE == transformModeEnum.SCALE_MODE)
					{
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							average += selectedGeometry.geometry.vertices[i].z;
						}
						average /= i;
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++)
						{
							selectedGeometry.geometry.vertices[i].z -= average;
							selectedGeometry.geometry.vertices[i].z *= 1+(mouse.x - mouseOld.x)/window.innerWidth;
							selectedGeometry.geometry.vertices[i].z += average;
						}
						differenceVector.z += (mouse.x - mouseOld.x)/window.innerWidth;
					}
					else if(CURRENT_TRANSFORM_MODE == transformModeEnum.ROTATE_MODE)
					{
						var avg_x = 0;
						var avg_y = 0;
						var avg_z = 0;
						var i;
						for(i = 0 ; i < selectedGeometry.geometry.vertices.length; i++) {
								avg_x += selectedGeometry.geometry.vertices[i].x;
								avg_y += selectedGeometry.geometry.vertices[i].y;
								avg_z += selectedGeometry.geometry.vertices[i].z;
							}
						avg_x /= i;
						avg_y /= i;
						avg_z /= i;
						
						var avgVec = new THREE.Vector3(avg_x, avg_y, avg_z);
						var axis = new THREE.Vector3(0,0,1);
						var angle = (mouseOld.x - mouse.x)*5/window.innerWidth;
						
						var matrix3 = new THREE.Matrix3;
						matrix3.set(Math.cos(angle),-Math.sin(angle),0,
								Math.sin(angle), Math.cos(angle), 0,
								0, 0, 1);
						
						
						for(i = 0; i < selectedGeometry.geometry.vertices.length; i++) {
							selectedGeometry.geometry.vertices[i].sub(avgVec);
							selectedGeometry.geometry.vertices[i].applyMatrix3(matrix3);
							selectedGeometry.geometry.vertices[i].add(avgVec);
						}

						differenceVector.z += (mouseOld.x - mouse.x)*5/window.innerWidth;
					}
					selectedGeometry.geometry.verticesNeedUpdate = true;
				}
			}
		}
		//mouseOld.x = event.clientX;	
		selectedGeometry.geometry.verticesNeedUpdate = true;
	}

	if(middleMouseDown)
	{
		

		/*
		var quat = new THREE.Quaternion();
		var direction = new THREE.Vector3(-(event.clientX - mouseOld.x),event.clientY - mouseOld.y,0);
		quat.setFromEuler(camera.rotation);

		var endVect;
		direction.applyQuaternion(quat);
		//camera.position.z -= delta*10;
		camera.position.x = direction.x + camera.position.x;
		camera.position.y = direction.y + camera.position.y;
		camera.position.z = direction.z + camera.position.z;
		mouseOld.x = event.clientX;
		mouseOld.y = event.clientY;*/
	}
	else if(rightMouseDown)
	{
		
		
		/*angleX -= (event.clientX - mouseOld.x)/window.innerWidth;
		angleY -= (event.clientY - mouseOld.y)/window.innerHeight;
		camera.rotation.y = angleX * Math.PI/180;
		camera.rotation.x = angleY * Math.PI/180;*/
		/*
		angleX+= event.clientX - mouseOld.x;
		angleY+= event.clientY - mouseOld.y;
		if(angleX > 360)
			angleX -=360;
		if(angleX < 0)
			angleX +=360;
		if(angleY > 360)
			angleY -= 360;
		if(angleY < 0)
			angleY += 360;
		mouseOld.x = event.clientX;
		mouseOld.y = event.clientY;		
		var X = Math.sin(angleX * Math.PI/180)*1000;
		var Z = Math.cos(angleX * Math.PI/180)*1000;

		camera.position.x = X;
		camera.position.z = Z;
		//camera.lookAt(0,0,0);*/
	}

	//console.log(mouse.x + ", " + mouse.y + "   " + mouseOld.x + ", " + mouseOld.y );
	mouseOld.x = mouse.x;
	mouseOld.y = mouse.y;
}

function onMouseDown( event )
{

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	if(!leftMouseDown && !rightMouseDown && !middleMouseDown && 
		CURRENT_TRANSFORM_MODE == transformModeEnum.SCALE_MODE)
	{
		differenceVector.x = 1;
		differenceVector.y = 1;
		differenceVector.z = 1;
	}
	if(event.button == 0)
	{
		//left
		leftMouseDown = true;


		if(CURRENT_MODE == modeEnum.EDIT_MODE)
		{
			boundBox = true;
			selectedVertices.length = 0;
			vertexindices.length  =0;
			//get intial x and y coords for bounding box
			var pos = getMousePos(event);
			pos.x -= mouseOffset;
			pos.y += mouseOffset;
			initX = pos.x;
			initY = pos.y;
			startX = event.clientX;
			startY = event.clientY;
		}
		
	}
	else if(event.button == 1)
	{
		//middle
		//camera pan
		middleMouseDown = true;
		mouseOld.x = event.clientX;
		mouseOld.y = event.clientY;

	}
	else if(event.button == 2)
	{
		//right
		//camera rotate
		rightMouseDown = true;
		mouseOld.x = event.clientX;
		mouseOld.y = event.clientY;
	}
} 

function updateMesh ()
{
	var commitsList = checkNewCommits();

	console.log("commit: " + commitsList);
	for(var j = 0; j < commitsList.length; j++ )
	{
		arrArgs = commitsList[j];

		if(!arrArgs) {return;}

		var cmd = arrArgs[2];
		var pointArray = arrArgs[3];
		var strTransArray = arrArgs[4].split(",");
		var transformBy = new THREE.Vector3();
		transformBy.x = parseFloat(strTransArray[0]);
		transformBy.y = parseFloat(strTransArray[1]);
		transformBy.z = parseFloat(strTransArray[2]);
		var meshIndex = arrArgs[5];
		//arrArgs
		//2 == CMD
		//3 == pointArray
		//4 == Vector3 transformBy
		//5 == Mesh Index in allObjects

			console.log("CMD: " + arrArgs[2]);
			console.log("pointArray: " + arrArgs[3]);
			console.log("transformBy: " + arrArgs[4]);
			console.log("Mesh Index: " + arrArgs[5]);

		if(cmd == "TRANSLATE_POINTS")
		{
			console.log("It better get here.");
			var obj = scene.children[meshIndex];
			if(pointArray == "*")
			{
				console.log("And here.");

				console.log(obj.geometry.vertices.length);
				

				for(var i = 0; i < obj.geometry.vertices.length; i++)
				{
					obj.geometry.vertices[i].add(transformBy);
					
				}
				obj.geometry.verticesNeedUpdate = true;
			}
			else
			{
				for(var i = 0; i < pointArray.length; i++)
				{
					obj.vertices[pointArray[i]].add(transformBy);
				}
			}
		}
		else if(cmd == "SCALE_POINTS")
		{
			var avg = new THREE.Vector3(0,0,0);
			var obj = scene.children[meshIndex];
			if(pointArray == "*")
			{
				for(var i = 0; i < obj.geometry.vertices.length; i++)
				{
					avg.add(obj.geometry.vertices[i]);
				}
				avg.x /= obj.geometry.vertices[i].length;
				avg.y /= obj.geometry.vertices[i].length;
				avg.z /= obj.geometry.vertices[i].length;
				for(var i = 0; i < obj.geometry.vertices.length; i++)
				{
					obj.geometry.vertices[i].sub(avg);

					obj.geometry.vertices[i].x *= transformBy.x;
					obj.geometry.vertices[i].y *= transformBy.y;
					obj.geometry.vertices[i].z *= transformBy.z;

					obj.geometry.vertices[i].add(avg);
				}

			}
			for(var i = 0; i < pointArray.length; i++)
			{
				avg.add(obj.geometry.vertices[pointArray[i]]);
			}
			avg.x /= pointArray.length;
			avg.y /= pointArray.length;
			avg.z /= pointArray.length;
			for(var i = 0; i < pointArray.length; i++)
			{
				obj.geometry.vertices[pointArray[i]].sub(avg);

				obj.geometry.vertices[pointArray[i]].x *= transformBy.x;
				obj.geometry.vertices[pointArray[i]].y *= transformBy.y;
				obj.geometry.vertices[pointArray[i]].z *= transformBy.z;

				obj.geometry.vertices[pointArray[i]].add(avg);
			}
			obj.geometry.verticesNeedUpdate = true;
		}
		else if(cmd == "ROTATE_POINTS")
		{
			var avg = new THREE.Vector3(0,0,0);
			var obj = scene.children[meshIndex];
			if(pointArray == "*")
			{
				for(var i = 0; i < obj.geometry.vertices.length; i++)
				{
					avg.add(obj.geometry.vertices[i]);
				}
				avg.x /= obj.geometry.vertices[i].length;
				avg.y /= obj.geometry.vertices[i].length;
				avg.z /= obj.geometry.vertices[i].length;
				for(var i = 0; i < pointArray.length; i++)
				{
					obj.geometry.vertices[i].sub(avg);

					obj.geometry.vertices[i].x *= transformBy.x;
					obj.geometry.vertices[i].y *= transformBy.y;
					obj.geometry.vertices[i].z *= transformBy.z;

					obj.geometry.vertices[i].add(avg);
				}

			}			
		}

	}
	listCommits = [];
}

function onMouseUp( event )
{

	if(event.button == 0)
	{

		//reset the difference vector so we know how much changed
		if(CURRENT_MODE == modeEnum.SELECTION_MODE)
		{
			if(selectedGeometry != null)
			{
				//information packaging function
				if(CURRENT_TRANSFORM_MODE == transformModeEnum.TRANSLATE_MODE)
				{
 					translatePoints("*",differenceVector,scene.children.indexOf(selectedGeometry));
					console.log("Translating:");
					console.log(differenceVector.x);
					console.log(differenceVector.y);	
				}
				else if(CURRENT_TRANSFORM_MODE ==transformModeEnum.SCALE_MODE)
				{
					console.log("Scaling:");
					console.log(differenceVector.x);
					console.log(differenceVector.y);		
					scalePoints("*", differenceVector, scene.children.indexOf(selectedGeometry));
					
				}
				else if(CURRENT_TRANSFORM_MODE ==transformModeEnum.ROTATE_MODE)
				{
					rotatePoints("*", differenceVector, scene.children.indexOf(selectedGeometry));
					console.log("Rotating:");
					console.log(differenceVector.x);
					console.log(differenceVector.y);	
				}
			}
		}
		else if(CURRENT_MODE == modeEnum.EDIT_MODE)
		{
			if(selectedVertices.length >0)
			{
				if(CURRENT_TRANSFORM_MODE == transformModeEnum.TRANSLATE_MODE)
				{
					translatePoints(vertexindices, differenceVector, scene.children.indexOf(selectedGeometry));
				}
				else if(CURRENT_TRANSFORM_MODE == transformModeEnum.SCALE_MODE)
				{
					scalePoints(selectedVertices, differenceVector, scene.children.indexOf(selectedGeometry));
				}
				else if(CURRENT_TRANSFORM_MODE == transformModeEnum.ROTATE_MODE)
				{
					rotatePoints(selectedVertices, differenceVector, scene.children.indexOf(selectedGeometry));					
				}
			}
		}
		differenceVector.x = 0;
		differenceVector.y = 0;
		differenceVector.z = 0;
		if(CURRENT_MODE == modeEnum.SELECTION_MODE)
		{
			
			var intersects = raycaster.intersectObjects(scene.children);
			if(intersects.length > 0)
			{
				if(intersects[0].object != grid && intersects[0] != light)
				{

					if(intersects[0].object != selectedGeometry)
					{
						if(selectedGeometry != null)
						{
							selectedGeometry.material.emissive.setHex(0x999999);
						}
						selectedGeometry = intersects[0].object;
						selectedGeometry.material.emissive.setHex(0xff0000);
					}
				}
			}
		}
		else if(CURRENT_MODE == modeEnum.EDIT_MODE)
		{
			boundBox = false;
			//remove bounding box
			scene.remove( scene.getObjectByName("boundBox") );
			// var pos = getMousePos(event);
			// var endX = pos.x;
			// var endY = pos.y;
			endX = event.clientX;
			endY = event.clientY;
			//shoot two rays
			deselectMesh();
			
			
			for ( var i = 0; i < scene.children.length ; i ++ ) {
				
				var obj = scene.children[ i ];
				if ( obj !== camera && obj != light && obj != grid)
				{
					
					for( var j = 0; j < obj.geometry.vertices.length; j++ )
					{
						if(inBox(startX, startY, endX, endY, obj.geometry.vertices[j]))
						{
							if(selectedGeometry == null)
							{
								selectedVertices.push(obj.geometry.vertices[j]);
								vertexindices.push(j);
								selectedGeometry = obj;
								selectedGeometry.material.emissive.setHex(0xff0000);
							}
							else
							{
								//make sure its the same
								if(obj == selectedGeometry)
								{
									selectedVertices.push(obj.geometry.vertices[j]);
									vertexindices.push(j);
								}
							}
						}
					}
				}
			}
			//console.log(selectedVertices[0]);
			//console.log(selectedVertices[1]);
			highlightVertices();
		}
		else if(CURRENT_MODE == modeEnum.EXTRUDE_MODE)
		{
			//pick a face
			var intersects = raycaster.intersectObjects(scene.children);
			if(intersects.length > 0)
			{
				console.log("WHAT YEAR IS IT");
				selectedFace = intersects[0].face;
				
				var vertices = intersects[0].object.geometry.vertices;
				var normal = selectedFace.normal;
				normal.multiplyScalar(extrudetext.extrudeAmount);

				var endA = new THREE.Vector3();
				endA.x = vertices[selectedFace.a].x + normal.x;
				endA.y = vertices[selectedFace.a].y + normal.y;
				endA.z = vertices[selectedFace.a].z + normal.z;
				var endB = new THREE.Vector3();
				endB.x = vertices[selectedFace.b].x + normal.x;
				endB.y = vertices[selectedFace.b].y + normal.y;
				endB.z = vertices[selectedFace.b].z + normal.z;
				var endC = new THREE.Vector3();
				endC.x = vertices[selectedFace.c].x + normal.x;
				endC.y = vertices[selectedFace.c].y + normal.y;
				endC.z = vertices[selectedFace.c].z + normal.z;

				/*
				
				var geometry = new THREE.Geometry();
				
				geometry.vertices.push(
					endA,
					endB,
					endC,
					vertices[selectedFace.a],
					vertices[selectedFace.b],
					vertices[selectedFace.c]);
				
				geometry.faces.push(new THREE.Face3(0,1,2));
				geometry.faces.push(new THREE.Face3(1,0,4));
				geometry.faces.push(new THREE.Face3(4,0,3));
				geometry.faces.push(new THREE.Face3(0,2,3));
				geometry.faces.push(new THREE.Face3(3,2,5));
				geometry.faces.push(new THREE.Face3(2,1,5));
				geometry.faces.push(new THREE.Face3(5,1,4));
				var material = new THREE.MeshLambertMaterial( { color: 0x999999 } );
				material.emissive.setHex(0x999999);
				geometry.computeBoundingSphere();
				var mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);*/

				
				var material = new THREE.MeshLambertMaterial( { color: 0x999999 } );
				material.emissive.setHex(0x999999);
				var geo = new THREE.Geometry();
				
				for(var i = 0; i < intersects[0].object.geometry.vertices.length; i++)
				{
					
					var n = new THREE.Vector3();
					n.x = intersects[0].object.geometry.vertices[i].x;
					n.y = intersects[0].object.geometry.vertices[i].y;
					n.z = intersects[0].object.geometry.vertices[i].z;
					geo.vertices.push(n);
				}
				
				for(var i = 0; i < intersects[0].object.geometry.faces.length; i++)
				{
					if(intersects[0].object.geometry.faces[i] != intersects[0].face)
					{
						var n = new THREE.Face3();
						n.a = intersects[0].object.geometry.faces[i].a;
						n.b = intersects[0].object.geometry.faces[i].b;
						n.c = intersects[0].object.geometry.faces[i].c;
						n.normal = intersects[0].object.geometry.faces[i].normal;
						geo.faces.push(n);
					
					}
				}
				var len = geo.vertices.length;

				geo.vertices.push(
					endA,
					endB,
					endC,
					vertices[selectedFace.a],
					vertices[selectedFace.b],
					vertices[selectedFace.c]);

				geo.faces.push(new THREE.Face3(len,len+1,len+2));
				geo.faces.push(new THREE.Face3(len+1,len+0,len+4));
				geo.faces.push(new THREE.Face3(len+4,len+0,len+3));
				geo.faces.push(new THREE.Face3(len+0,len+2,len+3));
				geo.faces.push(new THREE.Face3(len+3,len+2,len+5));
				geo.faces.push(new THREE.Face3(len+2,len+1,len+5));
				geo.faces.push(new THREE.Face3(len+5,len+1,len+4));				
				console.log(geo.vertices.length);

				geo.computeFaceNormals();
				geo.computeVertexNormals();
				var newMesh = new THREE.Mesh(geo,material);
				//try to replace the ID here !!!!
				var index = allObjects.indexOf(intersects[0].object);

				scene.remove(intersects[0].object);
				allObjects[index] = newMesh;
				scene.add(newMesh);
			}			
		}
		leftMouseDown = false;
	}
	else if(event.button == 1)
	{
		middleMouseDown = false;
	}
	else if(event.button == 2)
	{
		rightMouseDown = false;
	}

}

function createVector(x, y, z, camera, width, height) {
	var p = new THREE.Vector3(x, y, z);
	var vector = p.project(camera);

	vector.x = (vector.x + 1) / 2 * width;
	vector.y = -(vector.y - 1) / 2 * height;

	return vector;
}

function inBox(startX, startY, endX, endY, vertex)
{
	/*
	var tmp;
	if(startX > endX) {
		tmp = startX;
		startX = endX;
		endX = tmp;
	}
	if(startY > endY) {
		tmp = startY;
		startY = endY;
		endY = tmp;
	}
	if(vertex.x > startX && vertex.x < endX) {
		if(vertex.y > startY && vertex.y < endY) {
			return true;
		}
		else {
			return false;
		}
	}
	*/
	//project vertex
	//console.log("Start X: " + startX);
	//console.log("Start Y: " + startY);
	var position = createVector(vertex.x, vertex.y, vertex.z, camera, window.innerWidth, window.innerHeight);

	if(position.x > startX && position.x < endX && position.y > startY && position.y < endY)
	{
		return true;
	}
	return false;
}

function onMouseWheel( event )
{
	var delta = 0;

	if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

		delta = event.wheelDelta;

	} else if ( event.detail !== undefined ) { // Firefox

		delta = - event.detail;

	}
	var quat = new THREE.Quaternion();
	var direction = new THREE.Vector3(0,0,-10*delta);
	quat.setFromEuler(camera.rotation);

	var endVect;
	direction.applyQuaternion(quat);
	//camera.position.z -= delta*10;
	camera.position.x = direction.x + camera.position.x;
	camera.position.y = direction.y + camera.position.y;
	camera.position.z = direction.z + camera.position.z;
}

function createBox(x,y,z,sizex,sizey,sizez)
{

	var geometry = new THREE.BoxGeometry( sizex, sizey, sizez);
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff} );
	material.emissive.setHex(0x999999);
	var object = new THREE.Mesh(geometry, material);
	object.position.x = x;
	object.position.y = y;
	object.position.z = z;
	scene.add(object);
	allObjects.push(object);
}

function createCylinder(x,y,z,sizex,sizey,sizez)
{

	var geometry = new THREE.BoxGeometry( sizex, sizey, sizez);
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff} );
	material.emissive.setHex(0x999999);
	var object = new THREE.Mesh(geometry, material);
	object.position.x = x;
	object.position.y = y;
	object.position.z = z;
	scene.add(object);
}

function init()
{
	//scene initialization code goes here
	
	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1000;
	var material = new THREE.MeshLambertMaterial( { color: 0xffffff} );
	material.emissive.setHex(0x999999);

	geometry = new THREE.BoxGeometry( 200, 200, 200 );

	
	distanceX = 0;
	distanceY = 0;
	distanceZ = 0;
	for(var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += distanceX;
		geometry.vertices[i].y += distanceY;
		geometry.vertices[i].z += distanceZ;
	}

	
	
	geometry.verticesNeedUpdate = true;

	
	var object = new THREE.Mesh( geometry, material );
	scene.add(object);
	allObjects.push(object);
	light = new THREE.PointLight(0xffffff);
	light.position.set(-100,150,100);
	scene.add(light);
	raycaster = new THREE.Raycaster();
	
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x454545 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );
	createUI();
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	//controls.addEventListener('change',render);
	
	//grid
	var size = 500, step = 50;

	var geo = new THREE.Geometry();
	var mat = new THREE.LineBasicMaterial( { color: 0xcccccc, opacity: 0.2 } );

	for ( var i = -size; i <= size; i += step ) {

		geo.vertices.push( new THREE.Vector3( -size, 0, i ) );
		geo.vertices.push( new THREE.Vector3(   size, 0, i ) );

		geo.vertices.push( new THREE.Vector3( i, 0, -size ) );
		geo.vertices.push( new THREE.Vector3( i, 0,   size ) );
	}

	grid = new THREE.Line( geo, mat, THREE.LinePieces );
	scene.add( grid );

	setInterval(function () {updateMesh()}, 1000);
}


controls.addEventListener('change', render);
function render()
{
	raycaster.setFromCamera(mouse, camera);
	requestAnimationFrame( render );
	addEventListener('mousemove', onMouseMove, false);
	addEventListener('mousedown', onMouseDown, false);
	addEventListener('mousewheel', onMouseWheel, false);
	addEventListener('DOMMouseScroll', onMouseWheel, false);
	addEventListener('mouseup',onMouseUp, false);
	var intersects = raycaster.intersectObjects(scene.children);

	var intersectedObject;
	if ( intersects.length > 0 )
	{
		intersectedObject = intersects[0].object;
		
	}

	
	renderer.render( scene, camera );
}
//get mouse position
function getMousePos ( event ) {
	//calculate position of mouse
		var vector = new THREE.Vector3();

		vector.set(
			( event.clientX / window.innerWidth ) * 2 - 1,
			- ( event.clientY / window.innerHeight ) * 2 + 1,
			0.5 );

		vector.unproject( camera );

		var dir = vector.sub( camera.position ).normalize();

		var distance = - camera.position.z / dir.z;
		
		//position under mouse
		var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
		return pos;
}
//draw bounding box
function drawBoundBox( event ) {
	
	//calculate position of mouse
	var pos = getMousePos(event);
	pos.x -= mouseOffset;
	pos.y += mouseOffset;
	
	//draw lines for box
	var mat = new THREE.LineBasicMaterial({
		color: 0x00ff00
	});
	 var geo = new THREE.Geometry();
	 
	geo.vertices.push(new THREE.Vector3(initX, initY, 0));
	geo.vertices.push(new THREE.Vector3(initX, pos.y, 0));
	geo.vertices.push(new THREE.Vector3(pos.x, pos.y, 0));
	geo.vertices.push(new THREE.Vector3(pos.x, initY, 0));
	geo.vertices.push(new THREE.Vector3(initX, initY, 0));
	
	//console.log("x " + event.clientX);
	//console.log(event.clientY);
	
	//remove bounding box before adding a new one
	scene.remove( scene.getObjectByName("boundBox") );
	
	//add bounding box to scene
	var box = new THREE.Line(geo, mat);
	box.name = "boundBox";
	scene.add(box);
}
//move all vertices
function move(distanceX,distanceY,distanceZ) {

	for(var i = 0; i < geometry.vertices.length; i++) {
		geometry.vertices[i].x += distanceX;
		geometry.vertices[i].y += distanceY;
		geometry.vertices[i].z += distanceZ;
	}
	
	//move single vertex
	//geometry.vertices[0].x += distanceX;
	//geometry.verticesNeedUpdate = true;
	//geometry.normalsNeedUpdate = true;
	
	//output vertices for testing
	for(var i = 0; i < geometry.vertices.length; i++) {
		//console.log(geometry.vertices[i]);
	}
}

//selected vertices highlighted
function highlightVertices() {

	//var selected = geometry.vertices[0];
	//keyboard handler
	// document.onkeydown = function(e) {
		// switch (e.keyCode) {
			// case 37:
				//left arrow
				
				// break;
			// case 38:
				//up arrow
				// break;
			// case 39:
				//right arrow
				// break;
			// case 40:
				//down arrow
				// break;
		// }
	// };
	//console.log
	var pGeometry = new THREE.Geometry();
    var pMaterial = new THREE.PointCloudMaterial({
      color: 0x0000ff,
      size: 40
    });
	
	for(var i = 0; i < selectedVertices.length; i++ ) {
	
		// var radius   = 100,
			// segments = 64,
			// material = new THREE.LineBasicMaterial( { color: 0x0000ff } ),
			// geometry = new THREE.CircleGeometry( radius, segments );
		pGeometry.vertices.push(selectedVertices[i]);

		// Remove center vertex
		// geometry.vertices.shift();
		// var obj = new THREE.Line( geometry, material )
		// obj.position.x = selectedVertices[i].x;
		// obj.position.y = selectedVertices[i].y;
		// obj.position.z = selectedVertices[i].z;
		// scene.add(obj  );
	}
	scene.remove( scene.getObjectByName("selected") );
	var selected = new THREE.PointCloud( pGeometry, pMaterial);
	selected.name = "selected";
	scene.add(selected);
	
}
