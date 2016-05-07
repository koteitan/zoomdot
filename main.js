var decay = 0.25;
var noiseThRate = 0.001;
var trendR  = 40;
var trendD  = 10; //must be even
var trendSD = 40;

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
  var checked = new Array(wy);
  for(var y=0;y<wy;y++){
    checked[y] = new Array(wx);
    for(var x=0;x<wx;x++){
      if(A[y][x]<th){
        A[y][x] = 0;
        checked[y][x]=1;
      }else{
        A[y][x] = (A[y][x]-th)*g;
        checked[y][x]=0;
      }
    }
  }
  for(var y=0;y<wy;y++){
    checked[y][ 0  ]=1;
    checked[y][wx-1]=1;
  }
  for(var x=0;x<wx;x++){
    checked[ 0  ][x]=1;
    checked[wy-1][x]=1;
  }
  
  //clustering
  var cx=new Array(Math.ceil(wx*wy/2));
  var cy=new Array(Math.ceil(wx*wy/2));
  var cz=new Array(Math.ceil(wx*wy/2));
  var cs=0;
  for(var y=2;y<wy-1;y++){
    for(var x=2;x<wx-1;x++){
      if(checked[y][x]==0){
        var clust = checked.clone(); //0=unknown 1=not 2=new 3=old
        clust[y][x] = 2;
        var x0 = x-1;
        var x1 = x+1;
        var y0 = y-0;
        var y1 = y+1;
        while(1){
          var renewed=0;
          for(var y2=y0;y2<=y1;y2++){
            for(var x2=x0;x2<=x1;x2++){
              if(clust[y2][x2]==2){
                clust[y2][x2]=3;
                if(clust[y2][x2-1]==0){
                  clust[y2][x2-1]=2;
                  x0=x0<x2-1?x0:x2-1;
                  renewed=1;
                }
                if(clust[y2][x2+1]==0){
                  clust[y2][x2+1]=2;
                  x1=x0>x2+1?x0:x2+1;
                  renewed=1;
                }
                if(clust[y2-1][x2]==0){
                  clust[y2-1][x2]=2;
                  y0=y0<y2-1?y0:y2-1;
                  renewed=1;
                }
                if(clust[y2+1][x2]==0){
                  clust[y2+1][x2]=2;
                  y1=y0>y2+1?y0:y2+1;
                  renewed=1;
                }
              }// if(clust[y2][x2]==2)
            }//x2
          }//y2
          if(!renewed) break;
        }//while
        //clustering is finished
        var ccn=0;
        var ccx=0;
        var ccy=0;
        var ccz=0;
        for(y2=y0;y2<=y1;y2++){
          for(x2=x0;x2<=x1;x2++){
            if(clust[y2][x2]==3){
              ccn=ccn+ 1;
              ccx=ccx+x2*A[y2][x2];
              ccy=ccy+y2*A[y2][x2];
              ccz=ccz+A[y2][x2];
              checked[y2][x2]=1;
            }
          } // for x2
        } //for y2
        cx[cs]=ccx/ccz;
        cy[cs]=ccy/ccz;
        cz[cs]=ccz;
        cs++;
      }//if
    }//for x
  }//for y
  var g=1/cz.sum();
  for(var i=0;i<cs;i++) cz[i]*=g;
  cx=cx.slice(0,cs);
  cy=cy.slice(0,cs);
  cz=cz.slice(0,cs);

  if(1){
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
  }
  var ctxOut = elemCanvasOut.getContext('2d');
//  ctxOut.putImageData(idOut, 0, 0);
  ctxOut.drawImage(imgIn, 0, 0, wx, wy);

  //draw
  var r=5;
  for(var c=0;c<cs;c++){
    ctxOut.strokeStyle = 'rgb(255,0,0)'; //cyan
    ctxOut.beginPath();
    ctxOut.moveTo(Math.floor(cx[c]-r*2),Math.floor(cy[c]));
    ctxOut.lineTo(Math.floor(cx[c]-r*1),Math.floor(cy[c]));
    ctxOut.stroke();
    ctxOut.beginPath();
    ctxOut.moveTo(Math.floor(cx[c]+r*2),Math.floor(cy[c]));
    ctxOut.lineTo(Math.floor(cx[c]+r*1),Math.floor(cy[c]));
    ctxOut.stroke();
    ctxOut.beginPath();
    ctxOut.moveTo(Math.floor(cx[c]),Math.floor(cy[c]-r*2));
    ctxOut.lineTo(Math.floor(cx[c]),Math.floor(cy[c]-r*1));
    ctxOut.stroke();
    ctxOut.beginPath();
    ctxOut.moveTo(Math.floor(cx[c]),Math.floor(cy[c]+r*2));
    ctxOut.lineTo(Math.floor(cx[c]),Math.floor(cy[c]+r*1));
    ctxOut.stroke();
  }
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
