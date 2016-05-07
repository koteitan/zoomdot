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
  elemDebug     = document.getElementById('debug');
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

var trendR  = 40;
var trendD  = 10; //must be even
var trendSD = 40;
var invTrendSD = 1/trendSD;
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
    for(var y=0;y<wy;y+=trendD){
      for(var x=0;x<wx;x+=trendD){
        var rx0=x+trendD/2-trendR <  0? 0:x+trendD/2-trendR;
        var ry0=y+trendD/2-trendR <  0? 0:y+trendD/2-trendR;
        var rx1=x+trendD/2+trendR > wx?wx:x+trendD/2+trendR;
        var ry1=y+trendD/2+trendR > wy?wy:y+trendD/2+trendR;
        var rankRLen=Math.floor((rx1-rx0)*(ry1-ry0)*invTrendSD);
        var rankR = new Array(rankRLen);
        for(var i=0;i<rankRLen;i++) rankR[i]=0;
        var i1=0;
        var i2=0;
        for(var y2=ry0;y2<ry1;y2++){
          for(var x2=rx0;x2<rx1;x2++){
            rankR[i2] += A[y2][x2];
            i1++;
            if(i1>=trendSD){
              rankR[i2] *= invTrendSD;
              i2++;
              i1=0;
            }
          }
        }
        rankR[i2] /= i2;
        rankR.sort(function(a,b){return a>b?1:-1;});
        var medsubA = rankR[Math.floor(rankRLen/2)];
        
        var dx0=x;
        var dy0=y;
        var dx1=x+trendD > wx?wx:x+trendD;
        var dy1=y+trendD > wy?wy:y+trendD;
        for(var y2=dy0;y2<dy1;y2++){
          for(var x2=dx0;x2<dx1;x2++){
            tA[y2][x2] = medsubA;
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
  
  //IIR smoothing
  decay = 0.75;
  //x
  for(var y=0;y<wy;y++){
    var h;
    //forward
    h=A[y][0];
    for(var x=1;x<wx;x++){
      h = h*decay+(1-decay)*A[y][x];
      A[y][x]=h;
    }
    //backword
    h=A[y][wx-1];
    for(var x=wx-1;x>=0;x--){
      h = h*decay+(1-decay)*A[y][x];
      A[y][x]=h;
    }
  }
  //y
  for(var x=0;x<wx;x++){
    var h;
    //forward
    h=A[0][x];
    for(var y=1;y<wy;y++){
      h = h*decay+(1-decay)*A[y][x];
      A[y][x]=h;
    }
    //backword
    h=A[wy-1][x];
    for(var y=wy-1;y>=0;y--){
      h = h*decay+(1-decay)*A[y][x];
      A[y][x]=h;
    }
  }
  
  //noise reduction
  A=normalize(A);
  var noiseThRate = 0.01;
  var i=0;
  rankA = new Array(wx*wy);
  for(var y=0;y<wy;y++){
    for(var x=0;x<wx;x++){
      rankA[i++]=A[y][x];
    }
  }
  rankA.sort(function(a,b){return a<b?1:-1;});
  var th=rankA[Math.floor(noiseThRate*wx*wy)];
  var g = 1/(1-th);
  for(var y=0;y<wy;y++){
    for(var x=0;x<wx;x++){
      A[y][x]=A[y][x]<th ? 0:(A[y][x]-th)*g;
    }
  }
  
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