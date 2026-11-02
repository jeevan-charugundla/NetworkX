import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {Activity,AlertTriangle,BarChart3,CheckCircle2,FileText,Home,Link2,Network,Play,RotateCcw,Router,Unlink} from "lucide-react";
import {Background,Controls,Handle,Position,ReactFlow,type Edge,type Node} from "@xyflow/react";

const API="http://127.0.0.1:8000";
type Ev={time:string;message:string;level:string};
type S={status:string;routers:number;links:number;active_links:number;failed_links:number;nodes:Node[];edges:Edge[];original_route:string[];original_cost:number|null;current_route:string[];current_cost:number|null;route_changes:number;packet_delivery:number;average_delay_ms:number;events:Ev[]};
type TransmissionStatus="Waiting for transmission"|"Packet transmitting"|"Route recalculated"|"Packet reached R1"|"Packet reached R2"|"Packet reached R3"|"Packet delivered successfully";
type Page="dashboard"|"topology"|"simulation"|"logs"|"about";
type PacketNodeData={label:string};

const nodeTypes={packet:PacketNode};
const navItems:[[typeof Home,string,Page],[typeof Network,string,Page],[typeof Play,string,Page],[typeof FileText,string,Page],[typeof Activity,string,Page]]=[
 [Home,"Dashboard","dashboard"],[Network,"Topology","topology"],[Play,"Simulation","simulation"],[FileText,"Logs","logs"],[Activity,"About","about"]
];

function PacketNode({data}:{data:PacketNodeData}){
 return <><Handle type="target" position={Position.Top} style={{opacity:0}}/><div className="packet-node" aria-label={data.label}/><Handle type="source" position={Position.Bottom} style={{opacity:0}}/></>;
}

function pageFromPath():Page{
 const page=window.location.pathname.slice(1) as Page;
 return ["dashboard","topology","simulation","logs","about"].includes(page)?page:"dashboard";
}

function Status({value}:{value:TransmissionStatus}){
 return <div className="transmission-status" aria-live="polite"><span className={"status-dot "+(value==="Packet transmitting"?"active":value==="Packet delivered successfully"?"delivered":"")}/>{value}</div>;
}

function Flow({data,packetNode}:{data:S|null;packetNode:Node<PacketNodeData>|null}){
 return <div className="flow">{data&&<ReactFlow nodes={packetNode?[...data.nodes,packetNode]:data.nodes} edges={data.edges} nodeTypes={nodeTypes} fitView fitViewOptions={{padding:.15}} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}><Background color="#eef1f5" gap={22}/><Controls/></ReactFlow>}</div>;
}

function TopologyPanel({data,packetNode,status}:{data:S|null;packetNode:Node<PacketNodeData>|null;status:TransmissionStatus}){
 return <div className="panel topo"><h3><Network/>Network Topology <span className="legend"><i className="b"/>Active <i className="r"/>Failed <i className="g"/>Current route</span></h3><Status value={status}/><Flow data={data} packetNode={packetNode}/></div>;
}

function Stats({data}:{data:S|null}){
 return <section className="stats">{[[Router,"Routers",data?.routers,"blue"],[Link2,"Total Links",data?.links,"blue"],[CheckCircle2,"Active Links",data?.active_links,"green"],[Unlink,"Failed Links",data?.failed_links,"red"]].map(([I,l,v,c]:any)=><div className="stat" key={l}><div className={"ico "+c}><I/></div><div><small>{l}</small><strong>{v??"—"}</strong></div></div>)}</section>;
}

function Routes({data}:{data:S|null}){
 return <div className="panel routes"><h3><Network/>Routing Information</h3><div className="route original"><b>Original Route</b><span>{data?.original_route.join(" → ")||"—"}</span><strong>Cost: {data?.original_cost??"—"}</strong></div><div className="route current"><b>Current Route</b><span>{data?.current_route.join(" → ")||"No route available"}</span><strong>Cost: {data?.current_cost??"—"}</strong></div></div>;
}

function Metrics({data}:{data:S|null}){
 return <div className="panel metrics"><h3><BarChart3/>Network Metrics</h3><div className="metricrow"><div><small>Packet Delivery</small><strong className="greenText">{data?.packet_delivery??"—"}%</strong></div><div><small>Average Delay</small><strong className="blueText">{data?data.average_delay_ms+" ms":"—"}</strong></div><div><small>Route Changes</small><strong className="purpleText">{data?.route_changes??"—"}</strong></div></div><p>Illustrative simulation values, not physical network measurements.</p></div>;
}

