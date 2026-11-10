# Mixes the voice-over with an original score + UI sound design. python3 soundtrack.py voice.wav out_mix.wav out_music.wav
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
sr=48000; DUR=43.0; OFF=.5; n=int(sr*DUR); t=np.arange(n)/sr; R=np.random.default_rng(3)
lp=lambda x,f,o=2: sosfilt(butter(o,f,'low',fs=sr,output='sos'),x)
hp=lambda x,f,o=2: sosfilt(butter(o,f,'high',fs=sr,output='sos'),x)
bp=lambda x,a,b,o=2: sosfilt(butter(o,[a,b],'band',fs=sr,output='sos'),x)
mid=lambda m:440*2**((m-69)/12)
def place(buf,s,at,g=1):
    i=int(at*sr)
    if i<0: s=s[-i:]; i=0
    m=min(len(s),n-i)
    if m>0: buf[i:i+m]+=s[:m]*g
def env(d,a=.005,r=1.0):
    tt=np.arange(int(d*sr))/sr; return np.minimum(1,tt/a)*np.exp(-tt/r)
def piano(m,d=2.5,v=1):  # soft felt-piano-like tone
    f=mid(m); tt=np.arange(int(d*sr))/sr
    x=sum(np.sin(2*np.pi*f*k*tt*(1+.0004*k*k))*(.6**(k-1)) for k in range(1,6))
    return lp(x*env(d,.006,.55+.4*(60/m)),3500)*v
def pad(ms,d,cut=1200,att=1.2):
    tt=np.arange(int(d*sr))/sr; x=0
    for m in ms:
        for det in (-.003,0,.003): x=x+2*((tt*mid(m)*(1+det))%1)-1
    a=np.minimum(1,tt/att)*np.minimum(1,(d-tt)/min(1.5,d/2)); return lp(x,cut,2)*a/len(ms)/3
def kick(): tt=np.arange(int(.4*sr))/sr; return np.sin(2*np.pi*np.cumsum(42+90*np.exp(-tt*30))/sr)*np.exp(-tt*9)
def tick(f=2400,d=.06): tt=np.arange(int(d*sr))/sr; return np.sin(2*np.pi*f*tt)*np.exp(-tt*80)
def pop(): tt=np.arange(int(.12*sr))/sr; return np.sin(2*np.pi*np.cumsum(500+900*np.exp(-tt*40))/sr)*np.exp(-tt*35)
def whoosh(d=.7): m=int(d*sr); s=np.linspace(0,1,m); x=R.standard_normal(m); return (bp(x,250,1200)*(1-s)+bp(x,1500,7000)*s)*np.sin(np.pi*s)**2
def riser(d): m=int(d*sr); s=np.linspace(0,1,m); return hp(R.standard_normal(m),1500)*s**3*.7+np.sin(2*np.pi*np.cumsum(150+900*s**2)/sr)*s**2*.25
def impact(d=3): tt=np.arange(int(d*sr))/sr; return np.sin(2*np.pi*np.cumsum(36+50*np.exp(-tt*5))/sr)*np.exp(-tt*1.6)+lp(R.standard_normal(len(tt)),400)*np.exp(-tt*7)*.5
def shimmer(d=1.5):
    tt=np.arange(int(d*sr))/sr; x=sum(np.sin(2*np.pi*mid(m)*tt) for m in [84,88,91,96]); return x*np.minimum(1,tt/.4)*np.exp(-tt*2)/4
