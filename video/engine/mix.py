import sys,json,wave,numpy as np,os
vo_p,cues_p,sfx_dir,out_p,t0,t1=sys.argv[1:7]; t0=float(t0); t1=float(t1)
def rd(p):
    import subprocess
    raw=subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar","48000","-f","f32le","-"],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32).copy()
R=48000; vo=rd(vo_p); n=int((t1-t0)*R)
out=np.zeros(n,dtype=np.float32); seg=vo[int(t0*R):int(t0*R)+n]; out[:len(seg)]+=seg
cache={}; GAIN={"whoosh":0.55,"pop":0.5,"tick":0.4,"marker":0.45,"boom":0.6,"lock":0.45,"hit":0.6}
for c in json.load(open(cues_p)):
    s=cache.setdefault(c["type"],rd(os.path.join(sfx_dir,c["type"]+".wav")))
    i=int((c["t"]-t0)*R)
    if i<0 or i>=n: continue
    m=min(len(s),n-i); out[i:i+m]+=s[:m]*GAIN.get(c["type"],.5)*c.get("gain",1)
peak=np.abs(out).max(); out=out/max(1.0,peak/0.97)
w=wave.open(out_p,"wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R); w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
print("mix ok",len(json.load(open(cues_p))),"cues")
