
// 密碼保護
var password = prompt("請輸入密碼才能使用：");
if (password !== "maoboss") {
  alert("密碼錯誤，無法使用！");
  document.body.innerHTML = "";
}

function analyze() {
  const rawData = document.getElementById('inputData').value.trim().split('\n');
  const totalStock = parseInt(document.getElementById('totalStock').value);
  const maxPerSKU = parseInt(document.getElementById('maxPerSKU').value);
  let rows = [];

  for (let line of rawData) {
    const parts = line.split(',');
    if (parts.length !== 4) continue;
    const name = parts[0].trim();
    const price = parseFloat(parts[1]);
    const comments = parseInt(parts[2]);
    const ratio = parseFloat(parts[3].replace('%', '')) / 100;
    rows.push({ name, price, comments, ratio });
  }

  let html = '<table><tr><th>SKU 名稱</th><th>價格</th><th>評論數</th><th>銷量佔比</th><th>建議進貨</th><th>最終進貨</th></tr>';
  for (let row of rows) {
    const suggested = Math.round(row.ratio * totalStock);
    const final = Math.min(suggested, maxPerSKU);
    html += `<tr><td>${row.name}</td><td>${row.price}</td><td>${row.comments}</td><td>${(row.ratio * 100).toFixed(2)}%</td><td>${suggested}</td><td>${final}</td></tr>`;
  }
  html += '</table>';
  document.getElementById('output').innerHTML = html;
}