function ControlsPanel({busy,failed,onAction}:{busy:boolean;failed:boolean;onAction:(action:string)=>void}){
 return <div className="panel controls"><h3><Play/>Simulation Controls</h3><div className="buttons"><button className="primary" disabled={busy} onClick={()=>onAction("start")}><Play size={15}/>Start</button><button className="danger" disabled={busy||failed} onClick={()=>onAction("fail-link")}><Unlink size={15}/>Fail Link (R2–R3)</button><button className="neutral" disabled={busy} onClick={()=>onAction("reset")}><RotateCcw size={15}/>Reset</button></div><p>Simulate a connection failure to trigger automatic rerouting.</p></div>;
}

function EventsPanel({data}:{data:S|null}){
 return <div className="panel events"><h3><FileText/>Network Events</h3><div className="eventlist">{data?.events.map((e,i)=><div className="event" key={i}><i className={e.level}/><time>{e.time}</time><span>{e.message}</span></div>)}</div></div>;
}

export default function App(){
 const [data,setData]=useState<S|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false),[page,setPage]=useState<Page>(pageFromPath);
 const [status,setStatus]=useState<TransmissionStatus>("Waiting for transmission"),[animation,setAnimation]=useState({segment:0,progress:0,running:false});
 const frameRef=useRef<number|null>(null),rerouteTimerRef=useRef<number|null>(null);
 const refresh=useCallback(async()=>{try{const response=await fetch(API+"/api/state");if(!response.ok)throw Error();setData(await response.json());setError("")}catch{setError("Backend not reachable. Start FastAPI, then refresh.")}},[]);
 useEffect(()=>{refresh();const onPopState=()=>setPage(pageFromPath());window.addEventListener("popstate",onPopState);return()=>window.removeEventListener("popstate",onPopState)},[refresh]);
 const navigate=useCallback((next:Page)=>{window.history.pushState({}, "", next==="dashboard"?"/":"/"+next);setPage(next)},[]);
 const stopAnimation=useCallback(()=>{if(frameRef.current!==null){cancelAnimationFrame(frameRef.current);frameRef.current=null}if(rerouteTimerRef.current!==null){window.clearTimeout(rerouteTimerRef.current);rerouteTimerRef.current=null}setAnimation({segment:0,progress:0,running:false})},[]);
 const startAnimation=useCallback(()=>{stopAnimation();setAnimation({segment:0,progress:0,running:true});setStatus("Packet transmitting")},[stopAnimation]);
 useEffect(()=>()=>{if(frameRef.current!==null)cancelAnimationFrame(frameRef.current);if(rerouteTimerRef.current!==null)window.clearTimeout(rerouteTimerRef.current)},[]);
 useEffect(()=>{
  if(!animation.running||!data?.current_route.length||data.current_route.length<2)return;
  const started=performance.now(),duration=2800;
  const tick=(now:number)=>{
   const position=Math.min((now-started)/(duration*(data.current_route.length-1)),1);
   const segment=Math.min(Math.floor(position*(data.current_route.length-1)),data.current_route.length-2);
   const progress=position*(data.current_route.length-1)-segment;
   setAnimation({segment,progress,running:position<1});
   if(position<1&&segment>0){const reached=data.current_route[segment];if(reached==="R1"||reached==="R2"||reached==="R3")setStatus(`Packet reached ${reached}`)}
   if(position<1)frameRef.current=requestAnimationFrame(tick);else{frameRef.current=null;setStatus("Packet delivered successfully")}
  };
  frameRef.current=requestAnimationFrame(tick);
  return()=>{if(frameRef.current!==null){cancelAnimationFrame(frameRef.current);frameRef.current=null}};
 },[animation.running,data?.current_route]);
 async function action(name:string){
  setBusy(true);
  try{
   const response=await fetch(API+"/api/"+name,{method:"POST"}),next=await response.json();
   if(!response.ok)throw Error(next.detail||"Action failed");
   setData(next);setError("");
   if(name==="start")startAnimation();
   if(name==="fail-link"){stopAnimation();setStatus("Route recalculated");if(next.current_route.length>1)rerouteTimerRef.current=window.setTimeout(()=>{rerouteTimerRef.current=null;startAnimation()},450)}
   if(name==="reset"){stopAnimation();setStatus("Waiting for transmission")}
  }catch(cause){setError(cause instanceof Error?cause.message:"Request failed")}finally{setBusy(false)}
 }
 const failed=data?.status==="failure";
 const packetNode=useMemo<Node<PacketNodeData>|null>(()=>{if(!data||(!animation.running&&status!=="Packet delivered successfully")||data.current_route.length<2)return null;const positions=new Map(data.nodes.map(node=>[node.id,node.position])),from=positions.get(data.current_route[animation.segment]),to=positions.get(data.current_route[animation.segment+1]);if(!from||!to)return null;const a={x:from.x+32.5,y:from.y+32.5},b={x:to.x+32.5,y:to.y+32.5};return{id:"transmission-packet",type:"packet",position:{x:a.x+(b.x-a.x)*animation.progress-15,y:a.y+(b.y-a.y)*animation.progress-15},data:{label:"Packet in transmission"},selectable:false,draggable:false}},[data,animation,status]);
 const dashboard=<><Stats data={data}/><section className="layout"><TopologyPanel data={data} packetNode={packetNode} status={status}/><div className="side"><EventsPanel data={data}/><ControlsPanel busy={busy} failed={!!failed} onAction={action}/></div></section><section className="bottom"><Routes data={data}/><Metrics data={data}/></section></>;
 const topology=<><TopologyPanel data={data} packetNode={packetNode} status={status}/><section className="bottom"><Routes data={data}/><Metrics data={data}/></section></>;
 const simulation=<section className="simulation-page"><div className="panel simulation-summary"><h2><Play/>Live Simulation</h2><Status value={status}/><ControlsPanel busy={busy} failed={!!failed} onAction={action}/><div className="simulation-details"><div><small>Current packet location</small><strong>{status==="Packet delivered successfully"?"E":status.startsWith("Packet reached")?status.replace("Packet reached ",""):"A"}</strong></div><div><small>Destination</small><strong>E</strong></div></div><Routes data={data}/></div><TopologyPanel data={data} packetNode={packetNode} status={status}/></section>;
 const logs=<div className="panel logs-page"><h2><FileText/>Network Logs</h2><div className="logs-table-wrap"><table><thead><tr><th>Timestamp</th><th>Event description</th><th>Event type</th><th>Status</th></tr></thead><tbody>{data?.events.map((event,index)=><tr key={index}><td>{event.time}</td><td>{event.message}</td><td>{event.level==="danger"?"Failure":event.level==="info"?"Routing":"Network"}</td><td><span className={"log-status "+event.level}>{event.level==="danger"?"Attention":event.level==="info"?"Processing":"Recorded"}</span></td></tr>)}</tbody></table></div></div>;
 const about=<div className="panel about-page"><h2><Activity/>About NetRescue</h2><div className="about-grid"><section><h3>Project objective</h3><p>NetRescue demonstrates how a network can detect a failed connection and automatically select a working route to keep communication available.</p><h3>Problem statement</h3><p>Manual recovery from link failures can interrupt traffic. This simulation makes detection, rerouting and packet delivery visible in one focused dashboard.</p><h3>Project scope and limitations</h3><p>This is an educational local simulation. Delay and delivery metrics are illustrative, and it does not model physical packet loss, congestion or hardware.</p></section><section><h3>Technologies used</h3><p>React, TypeScript, React Flow, FastAPI and NetworkX.</p><h3>How failure detection works</h3><p>The Fail Link action updates the backend graph, removes R2–R3 and returns the recalculated topology and route to every view.</p><h3>Dijkstra shortest path</h3><p>NetworkX calculates the minimum weighted path from A to E. Connection costs are used as edge weights so the alternative route is selected automatically.</p></section></div></div>;
 const content={dashboard,topology,simulation,logs,about}[page];
 return <div className="shell"><header><div className="brand"><Network/>NetRescue</div><div className="sub">Network Failure Detection &amp; Auto-Routing System</div><span className={"pill "+(failed?"warn":"")}>{failed?"Failure detected · rerouted":"Simulation Ready"}</span></header><aside>{navItems.map(([Icon,label,target])=><button className={"nav "+(page===target?"selected":"")} key={target} onClick={()=>navigate(target)}><Icon size={18}/>{label}</button>)}</aside><main>{error&&<div className="error"><AlertTriangle size={17}/>{error}</div>}<div className="page-heading"><small>NetRescue / {page[0].toUpperCase()+page.slice(1)}</small><h1>{page==="dashboard"?"Dashboard":page==="topology"?"Network Topology":page==="simulation"?"Simulation":page==="logs"?"Network Logs":"About NetRescue"}</h1></div>{content}<footer>NetRescue · Computer Networks Lab Project <span>Local simulation environment</span></footer></main></div>;
}
