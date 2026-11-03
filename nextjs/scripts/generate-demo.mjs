// Generates lib/demo/demoData.json: a synthetic sales dataset plus recorded chat answers.
// Every number in the answers is computed from the rows, so the demo always matches the data.
// Run with: node scripts/generate-demo.mjs
import { writeFileSync } from "node:fs";

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = (arr, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
};

const regions = ["North", "South", "East", "West"];
const categories = ["Electronics", "Furniture", "Office Supplies", "Clothing"];
const basePrice = { Electronics: 240, Furniture: 180, "Office Supplies": 22, Clothing: 55 };
const regionBoost = { North: 1.0, South: 0.85, East: 1.25, West: 1.1 };
const catRating = { Electronics: 4.2, Furniture: 3.9, "Office Supplies": 3.6, Clothing: 4.0 };

const N = 150;
const rows = [];
for (let i = 0; i < N; i++) {
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  const region = pick(regions, [3, 2, 4, 3]);
  const category = pick(categories, [3, 2, 4, 3]);
  const units = 1 + Math.floor(rand() * 9);
  const unit_price = +(basePrice[category] * (0.85 + rand() * 0.4)).toFixed(2);
  const seasonal = 1 + (month >= 10 ? 0.35 : 0) + (month === 7 ? 0.15 : 0);
  const revenue = +(units * unit_price * regionBoost[region] * seasonal).toFixed(2);
  const ratingRaw = catRating[category] + (rand() - 0.5) * 1.6;
  const customer_rating = rand() < 0.06 ? null : +Math.max(1, Math.min(5, ratingRaw)).toFixed(1);
  rows.push({
    order_id: `ORD${String(1001 + i)}`,
    order_date: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    region, category, units, unit_price, revenue, customer_rating,
  });
}
rows.sort((a, b) => a.order_date.localeCompare(b.order_date));
rows.forEach((r, i) => (r.order_id = `ORD${1001 + i}`));

