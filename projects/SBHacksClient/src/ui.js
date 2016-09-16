

function cubePanel()
{
	this.X = 0;
	this.Y = 0;
	this.Z = 0;
	this.SizeX = 200;
	this.SizeY = 200;
	this.SizeZ = 200;
	this.Create = function(){ createBox (this.X,this.Y,this.Z,this.SizeX,this.SizeY,this.SizeZ)};
}


function cylinderPanel()
{
	this.X = 0;
	this.Y = 0;
	this.Z = 0;
	this.SizeX = 0;
	this.SizeY = 0;
	this.SizeZ = 0;
	this.Create = function(){};
}

function modePanel()
{
	this.v = 0;
}

function desc()
{
	this.Deselect =function(){
		deselectMesh();};
}

function extrudePanel()
{
	this.extrudeAmount = 20;
	this.Extrude = function() {};
	
}
var extrudetext = new extrudePanel();
function createUI()
{
	var controlsPanel = new dat.GUI();
	var commitsPanel = new dat.GUI();
	commitsPanel.domElement.id = 'gui';
	//this.viewsPanel = new dat.GUI();
	var cube = controlsPanel.addFolder('Create Cube');
	var ctext = new cubePanel();
	cube.add(ctext,'X');
	cube.add(ctext,'Y');
	cube.add(ctext,'Z');
	cube.add(ctext,'SizeX');
	cube.add(ctext,'SizeY');
	cube.add(ctext,'SizeZ');
	cube.add(ctext,'Create');
	var cylinder = controlsPanel.addFolder('Create Cylinder');
	var cyltext = new cylinderPanel();
	cylinder.add(cyltext,'X');
	cylinder.add(cyltext,'Y');
	cylinder.add(cyltext,'Z');
	cylinder.add(cyltext,'SizeX');
	cylinder.add(cyltext,'SizeY');
	cylinder.add(cyltext,'SizeZ');
	cylinder.add(cyltext,'Create');

	var extrude = controlsPanel.addFolder('Extrude Menu');

	extrude.add(extrudetext, 'extrudeAmount');
	extrude.add(extrudetext, 'Extrude');

	var modes = ['Object Mode', 'Edit Mode', 'Extrude Mode'];
	var parameters = new modePanel();
	var modelist = controlsPanel.add( parameters, 'v', modes ).name('Mode');
	modelist.onChange(function(value)
	{
		if(value == 'Object Mode')
		{
			switchMode(modeEnum.SELECTION_MODE);
		}
		else if(value == 'Edit Mode')
		{
			switchMode(modeEnum.EDIT_MODE);			
		}
		else if(value == 'Extrude Mode')
		{
			switchMode(modeEnum.EXTRUDE_MODE);
		}
		
	});
	
	var transforms = ['Translate', 'Scale', 'Rotate'];
	var transformlist = controlsPanel.add( parameters, 'v', transforms ).name('Transform');
	transformlist.onChange(function(value)
	{
		if(value == 'Translate')
		{
			switchTransformMode(transformModeEnum.TRANSLATE_MODE);
		}
		else if(value == 'Scale')
		{
			switchTransformMode(transformModeEnum.SCALE_MODE);			
		}
		else if(value == 'Rotate')
		{
			switchTransformMode(transformModeEnum.ROTATE_MODE);
		}
	});

	var axes = ['X', 'Y', 'Z'];
	var axeslist = controlsPanel.add( parameters, 'v', axes ).name('Axis');
	axeslist.onChange(function(value)
	{
		if(value == 'X')
		{
			CURRENT_AXIS = axisModeEnum.X;
		}
		else if(value == 'Y')
		{
			CURRENT_AXIS = axisModeEnum.Y;
		}
		else if(value == 'Z')
		{
			CURRENT_AXIS = axisModeEnum.Z;
		}
	});

	var tmp = new desc();
	controlsPanel.add(tmp, 'Deselect');
}


