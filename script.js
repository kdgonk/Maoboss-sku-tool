
var password = prompt("請輸入密碼才能使用：");
if (password !== "maoboss") {
  alert("密碼錯誤，無法使用！");
  document.body.innerHTML = "";
}

let notionTable = "";
let notionCSV = "";

function analyze() {
  const rawData = document.getElementById('inputData').value.trim().split('\n');
  const totalStock = parseInt(document.getElementById('totalStock').value);
  const maxPerSKU = parseInt(document.getElementById('maxPerSKU').value);
  let rows = [];
  let errorLines = [];

  for (let i = 0; i < rawData.length; i++) {
    let line = rawData[i].trim().replace(/，/g, ',');
    if (!line) continue;

    let parts = [];
    if (line.includes(',')) {
      parts = line.split(',').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else {
      parts = line.trim().split(/\s+/).map(p => p.trim());
    }

    if (parts.length < 4) {
      errorLines.push(i + 1);
      continue;
    }

    const name = parts.slice(0, parts.length - 3).join(' ');
    const price = parseFloat(parts[parts.length - 3]);
    const comments = parseInt(parts[parts.length - 2]);
    const ratio = parseFloat(parts[parts.length - 1].replace('%', '')) / 100;

    if (isNaN(price) || isNaN(comments) || isNaN(ratio)) {
      errorLines.push(i + 1);
      continue;
    }

    rows.push({ name, price, comments, ratio });
  }

  if (errorLines.length > 0) {
    alert("第 " + errorLines.join(', ') + " 行格式錯誤，已略過");
  }

  let html = '<table><tr><th>SKU 名稱</th><th>進貨建議</th><th>最終進貨</th></tr>';
  let notionText = "規格\t進貨數量\t售價\n";
  let csv = "規格,進貨數量,售價\n";

  for (let row of rows) {
    const suggested = Math.round(row.ratio * totalStock);
    const final = Math.min(suggested, maxPerSKU);
    html += `<tr><td>${row.name}</td><td>${suggested}</td><td>${final}</td></tr>`;
    notionText += `${row.name}\t${final}\t\n`;
    csv += `${row.name},${final},\n`;
  }

  html += '</table>';
  document.getElementById('output').innerHTML = html;
  notionTable = notionText;
  notionCSV = csv;
}

function copyNotion() {
  if (!notionTable) return alert("請先分析再複製");
  navigator.clipboard.writeText(notionTable)
    .then(() => alert("已複製 Notion 格式"))
    .catch(() => alert("複製失敗"));
}

function downloadCSV() {
  if (!notionCSV) return alert("請先分析再匯出");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + notionCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "notion進貨表.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
