var FRIn ;
var imgIn;
var elemCanvasIn ;
var elemCanvasOut;
var elemImgOut   ;

var wx;
var wy;

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
		  wx=imgIn.width;
		  wy=imgIn.height;
		  elemCanvasIn .width  = wx; elemCanvasIn .height = wy;
		  elemCanvasOut.width  = wx; elemCanvasOut.height = wy;
		  imgOut       .width  = wx; imgOut       .height = wy;
			elemCanvasIn .getContext('2d').drawImage(imgIn, 0, 0, wx, wy);
			analize();
			outImg();
		}
		imgIn.src = e.target.result;
	};
	FRIn.readAsDataURL(file);
}

var trendR = 100;
function analize(){
  // ctx -> make gray -> A
	var idIn = elemCanvasIn.getContext('2d').getImageData(0, 0, wx, wy);
	var cpaIn = idIn.data;
	var A = new Array(wy);
	for (y = 0; y < wy ; y++){
  	A[y] = new Array(wx);
		for (x = 0; x < wx; x++){
			var i = (x + y * wx) * 4/* RGBA */;
			A[y][x] = (cpaIn[i]+cpaIn[i+1]+cpaIn[i+2])/3*255;
		}
	}
	//remove trend
  if(trendR>0){
    var tA = new Array(wy);
    for (y = 0; y < wy ; y++) tA[y] = new Array(wx);
    for(var y=0;y<wy;y+=trendR){
      for(var x=0;x<wx;x+=trendR){
        var ex=wx-x<trendR?wx-x:trendR;
        var ey=wy-y<trendR?wy-y:trendR;
        var exy=ex*ey;
        var rankR = new Array(exy);
        var i=0;
        for(var dy=0;dy<ey;dy++){
          for(var dx=0;dx<ex;dx++){
            rankR[i]=A[y+dy][x+dx];
            i++;
          }
        }
        rankR.sort();
        var medsubA = rankR[Math.floor(exy/2)];
        for(var dy=0;dy<ey;dy++){
          for(var dx=0;dx<ex;dx++){
            tA[y+dy][x+dx] = medsubA;
          }
        }
      }//x
    }//y
    for(var y=0;y<wy;y++){
      for(var x=0;x<wx;x++){
        A[y][x]=A[y][x]-tA[y][x];
      }
    }
	}
	A=normalize(A);
	
  // A -> ctx
	var idOut = elemCanvasOut.getContext('2d').createImageData(wx,wy);
	var cpaOut = idOut.data;
	for (y = 0; y < wy ; y++){
		for (x = 0; x < wx; x++){
			var i = (x + y * wx) * 4/* RGBA */;
			var a = Math.floor(A[y][x]*255);
			cpaOut[i+0] = a;
			cpaOut[i+1] = a;
			cpaOut[i+2] = a;
			cpaOut[i+3] = 255;/*A=255*/
		}
	}
	elemCanvasOut.getContext('2d').putImageData(idOut, 0, 0);
}
function outImg(){
	var src = elemCanvasOut.toDataURL('image/jpg');
	elemImgOut.src = src;
}

var normalize = function(A){
	var wy = A.length;
	var wx = A[0].length;
	var maxA = A[0][0];
	var minA = A[0][0];
	for (y = 0; y < wy ; y++){
	  for (x = 0; x < wx; x++){
	    var a=A[y][x];
	    if     (a>maxA) maxA=a;
	    else if(a<minA) minA=a;
	  }
	}
	var g=1/(maxA-minA);
	var B=new Array(wy);
	for (y = 0; y < wy ; y++){
	  B[y]=new Array(wx);
	  for (x = 0; x < wx; x++){
	    B[y][x]=(A[y][x]-minA)*g;
	  }
	}
	return B;
}