function [B,rate]=normfil(A)
maxA=max(max(A));
minA=min(min(A));
B  = (A-minA)./(maxA-minA);
rate = 1./(maxA-minA);