V=lambda s:s+OFF  # voice time -> video time
mus=np.zeros(n); sfx=np.zeros(n)
# Act 1: problem — dark, sparse (A minor)
place(mus,pad([45,52,57,60],15.6,700,2.5),0,.9)
for i,m in enumerate([69,72,76,72,69,74,72,67,69,72,76,79,77,76]): place(mus,piano(m,2.5,.32),.6+i*1.0)
for b in np.arange(V(5.9),V(13.4),1.0): place(mus,lp(kick(),120),b,.35)  # heartbeat pulse
place(sfx,whoosh(.6),V(5.5),.35)
for s_ in [7.8,9.53,10.17]: place(sfx,pop(),V(s_),.25)
for s_ in [11.8,12.45,13.0]: place(sfx,tick(1800,.08),V(s_),.18); place(sfx,tick(1350,.08),V(s_)+.07,.14)
place(sfx,riser(1.4),V(13.25),.35); place(sfx,impact(),V(14.61),.6)
# Act 2: Mourad × Novary — lift, then a light 120 BPM groove (C G Am F)
place(sfx,shimmer(),V(15.85),.5); place(sfx,whoosh(.8),V(15.5),.4)
prog_=[[48,55,60,64],[43,50,55,59],[45,52,57,60],[41,48,53,57]]
start=V(16.95); bars=int((V(32.2)-start)/2)+1
for b in range(bars):
    t0=start+b*2; ch=prog_[b%4]
    place(mus,pad([c+12 for c in ch],2.05,1500,.3),t0,.8)
    for k in range(8):
        tb=t0+k*.25
        if tb<V(32.2): place(mus,piano(ch[(k%3)+1]+12+(12 if k%4==3 else 0),.6,.17),tb)
    for k in range(4):
        tb=t0+k*.5
        if tb<V(32.2): place(mus,kick(),tb,.42); place(mus,hp(R.standard_normal(int(.05*sr)),7000)*np.exp(-np.arange(int(.05*sr))/sr*80),tb+.25,.07)
for s_ in [19.85,21.66,23.21,25.1]: place(sfx,whoosh(.45),V(s_)-.25,.25); place(sfx,pop(),V(s_)+.2,.22)
for s_ in [28.14,28.94,30.43]: place(sfx,piano(84,1.5,.35),V(s_))
# the silent moment
place(sfx,impact(4),V(32.74),.35); place(mus,pad([45,57,64],3.0,900,.8),V(32.74),.7)
# Act 3: CTA — warm and open
place(mus,pad([48,55,64,67],6.5,1300,.8),V(34.4),.9)
for i,m in enumerate([72,76,79,84,79,76,74,79]): place(mus,piano(m,2,.25),V(34.6)+i*.6)
place(sfx,whoosh(.4),V(35.8),.3); place(sfx,pop(),V(36.0),.3)
for k in range(5): place(sfx,tick(2000,.03),V(36.7)+k*.16,.06)
place(sfx,pop(),V(37.5),.28)
place(sfx,riser(.9),V(39.4),.3)
# Novary logo
place(sfx,impact(3),V(40.24),.65); place(sfx,shimmer(2.5),V(40.24),.55)
place(mus,pad([48,55,60,64,71],DUR-V(40.24),1800,.2),V(40.24),1.0)
for m in [60,64,67,72]: place(mus,piano(m,3,.3),V(40.3))
# voice
w=wave.open(sys.argv[1]); vr=w.getframerate(); v=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768
if w.getnchannels()==2: v=v.reshape(-1,2).mean(1)
v=resample_poly(v,sr,vr); v=hp(v,80,3)
e=np.sqrt(np.maximum(lp(v**2,8),0)+1e-9); thr=np.percentile(e,80)*.6; g=np.where(e>thr,(thr/e)**(1-1/3),1); v=v*lp(g,20)  # 3:1 compression
voice=np.zeros(n); place(voice,v,OFF); voice/=np.abs(voice).max()+1e-9
# duck music under the voice
ve=lp(np.abs(voice),6); duck=1-.65*np.clip(ve/(np.percentile(ve,90)+1e-9),0,1)
def verb(x,dec=2.0,mix=.3):
    m=int(dec*sr); ir=lp(R.standard_normal(m)*np.exp(-np.arange(m)/sr*(6/dec)),5000); return x+fftconvolve(x,ir)[:n]/np.abs(ir).sum()*40*mix
mus=verb(mus,2.4,.35); sfx=verb(sfx,1.5,.25)
music=(mus*.55*duck+sfx*.6)
music*=np.clip(t/.4,0,1)*np.clip((DUR-t)/1.2,0,1)
mix=voice*1.0+music*.3
def save(x,fn):
    x=np.tanh(x*1.1); x=x/np.abs(x).max()*.89
    d=int(.008*sr); st=np.stack([x,np.concatenate([np.zeros(d),x[:-d]])*.2+x*.8],1)
    ww=wave.open(fn,'wb'); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(sr); ww.writeframes((st*32767).astype('<i2').tobytes()); ww.close()
save(mix,sys.argv[2]); save(music,sys.argv[3])
