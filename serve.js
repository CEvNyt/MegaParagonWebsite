// Local dev server with clean URLs (mirrors .htaccess). Run: node serve.js  ->  http://localhost:8080/home
const http = require("http"), fs = require("fs"), path = require("path");
const root = __dirname, port = process.env.PORT || 8080;
const pages = { "": "home", home: "home", about: "about", announcements: "announcements", contact: "contact",
  products: "prod-serv", careers: "join", ascent: "paragon-ascent", central: "paragon-central",
  belimitless: "paragon-blimitless", ironeagles: "paragon-iem" };
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".ttf": "font/ttf", ".pdf": "application/pdf" };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]).replace(/\/+$/, "").replace(/^\/+/, "");
  let file = p in pages ? pages[p] + ".html" : p;
  if (!(p in pages) && fs.existsSync(path.join(root, p + ".html"))) file = p + ".html";
  const full = path.join(root, file);
  if (!full.startsWith(root) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404); return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": types[path.extname(full).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(full).pipe(res);
}).listen(port, () => console.log(`http://localhost:${port}/home`));
