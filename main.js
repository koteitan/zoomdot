function loadImg(e){
	var file = e.target.files[0];
	var FRIn = new FileReader();
	FRIn.onload = function(e){
		var imgB = new Image();
		imgB.onload = function(){
			var ctx = document.getElementById('canvasIn').getContext('2d');
			ctx.drawImage(imgB, 0, 0, 320, 240);
			changeGray();
			changeImg();
		}
		imgB.src = e.target.result;
	};
	FRIn.readAsDataURL(file);
}
function changeGray(){
	var ctxA = document.getElementById('canvasIn').getContext('2d');
	var dataA = ctxA.getImageData(0, 0, 320, 240).data;
	var ctxB = document.getElementById('canvasOut').getContext('2d');
	var j = 4;
	for (y = 0; y < 240 / j; y++){
		for (x = 0; x < 320 / j; x++){
			var i = (x + y * 320) * 4 * j;
			ctxB.fillStyle = 'rgba(' + dataA[i] + ',' + dataA[i + 1] + ',' + dataA[i + 2] + ', 255)';
			ctxB.fillRect(x * j, y * j, j, j);
		}
	}
}
function changeImg(){
	var src = document.getElementById('canvasOut').toDataURL('image/jpg');
	document.getElementById('imgOut').src = src;
}
window.onload=function(){ //entry point
  document.getElementById('fileSelect').addEventListener('change', loadImg, false);
}
