# Voice-over + sound design only (no music). python3 soundtrack.py voice.wav out_mix.wav out_sfx.wav
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
sr=48000; DUR=44.5; OFF=.5; n=int(sr*DUR); t=np.arange(n)/sr; R=np.random.default_rng(5)
lp=lambda x,f,o=2: sosfilt(butter(o,f,'low',fs=sr,output='sos'),x)
hp=lambda x,f,o=2: sosfilt(butter(o,f,'high',fs=sr,output='sos'),x)
bp=lambda x,a,b,o=2: sosfilt(butter(o,[a,min(b,23000)],'band',fs=sr,output='sos'),x)
BUS=np.zeros((n,2))
def place(s,at,g=1,pan=0,pan1=None):
    at+=OFF; i=int(at*sr)
    if i<0: s=s[-i:]; i=0
    m=min(len(s),n-i)
    if m<=0: return
    p=np.linspace(pan,pan if pan1 is None else pan1,m); th=(p+1)*np.pi/4
    BUS[i:i+m,0]+=s[:m]*g*np.cos(th)*1.2; BUS[i:i+m,1]+=s[:m]*g*np.sin(th)*1.2
tt_=lambda d: np.arange(int(d*sr))/sr
def sweep(d,f0,f1,shape='hill',bw=.55):   # noise whoosh whose tone glides from f0 to f1
    m=int(d*sr); s=np.linspace(0,1,m); f=f0*(f1/f0)**s; x=R.standard_normal(m); out=np.zeros(m)
    for fc in np.geomspace(120,11000,12):
        w=np.exp(-(np.log2(f/fc))**2/(2*bw*bw)); out+=bp(x,fc/1.25,fc*1.25)*w
    e={'hill':np.sin(np.pi*s)**1.6,'rise':s**2.6*np.minimum(1,(1-s)/.04),'fall':(1-s)**2*np.minimum(1,s/.03)}[shape]
    return out*e
def blip(f0,f1=None,d=.12,dec=28,h=.2):
    x=tt_(d); f=np.geomspace(f0,f1 or f0,len(x)); ph=2*np.pi*np.cumsum(f)/sr
    return (np.sin(ph)+h*np.sin(2*ph))*np.minimum(1,x/.004)*np.exp(-x*dec)
def pop(f=420): x=tt_(.09); return np.sin(2*np.pi*np.cumsum(f*(1+1.2*np.exp(-x*60)))/sr)*np.exp(-x*45)
def click(): x=tt_(.02); return hp(R.standard_normal(len(x)),2500)*np.exp(-x*400)*.7+np.sin(2*np.pi*3200*x)*np.exp(-x*300)*.3
def thud(f=70,d=.6): x=tt_(d); return np.sin(2*np.pi*np.cumsum(f*(1+1.5*np.exp(-x*25)))/sr)*np.exp(-x*7)+lp(R.standard_normal(len(x)),180)*np.exp(-x*18)*.6
def boom(d=3.8): x=tt_(d); return np.sin(2*np.pi*np.cumsum(34+45*np.exp(-x*4))/sr)*np.exp(-x*1.3)+lp(R.standard_normal(len(x)),260)*np.exp(-x*5)*.7+bp(R.standard_normal(len(x)),300,900)*np.exp(-x*22)*.25
def shimmer(d=2.0,base=2300):
    x=tt_(d); out=np.zeros(len(x))
    for k in range(9):
        f=base*(1+k*.37+R.random()*.05); out+=np.sin(2*np.pi*f*x+R.random()*6)*(.5+.5*np.sin(2*np.pi*(3+R.random()*5)*x+R.random()*6))/(1+k*.35)
    out=out/5+hp(R.standard_normal(len(x)),7000)*.12
    return out*np.minimum(1,x/(d*.18))*np.exp(-x*(3.2/d))
def ding(f,d=1.2): x=tt_(d); return np.sin(2*np.pi*f*x+1.6*np.exp(-x*9)*np.sin(2*np.pi*f*2.76*x))*np.minimum(1,x/.003)*np.exp(-x*4.5)
def riser(d): return sweep(d,250,7000,'rise')+np.sin(2*np.pi*np.cumsum(np.geomspace(120,900,int(d*sr)))/sr)*np.linspace(0,1,int(d*sr))**3*.25
# ---------------- cue sheet (times = voice time, seconds) ----------------
place(sweep(.9,300,2600,'rise'),-.45,.22)
for s in [.22,2.37,5.86,7.76,11.62,16.95,19.85,21.66,23.21,25.1,36.85]: place(sweep(.28,1800,5200),s-.1,.07,R.uniform(-.3,.3))
place(thud(60,.9),4.07,.4); place(shimmer(1.6,2600),4.1,.22)                                   # "kifech tben"
place(sweep(.75,180,2200),5.4,.38,-.2,.2); place(thud(80,.4),6.15,.2)                          # phone rises
place(sweep(.5,3200,700),7.45,.14)                                                             # blur lifts
for s,pn in [(7.8,-.55),(9.53,.55),(10.17,-.55)]: place(blip(520,470,.11),s,.26,pn); place(blip(390,345,.14),s+.09,.26,pn)   # "missing" tags
for i in range(9): place(blip(R.uniform(500,2400),None,.035,90,.5),9.5+i*.055+R.uniform(0,.02),.09,R.uniform(-.7,.7))        # style chaos
place(blip(520,110,.7,5),10.2,.16)                                                             # presence powers down
for s in [11.8,12.45,13.0]: place(ding(880,.9),s,.2,.1); place(ding(1175,.9),s+.09,.2,.1); place(sweep(.35,2400,500,'fall'),s+.55,.12,.1,.6)  # missed notifications
place(riser(1.25),13.35,.32); place(boom(3.2),14.61,.55); place(sweep(.42,400,7000),14.62,.3,-.6,.6)                        # Mourad logo
place(sweep(1.25,140,5200),15.45,.5,-.9,.9); place(boom(3.5),15.95,.5); place(shimmer(2.2,2200),16.0,.36); place(shimmer(.9,4200),16.5,.2)  # Novary world
place(sweep(.65,200,2400),16.85,.3); place(thud(80,.4),17.55,.16)
for i in range(22): place(click(),17.25+i*.09,.05,R.uniform(-.25,.25))                         # outline drawing
for k,s in enumerate([19.85,21.66,23.21,25.1]):
    tr=[1,1.122,1.26,1.498][k]; place(sweep(.36,600,4200),s-.22,.22,-.4,.4); place(blip(660*tr,None,.1),s+.08,.2); place(blip(990*tr,None,.16,18),s+.17,.2)
