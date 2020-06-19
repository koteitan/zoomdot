var frin ;
var imgin;
var elemcanvasin ;
var elemcanvasout;
var elemimgout   ;

var ratio;
var colors = 4;
var wxin = 320;
var wyin = 240;
var wxout;
var wyout;
var isimgloaded;

/*----------------------------
 user ->
  window.onload()   -> redraw()
  fileselect-change -> handleloadimg(e) -> redraw()
  ratio-onchange    -> redraw()

 redraw(e){
    changesize();
    if(imgloaded){
      analize();
    }
  }
 ---------------------------*/

/*user interfaces ----------------*/
window.onload=function(){ //entry point
  elemcanvasin  = document.getElementById('canvavsin');
  elemcanvasout = document.getElementById('canvasout');
  elemimgout    = document.getElementById('imgout');
  elemDebug     = document.getElementById('debug');
  document.getElementById('fileselect').addEventListener('change', handleloadimg, false);
  
  wxin=320;
  wyin=240;
  isimgloaded = false;
  handlechangeratio();
  redraw();
  drawtext(elemcanvasin , "no image");
  drawtext(elemcanvasout, "no image");
}
var handlechangeratio = function(){
  ratio = form0.ratio.value;
  redraw();
};
function handleloadimg(e){
  var file = e.target.files[0];
  frin = new FileReader();
  frin.onload = function(e){
    imgin = new Image();
    imgin.onload = function(){
      wxin=imgin.width;
      wyin=imgin.height;
      isimgloaded = true;
      redraw();
    }
    imgin.src = e.target.result;
    drawtext(elemcanvasin, "now loading...");
  };
  frin.readAsDataURL(file);
}

/* internal subroutines -------------------*/
var redraw = function(){
  changesize();
  if(isimgloaded){
    drawtext(elemcanvasout,"now loading...");
    setTimeout(analize, 0);
  }
};
var changesize = function(){
  wxout                = wxin*ratio;
  wyout                = wyin*ratio;
  elemcanvasin.width   = wxin;
  elemcanvasin.height  = wyin;
  elemcanvasout.width  = wxout;
  elemcanvasout.height = wyout;
  imgout       .width  = wxout;
  imgout       .height = wyout;
}
var analize = function(){
  // ctx -> A
  elemcanvasin.getContext('2d').drawImage(imgin, 0, 0, wxin, wyin);
  var idin = elemcanvasin.getContext('2d').getImageData(0, 0, wxin, wyin);
  var cpain = idin.data;
  var A = new Array(wyin);
  for (y = 0; y < wyin ; y++){
    A[y] = new Array(wyin);
    for (x = 0; x < wxin; x++){
      A[y][x] = new Array(colors);
      for (c = 0; c < colors; c++){
        A[y][x][c] = cpain[(y*wxin+x)*colors+c];
      }
    }
  }
  // A -> ctx
  var idout = elemcanvasout.getContext('2d').createImageData(wxout,wyout);
  var cpaout = idout.data;
  for (y = 0; y < wyout ; y++){
    for (x = 0; x < wxout; x++){
      for (c = 0; c < colors; c++){
        cpaout[(y*wxout+x)*colors+c] = A[Math.floor(y/ratio)][Math.floor(x/ratio)][c];
      }
    }
  }
  var ctxout = elemcanvasout.getContext('2d');
  ctxout.putImageData(idout, 0, 0);
  var src = elemcanvasout.toDataURL('image/jpg');
  elemimgout.src = src;
}
var drawtext = function(elem, text){
  /* get initial font size into tx,ty */
  var ctx  = elem.getContext('2d');
  var bx = ctx.canvas.width;
  var by = ctx.canvas.height;
  var ty = 10;
  ctx.font = Math.floor(ty)+"px sans-serif";
  var tx = ctx.measureText(text).width;
  /* get optimal ratio r */
  var rx = bx/tx;
  var ry = by/ty;
  var r=rx<ry?rx:ry;
  /* set optimal font size again */
  tx = tx*r;
  ty = ty*r;
  ctx.font = Math.floor(ty)+"px sans-serif";
  /* draw text */
  ctx.fillStyle='white';
  ctx.clearRect(0,0,bx,by);
  ctx.fillStyle='black';
  ctx.fillText(text,Math.floor(bx/2-tx/2),Math.floor(by/2-ty/2));
  var src = elemcanvasout.toDataURL('image/jpg');
  elemimgout.src = src;
}

