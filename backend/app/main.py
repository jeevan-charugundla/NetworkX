from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import networkx as nx
from datetime import datetime

app=FastAPI(title="NetRescue API")
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:5173"],allow_methods=["*"],allow_headers=["*"])
LINKS=[("A","R1",2),("R1","R2",2),("R2","R3",1),("R3","E",3),("R1","R4",2),("R4","R5",1),("R5","R3",1)]
FAIL=("R2","R3")

def graph(failed):
    g=nx.Graph()
    g.add_weighted_edges_from(LINKS)
    if failed and g.has_edge(*FAIL): g.remove_edge(*FAIL)
    return g

def route(g):
    try:
        p=nx.shortest_path(g,"A","E",weight="weight")
        return p,nx.shortest_path_length(g,"A","E",weight="weight")
    except nx.NetworkXNoPath: return [],None

def event(msg,level="success"):
    app.state.events.insert(0,{"time":datetime.now().strftime("%H:%M:%S"),"message":msg,"level":level})

def state():
    failed=app.state.failed
    g=graph(failed); path,cost=route(g)
    original,original_cost=route(graph(False))
    nodes=[
      ("A",40,230,"computer"),("R1",230,230,"router"),("R2",410,75,"router"),
      ("R3",650,75,"router"),("R4",410,390,"router"),("R5",650,390,"router"),("E",850,230,"computer")]
    ns=[{"id":n,"position":{"x":x,"y":y},"data":{"label":n,"kind":kind}} for n,x,y,kind in nodes]
    es=[]
    for a,b,w in LINKS:
      down=failed and {a,b}==set(FAIL)
      active=any({path[i],path[i+1]}=={a,b} for i in range(len(path)-1))
      es.append({"id":f"{a}-{b}","source":a,"target":b,"label":str(w),"type":"smoothstep",
       "animated":bool(active and not down),"style":{"stroke":"#DC2626" if down else ("#16A34A" if active else "#2563EB"),"strokeWidth":3 if active or down else 2,"strokeDasharray":"8 6" if down else "0"},
       "labelStyle":{"fill":"#111827","fontWeight":700},"labelBgStyle":{"fill":"#fff","fillOpacity":1}})
    return {"status":"failure" if failed else "healthy","routers":5,"links":7,"active_links":6 if failed else 7,
      "failed_links":1 if failed else 0,"nodes":ns,"edges":es,"original_route":original,"original_cost":original_cost,
      "current_route":path,"current_cost":cost,"route_changes":1 if failed and path else 0,
      "packet_delivery":100 if path else 0,"average_delay_ms":12 if path else 0,"events":app.state.events}

@app.on_event("startup")
def init():
    app.state.failed=False; app.state.events=[]
    event("Network topology initialized")
    event("Shortest route calculated: A → R1 → R2 → R3 → E (Cost: 8)")

@app.get("/api/health")
def health(): return {"ok":True}
@app.get("/api/state")
def get_state(): return state()
@app.post("/api/start")
def start():
    event("Simulation started: packets sent from A to E")
    return state()
@app.post("/api/fail-link")
def fail():
    if not app.state.failed:
      app.state.failed=True
      event("Failure detected on link: R2 – R3","danger")
      event("Recalculating alternative route...","info")
      s=state()
      event(f"New route: {' → '.join(s['current_route'])} (Cost: {s['current_cost']})")
      event("Network communication restored")
    return state()
@app.post("/api/reset")
def reset():
    app.state.failed=False; app.state.events=[]
    event("Network topology reset")
    event("Shortest route calculated: A → R1 → R2 → R3 → E (Cost: 8)")
    return state()
