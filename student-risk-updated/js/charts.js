const palette = {Low:"#398c72",Medium:"#c28a2d",High:"#bd6663",blue:"#4f83bf",grid:"#e8edf2",text:"#8290a1"};
const NS = "http://www.w3.org/2000/svg";
function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}
function baseSvg(label, desc, viewBox = "0 0 600 230") {
  const svg = el("svg", {viewBox, role:"img", "aria-label":label, focusable:"false"});
  const title = el("title"); title.textContent = label;
  const description = el("desc"); description.textContent = desc;
  svg.append(title, description);
  return svg;
}
export function riskDistributionChart(rows, target = "risk-distribution-chart") {
  const root = document.getElementById(target); if (!root) return;
  root.replaceChildren();
  const svg = baseSvg("Illustrative students by review band", "Bar chart showing the count of synthetic students in low, medium, and high review bands.");
  const bands = ["Low","Medium","High"];
  const counts = bands.map(b => rows.filter(s => s.risk === b).length);
  const max = Math.max(1, ...counts);
  const colors = [palette.Low,palette.Medium,palette.High];
  const y0 = 180, chartH = 135, barW = 75, gap = 85, startX = 74;
  [0,.5,1].forEach(f => {
    const y = y0 - chartH * f;
    svg.append(el("line",{x1:45,y1:y,x2:560,y2:y,stroke:palette.grid,"stroke-width":"1"}));
    const label = el("text",{x:31,y:y+4,"text-anchor":"end",fill:palette.text,"font-size":"10","font-family":"DM Sans"});
    label.textContent = String(Math.round(max*f)); svg.append(label);
  });
  bands.forEach((band,i) => {
    const height = counts[i] / max * chartH;
    const x = startX + i * (barW + gap);
    const rect = el("rect",{x,y:y0-height,width:barW,height,rx:6,fill:colors[i],opacity:".88"});
    rect.append(el("title")); rect.lastChild.textContent = `${band}: ${counts[i]} illustrative students`;
    svg.append(rect);
    const count = el("text",{x:x+barW/2,y:y0-height-8,"text-anchor":"middle",fill:"#42566f","font-size":"12","font-weight":"700","font-family":"DM Sans"});
    count.textContent = String(counts[i]); svg.append(count);
    const label = el("text",{x:x+barW/2,y:201,"text-anchor":"middle",fill:"#718198","font-size":"11","font-family":"DM Sans"});
    label.textContent = band; svg.append(label);
  });
  root.append(svg);
}
export function courseRiskChart(rows, target = "course-risk-chart") {
  const root = document.getElementById(target); if (!root) return;
  root.replaceChildren();
  const groups = new Map();
  rows.forEach(student => {
    if (!groups.has(student.course)) groups.set(student.course, {Low:0,Medium:0,High:0,total:0});
    const group = groups.get(student.course);
    group[student.risk] += 1;
    group.total += 1;
  });
  const sorted = [...groups.entries()].sort((a,b) => b[1].total - a[1].total).slice(0,7);
  const svg = baseSvg("Synthetic review bands by course reference", "Stacked bars compare low, medium, and high illustrative review bands across generated course groups. They are not UCI course-code mappings or live predictions.","0 0 640 250");
  const max = Math.max(1,...sorted.map(([,group])=>group.total));
  sorted.forEach(([name,group],i) => {
    const y = 25 + i*31;
    const label = el("text",{x:0,y:y+12,fill:"#718198","font-size":"10","font-family":"DM Sans"});
    label.textContent = name.length > 24 ? `${name.slice(0,22)}…` : name; svg.append(label);
    const fullWidth=350*group.total/max;
    let x=210;
    ["Low","Medium","High"].forEach(band=>{
      const width=fullWidth*group[band]/group.total;
      if(width>0)svg.append(el("rect",{x,y,width,height:13,rx:4,fill:palette[band]}));
      x+=width;
    });
    const n = el("text",{x:574,y:y+11,fill:"#50647d","font-size":"10","font-weight":"700","font-family":"DM Sans"});
    n.textContent = String(group.total); svg.append(n);
  });
  root.append(svg);
}
export function scoreSpreadChart(rows, target = "score-spread-chart") {
  const root = document.getElementById(target); if (!root) return;
  root.replaceChildren();
  const svg = baseSvg("Illustrative risk score distribution", "Each vertical mark represents one synthetic demo record, arranged by score from 0 to 100.","0 0 620 210");
  const x0 = 50, width = 530, y = 112;
  svg.append(el("line",{x1:x0,y1:y,x2:x0+width,y2:y,stroke:"#dfe6ee","stroke-width":"2"}));
  [0,25,50,75,100].forEach(t=>{
    const x=x0+width*t/100;
    svg.append(el("line",{x1:x,y1:y-58,x2:x,y2:y+59,stroke:palette.grid,"stroke-width":"1"}));
    const tx=el("text",{x,y:190,"text-anchor":"middle",fill:palette.text,"font-size":"10","font-family":"DM Sans"});tx.textContent=String(t);svg.append(tx);
  });
  rows.forEach((s,i)=>{
    const x=x0+width*s.score/100;
    const offset=((i%5)-2)*7;
    const c=el("circle",{cx:x,cy:y+offset,r:5,fill:palette[s.risk],opacity:".8",stroke:"#fff","stroke-width":"1.5"});
    const title=el("title");title.textContent=`${s.id}: illustrative score ${s.score}, ${s.risk} review band`;c.append(title);svg.append(c);
  });
  const low=el("text",{x:x0,y:22,fill:palette.Low,"font-size":"10","font-weight":"700","font-family":"DM Sans"});low.textContent="LOW · under 33";svg.append(low);
  const med=el("text",{x:x0+width*.4,y:22,fill:palette.Medium,"font-size":"10","font-weight":"700","font-family":"DM Sans"});med.textContent="MEDIUM · 33–65";svg.append(med);
  const high=el("text",{x:x0+width*.78,y:22,fill:palette.High,"font-size":"10","font-weight":"700","font-family":"DM Sans"});high.textContent="HIGH · 66+";svg.append(high);
  root.append(svg);
}

