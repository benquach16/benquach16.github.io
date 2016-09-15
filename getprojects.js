


function main()
{
    var xhrRequest = new XMLHttpRequest();
    xhrRequest.open("GET");
    xhrRequest.onstatereadychange = function()
    {
	//parse the json of projects and list readmes
    }
    xhrRequest.send();
}