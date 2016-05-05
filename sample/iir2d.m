function B=iir2d(b,a,A)
wx=size(A,1);
wy=size(A,2);
for y=1:wy
  B(:,y)=       filter(b,a,       A(:,y) );
  B(:,y)=flipud(filter(b,a,flipud(B(:,y))));
end
for x=1:wx
  B(x,:)=       filter(b,a,       B(x,:)')';
  B(x,:)=flipud(filter(b,a,flipud(B(x,:)')))';
end