export function modelR2Chart(rows, target = "model-r2-chart") {
  const root = document.getElementById(target); if (!root) return;
  root.replaceChildren();
  const height = 42 * rows.length + 24;
  const svg = baseSvg(
    "Approximate notebook-comment R squared comparison",
    "Bars show approximate R squared values stated in notebook comments only. They are not verified live evaluation results. Exact test and cross-validation metrics are not loaded.",
    `0 0 700 ${height}`
  );
  const labelWidth = 225, chartWidth = 330, startY = 16, rowGap = 42;
  [0, .25, .5, .75, 1].forEach(value => {
    const x = labelWidth + chartWidth * value;
    svg.append(el("line", {x1:x,y1:8,x2:x,y2:height-10,stroke:palette.grid,"stroke-width":"1"}));
    const tick = el("text", {x,y:height-1,"text-anchor":"middle",fill:palette.text,"font-size":"9","font-family":"DM Sans"});
    tick.textContent = value.toFixed(value === 0 || value === 1 ? 0 : 2); svg.append(tick);
  });
  rows.forEach((row, index) => {
    const y = startY + index * rowGap;
    const label = el("text", {x:0,y:y+13,fill:"#50647d","font-size":"10","font-family":"DM Sans"});
    label.textContent = `${row.name} · ${row.type}`; svg.append(label);
    const score = Number(row.r2.match(/0\.(\d+)/)?.[0] || 0);
    const bar = el("rect", {x:labelWidth,y,width:Math.max(2,chartWidth*score),height:15,rx:5,fill:row.selected?"#316cba":"#7da0cb",opacity:row.selected?"1":".8"});
    const title = el("title"); title.textContent = `${row.name} ${row.type}: ${row.r2}, approximate notebook-comment finding`; bar.append(title); svg.append(bar);
    const value = el("text", {x:labelWidth+chartWidth*score+7,y:y+12,fill:row.selected?"#285b9f":"#718198","font-size":"9","font-weight":"700","font-family":"DM Sans"});
    value.textContent = row.r2; svg.append(value);
  });
  root.append(svg);
}