for i in range(4): place(pop(500+i*90),20.18+i*.07,.16,.5)                                     # palette chips
place(sweep(.3,900,2600),21.8,.12,-.6); [place(click(),21.95+i*.075,.07,-.5) for i in range(10)]   # timeline scrub
[place(click(),23.42+i*.072,.07,.3) for i in range(12)]; place(shimmer(1.5,3000),23.35,.2,.2)   # prompt typing + AI resolve
for i in range(8): place(blip(R.uniform(1800,4200),None,.03,110,.3),23.6+i*.11,.06,R.uniform(-.6,.6))
for i,f in enumerate([700,790,880,1050,1180,1320,1570,1760]): place(blip(f,None,.14,20),25.32+i*.085,.1,R.uniform(-.8,.8))  # audience connects
place(ding(1568,1.0),26.7,.14); place(sweep(.5,2400,300,'fall'),27.25,.24)
for s,f,pn in [(28.14,523,.5),(28.94,659,0),(30.43,784,-.5)]: place(thud(75,.45),s,.22,pn); place(ding(f,1.4),s+.02,.24,pn); place(sweep(.5,900,3200),s,.09,pn)
place(sweep(.55,500,2200),28.4,.08,.5,0); place(sweep(.6,500,2200),29.85,.08,0,-.5)
place(sweep(.5,3000,300,'fall'),32.15,.22); place(boom(4.2),32.74,.5); place(sweep(.6,1500,4500),33.35,.07)                 # the quiet line
place(pop(520),34.52,.2); place(blip(880,990,.12),34.56,.16)
place(sweep(.5,300,2600),35.5,.24); place(blip(380,1250,.2,14),35.88,.3,.4); place(click(),36.5,.08,.4)                     # chat: send
for i in range(6): place(pop(300),36.68+i*.13,.06,-.4)                                         # typing
place(blip(1175,None,.14,16),37.5,.24,-.4); place(blip(1568,None,.24,10),37.6,.24,-.4)         # reply
place(riser(1.0),39.3,.32); place(boom(4.2),40.24,.7); place(sweep(.5,300,8000),40.2,.34,-.7,.7); place(shimmer(3.2,2100),40.3,.45)   # Novary logo
place(shimmer(1.0,4600),40.85,.28); place(sweep(.8,2200,9000),40.8,.1,-.5,.5)                  # glint
place(sweep(.45,500,4500),41.3,.18,-.4,.4); place(thud(85,.4),41.45,.16); place(ding(784,1.6),41.9,.12)   # Mourad logo
# ---------------- reverb, voice, mix ----------------
def verb(x,dec,seed):
    r=np.random.default_rng(seed); m=int(dec*sr); ir=lp(r.standard_normal(m)*np.exp(-np.arange(m)/sr*(6/dec)),6000); return fftconvolve(x,ir)[:n]/np.abs(ir).sum()*45
sfx=BUS+.2*np.stack([verb(BUS[:,0],1.7,1),verb(BUS[:,1],1.7,2)],1)
w=wave.open(sys.argv[1]); vr=w.getframerate(); v=np.frombuffer(w.readframes(w.getnframes()),'<i2').astype(float)/32768
if w.getnchannels()==2: v=v.reshape(-1,2).mean(1)
v=hp(resample_poly(v,sr,vr),80,3)
e=np.sqrt(np.maximum(lp(v**2,8),0)+1e-9); thr=np.percentile(e,80)*.6; v=v*lp(np.where(e>thr,(thr/e)**(1-1/3),1),20)   # 3:1 compression
voice=np.zeros(n); i0=int(OFF*sr); voice[i0:i0+len(v)]=v[:n-i0]; voice/=np.abs(voice).max()+1e-9
ve=lp(np.abs(voice),6); duck=1-.5*np.clip(ve/(np.percentile(ve,90)+1e-9),0,1)
fade=(np.clip(t/.3,0,1)*np.clip((DUR-t)/1.0,0,1))[:,None]
sfx=sfx*fade; mix=voice[:,None]+sfx*duck[:,None]*.62
def save(x,fn):
    x=np.tanh(x*1.05); x=x/np.abs(x).max()*.89
    ww=wave.open(fn,'wb'); ww.setnchannels(2); ww.setsampwidth(2); ww.setframerate(sr); ww.writeframes((x*32767).astype('<i2').tobytes()); ww.close()
save(mix,sys.argv[2]); save(sfx,sys.argv[3])
vs=ve>.05; print('voice dB',round(20*np.log10(np.sqrt((voice[vs]**2).mean())),1),'sfx under voice dB',round(20*np.log10(np.sqrt(((sfx*duck[:,None]*.62)[vs]**2).mean())),1),'sfx in gaps dB',round(20*np.log10(np.sqrt(((sfx*.62)[~vs]**2).mean())),1),'nan',np.isnan(mix).any())
