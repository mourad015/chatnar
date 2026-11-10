# Synthesizes the 40s promo soundtrack (120 BPM, A minor). python3 music.py out.wav
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
sr=48000; D=40; n=sr*D; t=np.arange(n)/sr; rng=np.random.default_rng(11)
BEAT=.5; BAR=2.0
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=sr,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=sr,output='sos'),x)
def bp(x,a,b,o=2): return sosfilt(butter(o,[a,b],'band',fs=sr,output='sos'),x)
def place(buf,snd,at,g=1):
    i=int(at*sr); 
    if i>=n: return
    m=min(len(snd),n-i); buf[i:i+m]+=snd[:m]*g
def saw(f,dur,det=0):
    tt=np.arange(int(dur*sr))/sr; return 2*((tt*f*(1+det))%1)-1
mid=lambda m:440*2**((m-69)/12)
# --- one-shots
kt=np.arange(int(.45*sr))/sr; kick=np.sin(2*np.pi*np.cumsum(45+110*np.exp(-kt*28))/sr)*np.exp(-kt*7.5); kick+=0.3*np.exp(-kt*300)*rng.standard_normal(len(kt))*0.2
ht=np.arange(int(.06*sr))/sr; hat=hp(rng.standard_normal(len(ht)),7000)*np.exp(-ht*70)
ct=np.arange(int(.25*sr))/sr; clap=bp(rng.standard_normal(len(ct)),900,2600)*(np.exp(-ct*30)+.6*np.exp(-np.maximum(ct-.012,0)*30)*(ct>.012))
it=np.arange(int(2.5*sr))/sr; impact=np.sin(2*np.pi*np.cumsum(38+60*np.exp(-it*6))/sr)*np.exp(-it*2.2)+lp(rng.standard_normal(len(it)),500)*np.exp(-it*6)*.6
def whoosh(dur=.8):
    m=int(dur*sr); x=rng.standard_normal(m); env=np.sin(np.pi*np.linspace(0,1,m))**2
    lo=bp(x,300,1200); hi=bp(x,1500,6000); s=np.linspace(0,1,m); return (lo*(1-s)+hi*s)*env
def riser(dur=2.0):
    m=int(dur*sr); s=np.linspace(0,1,m); x=hp(rng.standard_normal(m),2000)*s**3
    tone=np.sin(2*np.pi*np.cumsum(200+1200*s**2)/sr)*s**2*.3; return x*.6+tone
# --- buses
drums=np.zeros(n); bass=np.zeros(n); pad=np.zeros(n); fx=np.zeros(n); stab=np.zeros(n)
chords=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]  # Am F C G
roots=[45,41,36,43]
side=np.ones(n)  # sidechain envelope
def duck(at,depth=.6):
    i=int(at*sr); m=min(int(.35*sr),n-i); 
    if m>0: side[i:i+m]=np.minimum(side[i:i+m],1-depth*np.exp(-np.arange(m)/sr*12))
for bar in range(20):
    b0=bar*BAR; ch=chords[bar%4]
    groove = 2<=bar<16; recap=16<=bar<18
    # pad (whole song, softer in intro)
    for m_ in ch:
        for det in (-.004,.004):
            v=lp(saw(mid(m_),BAR,det),1400 if bar>=2 else 700); a=np.minimum(1,np.arange(len(v))/sr/.08)
            place(pad,v*a,b0,.05 if bar>=2 else .035)
    for beat in range(4):
        tb=b0+beat*BEAT
        if groove or (recap and beat in (0,2)): place(drums,kick,tb,.9); duck(tb)
        if bar>=1 and bar<18: place(drums,hat,tb+BEAT/2,.18 if groove or recap else .1)
        if groove and bar>=4 and beat in (1,3): place(drums,clap,tb,.35)
        if groove and bar>=4:
            for e in (0,1):  # 8th-note bass
                bt=tb+e*BEAT/2; m=int(.22*sr); v=lp(saw(mid(roots[bar%4]),.22),380)*np.exp(-np.arange(m)/sr*6); place(bass,v,bt,.32)
        if groove and bar>=6: place(drums,hat,tb+BEAT*.75,.07)
# recap stabs on each word (32, 32.75, 33.5, 34.25) and the "all in one" line at 35
for i,at in enumerate([32,32.75,33.5,34.25,35.0]):
    for m_ in chords[i%4]:
        v=lp(saw(mid(m_+12),.6),2500)*np.exp(-np.arange(int(.6*sr))/sr*7); place(stab,v,at,.09)
    place(drums,kick,at,.8); duck(at,.7)
# transitions
place(fx,riser(2.0),2.0,.35); place(fx,impact,4.0,.55)
for at in (8,14,20,26): place(fx,whoosh(.8),at-.45,.5)
place(fx,impact,8.0,.25); place(fx,riser(1.5),30.5,.3); place(fx,impact,32.0,.5)
place(fx,whoosh(.9),35.55,.5); place(fx,impact,36.0,.6)
# end: long chord ring
for m_ in [57,60,64,69]:
    v=lp(saw(mid(m_),4.0,.003),1800)*np.exp(-np.arange(4*sr)/sr*.9); place(pad,v,36.0,.07)
def verb(x,dec=1.6,mix=.25):
    m=int(dec*sr); ir=rng.standard_normal(m)*np.exp(-np.arange(m)/sr*(6/dec)); ir=lp(ir,5000); w=fftconvolve(x,ir)[:n]; return x+w/np.abs(ir).sum()*40*mix
pad=verb(pad*side,2.2,.35); stab=verb(stab,1.4,.4); bass=bass*side; drums_v=drums+verb(np.zeros(n)+lp(drums,6000)*0,1,0)
mix=drums+bass+pad+stab+fx
mix=np.tanh(mix*1.3)/np.tanh(1.3)
fade=np.clip((D-t)/1.0,0,1); fin=np.clip(t/.15,0,1); mix*=fade*fin
d=int(.009*sr); L=mix; R=np.concatenate([np.zeros(d),mix[:-d]])*.25+mix*.75
st=np.stack([L,R],1); st=st/np.abs(st).max()*.89
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