// helpers
const sum = (a) => a.reduce((x, y) => x + y, 0);
const fmt = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmt2 = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const median = (v) => { const s = [...v].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const groupSum = (key, val) => { const m = {}; rows.forEach((r) => (m[r[key]] = (m[r[key]] ?? 0) + r[val])); return m; };

const darkLayout = (title, extra = {}) => ({
  title: { text: title, font: { color: "#dc143c" } },
  paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", font: { color: "#ffffff" },
  xaxis: { gridcolor: "#2a2a2a", linecolor: "#444" }, yaxis: { gridcolor: "#2a2a2a", linecolor: "#444" },
  margin: { t: 60, r: 20, b: 60, l: 60 }, ...extra,
});
const colors = ["#dc143c", "#ff6b6b", "#ff8e8e", "#b01030"];

const totalRevenue = sum(rows.map((r) => r.revenue));
const revByRegion = groupSum("region", "revenue");
const regionRank = Object.entries(revByRegion).sort((a, b) => b[1] - a[1]);
const revByCat = groupSum("category", "revenue");
const catRank = Object.entries(revByCat).sort((a, b) => b[1] - a[1]);
const monthly = {}; rows.forEach((r) => { const m = r.order_date.slice(0, 7); monthly[m] = (monthly[m] ?? 0) + r.revenue; });
const monthKeys = Object.keys(monthly).sort();
const peak = monthKeys.reduce((a, b) => (monthly[b] > monthly[a] ? b : a));
const monthName = (k) => new Date(`${k}-01T00:00:00`).toLocaleString("en-US", { month: "long" });
const ratings = rows.map((r) => r.customer_rating).filter((v) => v != null);
const missingRatings = rows.length - ratings.length;
const ratingByCat = {};
categories.forEach((c) => { const v = rows.filter((r) => r.category === c && r.customer_rating != null).map((r) => r.customer_rating); ratingByCat[c] = sum(v) / v.length; });
const ratingRank = Object.entries(ratingByCat).sort((a, b) => b[1] - a[1]);
const q4 = monthKeys.filter((m) => m >= "2025-10").reduce((s, m) => s + monthly[m], 0);

const stat = (col) => { const v = rows.map((r) => r[col]).filter((x) => x != null); const mean = sum(v) / v.length; return { min: Math.min(...v), max: Math.max(...v), mean, median: median(v) }; };
const sU = stat("units"), sP = stat("unit_price"), sR = stat("revenue"), sC = stat("customer_rating");

const chats = [
  {
    id: "summary",
    question: "Summarize this dataset",
    answer: `This is a sales dataset with **${rows.length} orders** placed between **${rows[0].order_date}** and **${rows[rows.length - 1].order_date}**, across **4 regions** and **4 product categories**.\n\n* Total revenue: **$${fmt(totalRevenue)}**\n* Average order value: **$${fmt2(totalRevenue / rows.length)}**\n* Top region: **${regionRank[0][0]}** with $${fmt(regionRank[0][1])}\n* Top category: **${catRank[0][0]}** with $${fmt(catRank[0][1])}\n* Customer ratings average **${fmt2(sum(ratings) / ratings.length)}** out of 5, with **${missingRatings}** orders missing a rating\n\nRevenue is strongest in the last quarter of the year, which looks like a holiday season lift.`,
  },
  {
    id: "stats",
    question: "What are the key statistics?",
    answer: `Here are the main numeric columns:\n\n| Column | Min | Median | Mean | Max |\n| --- | --- | --- | --- | --- |\n| units | ${sU.min} | ${sU.median} | ${fmt2(sU.mean)} | ${sU.max} |\n| unit_price | $${fmt2(sP.min)} | $${fmt2(sP.median)} | $${fmt2(sP.mean)} | $${fmt2(sP.max)} |\n| revenue | $${fmt2(sR.min)} | $${fmt2(sR.median)} | $${fmt2(sR.mean)} | $${fmt2(sR.max)} |\n| customer_rating | ${sC.min} | ${sC.median} | ${fmt2(sC.mean)} | ${sC.max} |\n\nThe **mean revenue ($${fmt2(sR.mean)})** is well above the **median ($${fmt2(sR.median)})**, so a small number of large orders pull the average up.`,
  },
  {
    id: "region",
    question: "Which region has the highest revenue? Show a bar chart",
    answer: `**${regionRank[0][0]}** leads with **$${fmt(regionRank[0][1])}** in revenue, **${(regionRank[0][1] / totalRevenue * 100).toFixed(1)}%** of the total. **${regionRank[regionRank.length - 1][0]}** is lowest at $${fmt(regionRank[regionRank.length - 1][1])}.\n\nThe chart below ranks all four regions.`,
    chartSpec: {
      data: [{ type: "bar", x: regionRank.map((r) => r[0]), y: regionRank.map((r) => +r[1].toFixed(2)), marker: { color: colors } }],
      layout: darkLayout("Revenue by region", { yaxis: { title: "Revenue ($)", gridcolor: "#2a2a2a", linecolor: "#444" } }),
    },
  },
  {
    id: "monthly",
    question: "Show monthly revenue as a line chart",
    answer: `Revenue peaks in **${monthName(peak)}** at **$${fmt(monthly[peak])}**. The final quarter (October to December) brings in **$${fmt(q4)}**, or **${(q4 / totalRevenue * 100).toFixed(1)}%** of the year.`,
    chartSpec: {
      data: [{ type: "scatter", mode: "lines+markers", x: monthKeys, y: monthKeys.map((m) => +monthly[m].toFixed(2)), line: { color: "#dc143c", width: 3 }, marker: { color: "#ff6b6b", size: 8 } }],
      layout: darkLayout("Monthly revenue, 2025", { yaxis: { title: "Revenue ($)", gridcolor: "#2a2a2a", linecolor: "#444" } }),
    },
  },
  {
    id: "ratings",
    question: "Which category has the best customer ratings?",
    answer: `**${ratingRank[0][0]}** is rated highest at **${fmt2(ratingRank[0][1])}** out of 5, while **${ratingRank[ratingRank.length - 1][0]}** is lowest at **${fmt2(ratingRank[ratingRank.length - 1][1])}**. Orders with no rating are left out of these averages.`,
    chartSpec: {
      data: [{ type: "bar", x: ratingRank.map((r) => r[0]), y: ratingRank.map((r) => +r[1].toFixed(2)), marker: { color: colors } }],
      layout: darkLayout("Average rating by category", { yaxis: { title: "Average rating", range: [0, 5], gridcolor: "#2a2a2a", linecolor: "#444" } }),
    },
  },
  {
    id: "missing",
    question: "Any missing values?",
    answer: `Only one column has gaps: **customer_rating** is missing in **${missingRatings} of ${rows.length} orders** (${(missingRatings / rows.length * 100).toFixed(1)}%). Every other column is complete.\n\nFor averages I would simply skip those rows. If ratings mattered more, the next step would be to ask customers who did not respond.`,
  },
];

writeFileSync(new URL("../lib/demo/demoData.json", import.meta.url), JSON.stringify({ fileName: "sample_sales.csv", rows, chats }, null, 1));
console.log("rows", rows.length, "chats", chats.length, "revenue", fmt(totalRevenue), "top region", regionRank[0][0], "peak month", peak, "missing ratings", missingRatings);
