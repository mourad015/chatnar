# Synthesizes the outro sound: python3 sound.py out.wav
import numpy as np, wave, sys
sr=48000; n=sr*5; t=np.arange(n)/sr; rng=np.random.default_rng(7)
def env(a,b,c,d): # attack a->b, release c->d
    return np.clip((t-a)/(b-a),0,1)*np.clip((d-t)/(d-c),0,1)
def lp(x,cut): # one-pole low-pass, cutoff may vary over time
    a=np.exp(-2*np.pi*np.broadcast_to(cut,x.shape)/sr); y=np.zeros_like(x); s=0.0
    for i in range(len(x)): s=(1-a[i])*x[i]+a[i]*s; y[i]=s
    return y
noise=rng.standard_normal(n)
sweep=300+2600*np.clip((t-.25)/.7,0,1)**1.5
whoosh=(lp(noise,sweep)-lp(noise,120))*env(.2,.85,.95,1.6)**2*1.6
hit=np.sin(2*np.pi*(55+40*np.exp(-(t-1.2).clip(0)*25))*(t-1.2))*np.exp(-(t-1.2).clip(0)*4.5)*(t>=1.2)*.55
bell=sum(np.sin(2*np.pi*f*(t-2.2))*w for f,w in [(1318.5,1),(1975.5,.5),(2637,.25)])
bell=bell*np.exp(-(t-2.2).clip(0)*2.2)*(t>=2.2)*np.clip((t-2.2)/.01,0,1)*.07
pad=sum(np.sin(2*np.pi*f*t) for f in [220,277.18,329.63,440])*env(1.1,2.2,3.6,5.0)*.025
mix=whoosh*.35+hit+bell+pad
d=int(.012*sr); left=mix; right=np.concatenate([np.zeros(d),mix[:-d]])*.9+mix*.1  # light stereo width
st=np.stack([left,right],1); st*=np.minimum(1,(5-t)/.5)[:,None]; st=st/np.abs(st).max()*.7
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
w.writeframes((st*32767).astype('<i2').tobytes()); w.close()
