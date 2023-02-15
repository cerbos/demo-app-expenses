import express from "express";

import cors from "cors";
import promBundle from "express-prom-bundle";
import log, { morganMiddleware } from './logger';
import { prisma } from './db';
import authenticate from './authenticate';
import { cerbos } from './cerbos';
import router from './routes';
import path from 'path';


const PORT = process.env.PORT || 8000;

const app = express();
const metricsMiddleware = promBundle({ includeMethod: true, includePath: true, includeStatusCode: true });

app.use(morganMiddleware);
app.use(metricsMiddleware);
app.use(express.json());
app.use(cors());

app.use("/api", authenticate, router);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`select 1;`
    await cerbos.serverInfo();
    res.json({ status: "ok" })
  } catch (e) {
    res.status(500).json({ status: "not ok", error: e })
  }
})

if (process.env.SERVE_STATIC) {
  const staticPath = path.join(__dirname, "dist")
  log.info(`Serving static site from ${staticPath}`)
  app.use(express.static(staticPath))
  app.get('*', (req, res) => res.sendFile(path.join(staticPath, 'index.html')))
}

app.listen(PORT, () => {
  log.info(`Server is running on port ${PORT}`);
  log.info("Run 'npm run reset' to reset the DB with seed data")
});


declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        roles: string[];
        attributes: {
          department: string;
          region?: string;
        };
      }
    }
  }
}
