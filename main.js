var FRIn ;
var imgIn;
var elemCanvasIn ;
var elemCanvasOut;
var elemImgOut   ;

var ratio;
var colors = 4;
var wx = 320;
var wy = 240;
var wx2;
var wy2;


/*----------------------------
  window.onload(){
    loadImg(e){
      analize();
      outImg();
    }
  }
 * */
window.onload=function(){ //entry point
  elemCanvasIn  = document.getElementById('canvasIn');
  elemCanvasOut = document.getElementById('canvasOut');
  elemImgOut    = document.getElementById('imgOut');
  elemDebug     = document.getElementById('debug');
  document.getElementById('fileSelect').addEventListener('change', loadImg, false);
  changeratio();
}


function loadImg(e){
  var file = e.target.files[0];
  FRIn = new FileReader();
  FRIn.onload = function(e){
    imgIn = new Image();
    imgIn.onload = function(){
      wx=imgIn.width;
      wy=imgIn.height;
      elemCanvasIn .width  = wx;  elemCanvasIn .height = wy;
      wx2=wx*ratio;
      wy2=wy*ratio;
      elemCanvasOut.width  = wx2; elemCanvasOut.height = wy2;
      imgOut       .width  = wx2; imgOut       .height = wy2;
      elemCanvasIn .getContext('2d').drawImage(imgIn, 0, 0, wx, wy);
      analize();
      outImg();
    }
    imgIn.src = e.target.result;
  };
  FRIn.readAsDataURL(file);
}

function analize(){
  // ctx -> A
  var idIn = elemCanvasIn.getContext('2d').getImageData(0, 0, wx, wy);
  var cpaIn = idIn.data;
  var A = new Array(wy);
  for (y = 0; y < wy ; y++){
    A[y] = new Array(wx);
    for (x = 0; x < wx; x++){
      A[y][x] = new Array(colors);
      for (c = 0; c < colors; c++){
        A[y][x][c] = cpaIn[(y*wx+x)*colors+c];
      }
    }
  }
  wx2=wx*ratio;
  wy2=wy*ratio;
  // A -> ctx
  var idOut = elemCanvasOut.getContext('2d').createImageData(wx2,wy2);
  var cpaOut = idOut.data;
  for (y = 0; y < wy2 ; y++){
    for (x = 0; x < wx2; x++){
      for (c = 0; c < colors; c++){
        cpaOut[(y*wx2+x)*colors+c] = A[Math.floor(y/ratio)][Math.floor(x/ratio)][c];
      }
    }
  }
  var ctxOut = elemCanvasOut.getContext('2d');
  ctxOut.putImageData(idOut, 0, 0);
}
function outImg(){
  var src = elemCanvasOut.toDataURL('image/jpg');
  elemImgOut.src = src;
}

var changeratio = function(){
  ratio = form0.ratio.value;
  wx2 = wx*ratio;
  wy2 = wy*ratio;
  elemCanvasOut.width  = wx2; elemCanvasOut.height = wy2;
  imgOut       .width  = wx2; imgOut       .height = wy2;
};
