import { Request, Response, NextFunction } from "express";
import { prisma } from "./db";
import log from "./logger";

async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (req.path == "/metrics" || req.path == "/health") {
    return next();
  }
  if (!req.headers["authorization"]) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.headers["authorization"],
      },
    });
    if (!user) {
      res.status(401).send("Unauthorized");
    } else {
      req.user = {
        id: user.id,
        roles: JSON.parse(user.roles),
        attributes: {
          department: user.department,
          region: user.region || undefined,
        },
      };
      next();
    }
  } catch (e) {
    log.error(e);
    res.status(500).send("Server Error");
  }
}

export default authenticate;
