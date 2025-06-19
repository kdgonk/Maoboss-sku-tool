
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
    let line = rawData[i].trim().replace(/，/g, ',').replace(/\s+/g, ' ');
    if (!line) continue;

    let parts = line.split(/\t|,/).map(p => p.trim());
    if (parts.length < 4) {
      parts = line.split(/\s+/).map(p => p.trim());
    }

    if (parts.length < 3) {
      errorLines.push(`第 ${i + 1} 行資料不足`);
      continue;
    }

    const ratioRaw = parts[parts.length - 1];
    const commentsRaw = parts[parts.length - 2];
    const priceRaw = parts[parts.length - 3];

    if (ratioRaw === '--' || ratioRaw === '' || ratioRaw === '—') continue;

    const ratio = parseFloat((ratioRaw || "").replace('%', '')) / 100;
    const comments = parseInt(commentsRaw || "0");
    const price = parseFloat(priceRaw || "0");

    const name = parts.slice(0, parts.length - 3).join(' ').replace(/\s+/g, ' ').trim();

    if (isNaN(ratio) || ratio <= 0 || ratio > 1) {
      errorLines.push(`第 ${i + 1} 行銷量佔比異常：${ratioRaw}`);
      continue;
    }

    rows.push({ name, price, comments, ratio });
  }

  rows.sort((a, b) => {
    const [colorA, sizeA] = extractColorSize(a.name);
    const [colorB, sizeB] = extractColorSize(b.name);
    if (colorA === colorB) {
      return sizeOrder(sizeA) - sizeOrder(sizeB);
    } else {
      return colorA.localeCompare(colorB, 'zh-Hant');
    }
  });

  if (errorLines.length > 0) {
    alert(errorLines.join('\n'));
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

function extractColorSize(text) {
  const match = text.match(/(.+?)[,，\s]+([SMLXL]{1,3})/i);
  if (match) return [match[1], match[2].toUpperCase()];
  return [text, ''];
}

function sizeOrder(size) {
  const order = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  return order[size.toUpperCase()] || 99;
}

function copyNotion() {
  if (!notionTable) return alert("請先分析再複製");
  navigator.clipboard.writeText(notionTable)
    .then(() => alert("已複製 Notion 格式"))
    .catch(() => alert("複製失敗"));
}

function downloadCSV() {
  if (!notionCSV) return alert("請先分析再匯出");
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([BOM, notionCSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "notion進貨表.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
