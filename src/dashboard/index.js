/**
 * 学习看板模块
 * 开发者: 陈总(B)
 * 任务: T-304 统计报表 + 可视化看板
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const stats = require('../stats');
const store = require('../store');
const vocab = require('../vocabulary');
const errorBook = require('../errorbook');

const DEFAULT_PORT = 3939;

class Dashboard {
  constructor(port = DEFAULT_PORT) {
    this.port = port;
    this.server = null;
  }

  /**
   * 启动看板服务
   */
  start() {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        // CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

        const url = new URL(req.url, `http://localhost:${this.port}`);

        if (url.pathname === '/' || url.pathname === '/index.html') {
          this._serveHTML(res);
        } else if (url.pathname === '/api/report') {
          this._serveJSON(res, stats.generateReport());
        } else if (url.pathname === '/api/vocabulary') {
          this._serveJSON(res, vocab.getAllWords());
        } else if (url.pathname === '/api/errors') {
          this._serveJSON(res, store.getCollection('errorWords'));
        } else if (url.pathname === '/api/errors/top') {
          const limit = parseInt(url.searchParams.get('limit')) || 10;
          this._serveJSON(res, errorBook.getTopErrors(limit));
        } else if (url.pathname === '/api/sessions') {
          this._serveJSON(res, store.getCollection('sessions'));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not Found' }));
        }
      });

      this.server.listen(this.port, () => {
        console.log(`[Dashboard] 看板已启动: http://localhost:${this.port}`);
        resolve();
      });
    });
  }

  /**
   * 停止服务
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('[Dashboard] 看板已停止');
    }
  }

  _serveJSON(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
  }

  _serveHTML(res) {
    const htmlPath = path.join(__dirname, 'index.html');
    try {
      const html = fs.readFileSync(htmlPath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Dashboard HTML not found');
    }
  }
}

module.exports = Dashboard;
