var FRIn ;
var imgIn;
var elemCanvasIn ;
var elemCanvasOut;
var elemImgOut   ;

window.onload=function(){ //entry point
  elemCanvasIn  = document.getElementById('canvasIn');
  elemCanvasOut = document.getElementById('canvasOut');
  elemImgOut    = document.getElementById('imgOut');
  document.getElementById('fileSelect').addEventListener('change', loadImg, false);
}


function loadImg(e){
	var file = e.target.files[0];
	FRIn = new FileReader();
	FRIn.onload = function(e){
		imgIn = new Image();
		imgIn.onload = function(){
		  elemCanvasIn .width  = imgIn.width; elemCanvasIn .height = imgIn.height;
		  elemCanvasOut.width  = imgIn.width; elemCanvasOut.height = imgIn.height;
		  imgOut       .width  = imgIn.width; imgOut       .height = imgIn.height;
			var ctx = elemCanvasIn.getContext('2d');
			ctx.drawImage(imgIn, 0, 0, imgIn.width, imgIn.height);
			changeGray();
			changeImg();
		}
		imgIn.src = e.target.result;
	};
	FRIn.readAsDataURL(file);
}
function changeGray(){
	var ctxA = elemCanvasIn.getContext('2d');
	var dataA = ctxA.getImageData(0, 0, imgIn.width, imgIn.height).data;
	var ctxB = elemCanvasOut.getContext('2d');
	var j = 4;
	for (y = 0; y < imgIn.height / j; y++){
		for (x = 0; x < imgIn.width / j; x++){
			var i = (x + y * imgIn.width) * 4 * j;
			ctxB.fillStyle = 'rgba(' + dataA[i] + ',' + dataA[i + 1] + ',' + dataA[i + 2] + ', 255)';
			ctxB.fillRect(x * j, y * j, j, j);
		}
	}
}
function changeImg(){
	var src = elemCanvasOut.toDataURL('image/jpg');
	elemImgOut.src = src;
}
