import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createWordsRouter } from './routes/wordsRouter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Express 애플리케이션을 생성하고 설정한다.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {{staticDir?: string}} [options] - staticDir이 주어지고 존재하면 정적 파일을 서빙한다 (frontend 프로덕션 빌드 통합용)
 * @returns {import('express').Express}
 */
export function createApp(db, options = {}) {
  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:5173'],
    })
  );
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/words', createWordsRouter(db));

  // frontend 프로덕션 빌드 정적 파일 서빙 (배포판 통합 실행용, 존재할 때만 활성화)
  const staticDir = options.staticDir;
  if (staticDir && existsSync(staticDir)) {
    app.use(express.static(staticDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(join(staticDir, 'index.html'));
    });
  }

  // 404 핸들러
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // 공통 에러 핸들러
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  });

  return app;
}
