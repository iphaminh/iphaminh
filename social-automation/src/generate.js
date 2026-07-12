import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { config, requireEnv, root } from "./config.js";
import { apiJson, readJson, writeJson } from "./shared.js";

const outputRoot = path.join(root, "public", "social-content");
const historyFile = path.join(outputRoot, "history.json");

function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: config.timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);
}

function wrapQuote(quote, max = 24) {
  const words = quote.split(/\s+/); const lines = []; let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > max && line) { lines.push(line); line = word; }
    else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 5);
}

async function generatePlan(date, recentQuotes) {
  const prompt = `Bạn là giám đốc nội dung cho Phaminh Cinematography, thương hiệu quay phim cưới cao cấp của người Việt tại Mỹ.
Tạo một carousel 3 ảnh truyền cảm hứng bằng tiếng Việt cho ngày ${date}. Mục tiêu: tăng lượt lưu, chia sẻ, theo dõi và kết nối cảm xúc.
Chủ đề xoay vòng: tình yêu trưởng thành, lòng biết ơn, kỷ luật, chữa lành, gia đình, dũng khí, sống có mục đích.
Không sáo rỗng, không hứa hẹn quá mức, không dùng trích dẫn có bản quyền hay gán tên người nổi tiếng.
Mỗi quote 8-18 từ, tự nhiên với người Việt. Ba quote phải tạo thành mở bài, chiều sâu, kết luận.
Caption có hook, một câu chuyện/ngẫm ngợi ngắn, CTA hỏi một câu dễ bình luận, và 6-9 hashtag phù hợp. Không dùng #fyp.
Mỗi image_prompt mô tả ảnh điện ảnh cao cấp, chân thực, ánh sáng tinh tế, khoảng trống tối ở giữa cho chữ; tuyệt đối không tạo chữ, logo hoặc watermark trong ảnh.
Các câu gần đây cần tránh lặp lại: ${JSON.stringify(recentQuotes.slice(-30))}
Chỉ trả JSON hợp lệ theo dạng:
{"theme":"...","caption":"...","slides":[{"quote":"...","image_prompt":"..."},{"quote":"...","image_prompt":"..."},{"quote":"...","image_prompt":"..."}]}`;
  const body = await apiJson("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.textModel, input: prompt, text: { format: { type: "json_object" } } }),
  });
  const text = body.output_text || body.output?.flatMap((x) => x.content || []).find((x) => x.type === "output_text")?.text;
  const plan = JSON.parse(text);
  if (!plan.caption || plan.slides?.length !== 3) throw new Error("OpenAI returned an invalid content plan");
  return plan;
}

async function generateBackground(prompt) {
  const body = await apiJson("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.imageModel, prompt, size: "1024x1536", quality: "medium", output_format: "png" }),
  });
  if (body.data?.[0]?.b64_json) return Buffer.from(body.data[0].b64_json, "base64");
  if (body.data?.[0]?.url) return Buffer.from(await (await fetch(body.data[0].url)).arrayBuffer());
  throw new Error("Image API returned no image");
}

async function composeSlide(background, quote, slideNumber, output) {
  const lines = wrapQuote(quote);
  const startY = 650 - ((lines.length - 1) * 48);
  const tspans = lines.map((line, index) => `<tspan x="540" y="${startY + index * 96}">${escapeXml(line)}</tspan>`).join("");
  const svg = Buffer.from(`<svg width="1080" height="1350" xmlns="http://www.w3.org/2000/svg">
    <rect width="1080" height="1350" fill="url(#shade)"/><defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050403" stop-opacity=".20"/><stop offset=".5" stop-color="#050403" stop-opacity=".68"/><stop offset="1" stop-color="#050403" stop-opacity=".45"/></linearGradient></defs>
    <text x="540" y="190" text-anchor="middle" fill="#d7b56d" font-family="Georgia" font-size="24" letter-spacing="7">PHAMINH</text>
    <line x1="450" y1="225" x2="630" y2="225" stroke="#d7b56d" stroke-width="2"/>
    <text text-anchor="middle" fill="#fffaf0" font-family="Georgia" font-size="59" font-weight="500">${tspans}</text>
    <text x="540" y="1180" text-anchor="middle" fill="#d7b56d" font-family="Arial" font-size="22" letter-spacing="4">${slideNumber} / 3</text>
  </svg>`);
  await sharp(background).resize(1080, 1350, { fit: "cover" }).composite([{ input: svg }]).jpeg({ quality: 92 }).toFile(output);
}

export async function generate() {
  requireEnv(["OPENAI_API_KEY"]);
  const date = process.env.CONTENT_DATE || localDate();
  const dayDir = path.join(outputRoot, date);
  const manifestFile = path.join(dayDir, "manifest.json");
  const existing = await readJson(manifestFile);
  if (existing && !process.argv.includes("--force")) { console.log(`Content already exists for ${date}`); return existing; }
  await fs.mkdir(dayDir, { recursive: true });
  const history = await readJson(historyFile, []);
  const plan = await generatePlan(date, history.flatMap((item) => item.quotes || []));
  const images = [];
  for (let i = 0; i < 3; i += 1) {
    console.log(`Generating slide ${i + 1}/3`);
    const background = await generateBackground(`${plan.slides[i].image_prompt}. Vertical editorial composition, cinematic dark gold and warm neutral palette, Vietnamese-American luxury aesthetic. No text, letters, signs, logo, watermark, border, or frame.`);
    const filename = `slide-${i + 1}.jpg`;
    await composeSlide(background, plan.slides[i].quote, i + 1, path.join(dayDir, filename));
    images.push(`${config.publicBaseUrl}/${date}/${filename}`);
  }
  const manifest = { date, status: "generated", theme: plan.theme, caption: plan.caption, quotes: plan.slides.map((s) => s.quote), images, createdAt: new Date().toISOString(), publications: {} };
  await writeJson(manifestFile, manifest);
  await writeJson(historyFile, [...history.filter((x) => x.date !== date), { date, theme: plan.theme, quotes: manifest.quotes }].slice(-120));
  console.log(`Generated ${manifestFile}`);
  return manifest;
}

if (import.meta.url === `file://${process.argv[1]}`) generate().catch((error) => { console.error(error.message); process.exitCode = 1; });
