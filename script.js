
var password = prompt("請輸入密碼才能使用：");
if (password !== "maoboss") {
  alert("密碼錯誤，無法使用！");
  document.body.innerHTML = "";
}

let currentTable = "";

function analyze() {
  const rawData = document.getElementById('inputData').value.trim().split('\n');
  const totalStock = parseInt(document.getElementById('totalStock').value);
  const maxPerSKU = parseInt(document.getElementById('maxPerSKU').value);
  let rows = [];

  for (let line of rawData) {
    line = line.trim().replace(/，/g, ','); // 換全形逗號
    if (!line) continue;
    let parts = line.includes(',') ? line.split(',') : line.split(/\s+/);
    if (parts.length !== 4) continue;
    const name = parts[0].trim();
    const price = parseFloat(parts[1]);
    const comments = parseInt(parts[2]);
    const ratio = parseFloat(parts[3].replace('%', '')) / 100;
    if (isNaN(price) || isNaN(comments) || isNaN(ratio)) continue;
    rows.push({ name, price, comments, ratio });
  }

  let html = '<table><tr><th>SKU 名稱</th><th>價格</th><th>評論數</th><th>銷量佔比</th><th>建議進貨</th><th>最終進貨</th></tr>';
  let csv = "SKU名稱,價格,評論數,銷量佔比,建議進貨,最終進貨\n";
  for (let row of rows) {
    const suggested = Math.round(row.ratio * totalStock);
    const final = Math.min(suggested, maxPerSKU);
    html += `<tr><td>${row.name}</td><td>${row.price}</td><td>${row.comments}</td><td>${(row.ratio * 100).toFixed(2)}%</td><td>${suggested}</td><td>${final}</td></tr>`;
    csv += `${row.name},${row.price},${row.comments},${(row.ratio * 100).toFixed(2)}%,${suggested},${final}\n`;
  }
  html += '</table>';
  document.getElementById('output').innerHTML = html;
  currentTable = csv;
}

function copyResult() {
  if (!currentTable) return alert("請先分析再複製");
  navigator.clipboard.writeText(currentTable)
    .then(() => alert("已複製到剪貼簿"))
    .catch(() => alert("複製失敗"));
}

function downloadCSV() {
  if (!currentTable) return alert("請先分析再匯出");
  const blob = new Blob([currentTable], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "sku_result.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
