const firstNames = ["Amara","Rafael","Nadia","Elliot","Mina","Theo","Iris","Caleb","Leila","Jonah","Sofia","Mateo","Priya","Owen","Zara","Felix","Mae","Andre","Clara","Hugo","Aisha","Noah","Elena","Sam"];
const lastNames = ["Bennett","Costa","Rahman","Chen","Patel","Morgan","Silva","Brooks","Haddad","Kim","Reyes","Nguyen","Shah","Ellis","Khan","Turner","Wright","Alvarez","Park","James","Foster","Rivera","Cole","Bishop"];
const courses = ["Course ref 01","Course ref 02","Course ref 03","Course ref 04","Course ref 05","Course ref 06","Course ref 07","Course ref 08"];
const scores = [18,24,29,32,35,38,41,43,46,48,51,54,57,59,61,64,66,68,71,74,77,81,86,92];
const age = [19,21,20,24,18,22,26,19,23,20,27,21,18,25,22,20,29,19,24,21,23,18,28,22];
const admissionGrade = [124.5,101.2,138.7,96.4,115.8,132.1,104.6,146.3,119.7,91.5,128.2,107.4,153.6,112.8,99.3,141.7,88.9,126.5,109.6,135.2,117.4,94.8,148.1,103.7];
const previousQualificationGrade = [132,108,145,96,121,139,112,151,126,101,134,115,158,118,104,147,93,129,111,140,123,98,154,107];

export const students = firstNames.map((first, i) => {
  const score = scores[i];
  return {
    id: `ST-${String(2401 + i).padStart(4, "0")}`,
    name: `${first} ${lastNames[i]}`,
    initials: `${first[0]}${lastNames[i][0]}`,
    course: courses[(i * 3 + Math.floor(i / 4)) % courses.length],
    age: age[i],
    admissionGrade: admissionGrade[i],
    previousQualificationGrade: previousQualificationGrade[i],
    score,
    risk: score < 33 ? "Low" : score < 66 ? "Medium" : "High",
    synthetic: true
  };
});

export const modelRows = [
  {name:"Linear Regression",type:"Baseline",r2:"≈ 0.68"},
  {name:"Decision Tree",type:"Default",r2:"≈ 0.80"},
  {name:"Decision Tree",type:"Tuned",r2:"≈ 0.81"},
  {name:"Random Forest",type:"Default",r2:"≈ 0.82"},
  {name:"Random Forest",type:"Tuned",r2:"≈ 0.83",selected:true},
  {name:"Support Vector Regressor",type:"Default",r2:"≈ 0.63"},
  {name:"Support Vector Regressor",type:"Tuned",r2:"≈ 0.73"},
  {name:"K-Nearest Neighbours",type:"Default · k=5",r2:"≈ 0.59"},
  {name:"K-Nearest Neighbours",type:"Tuned · k not embedded",r2:"≈ 0.61"}
];

export const riskFor = score => score < 33 ? "Low" : score < 66 ? "Medium" : "High";
