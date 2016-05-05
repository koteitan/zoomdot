filename='o0597039813019218534.png';
trendR   = 50;
smoothF  = [1 -0.5]';
noiseThRate = 0.01;

A = mean(imread(filename),3);
wx=size(A,1);
wy=size(A,2);
nA    = normfil(A);

% remove trend
tA = zeros(size(A));
for y=1:trendR:wy
  for x=1:trendR:wx
    x1=min(x+trendR,wx);
    y1=min(y+trendR,wy);
    subA = A(x:x1,y:y1);
    medsubA = median(reshape(subA,prod(size(subA)),1));
    tA(x:x1,y:y1) = medsubA;
  end % for x
end % for y
rtA = A-tA;

% smoothing
srtA = iir2d(1,smoothF,rtA);

% noise reduction
rankA = sort(reshape(rtA,wx*wy,1),'descend');
th = rankA(ceil(noiseThRate*wx*wy),1);
nrsrtA = normfil(max(srtA,th));

B=nrsrtA;

checked = B==0;

