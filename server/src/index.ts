import express from "express";
import { GRPC } from "@cerbos/grpc";
import cors from "cors";

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

import { PrismaClient } from '@prisma/client'
import queryPlanToPrisma from "@cerbos/orm-prisma";
const prisma = new PrismaClient()

// Local PDP
const cerbos = new GRPC("localhost:3593", {
  tls: false,
});

// Metrics
let metrics = {
  serverChecks: 0,
};

const app = express();
app.use(express.json());
app.use(cors());

app.use(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.headers["authorization"]
    }
  })
  if (!user) {
    res.status(401).send("Unauthorized");
  } else {
    req.user = {
      id: user.id,
      roles: JSON.parse(user.roles),
      attributes: {
        department: user.department,
        region: user.region || undefined,
      }
    };
    next();
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "CerbFinance is running",
  });
});

app.get("/expenses", async (req, res) => {
  const queryPlan = await cerbos.planResources({
    principal: req.user,
    resource: { kind: "expense" },
    action: "view",
  });
  metrics.serverChecks++;
  const filters = queryPlanToPrisma({
    queryPlan: queryPlan,
    fieldNameMapper: {
      "request.resource.attr.ownerId": "ownerId",
      "request.resource.attr.department": "department",
      "request.resource.attr.region": "region",
      "request.resource.attr.status": "status",
      "request.resource.attr.amount": "amount",
    },
  });

  const expenses = await prisma.expense.findMany({
    where: filters,
    include: {
      owner: true,
      approvedBy: true,
    },
    orderBy: {
      createdAt: "asc",
    }
  })

  return res.json(expenses);

});

app.get("/expenses/:id", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    }
  })
  if (!expense) return res.status(404).json({ error: "Expense not found" });

  const decision = await cerbos.checkResource({
    principal: req.user,
    resource: {
      kind: "expense",
      id: expense.id,
      attributes: {
        vendor: expense.vendor,
        region: expense.region,
        amount: expense.amount,
        status: expense.status,
        ownerId: expense.owner.id,
        createdAt: expense.createdAt.toISOString(),
        approvedBy: expense.approvedBy?.id ?? null
      }
    },
    actions: ["view", "view:approver"],
  });
  metrics.serverChecks++;

  if (decision.isAllowed("view")) {
    if (!decision.isAllowed("view:approver")) {
      return res.json({
        ...expense,
        approvedBy: undefined,
      });
    } else {
      return res.json(expense);
    }
  }
  return res.status(401).json({ error: "Unauthorized" });
});

app.post("/expenses", async (req, res) => {
  const decision = await cerbos.checkResource({
    principal: req.user,
    resource: {
      kind: "expense",
      id: "new",
      attributes: {}
    },
    actions: ["create"],
  });
  metrics.serverChecks++;

  if (decision.isAllowed("create")) {
    const expense = await prisma.expense.create({
      data: {
        ...req.body,
        owner: {
          connect: {
            id: req.user.id,
          },
        },
        status: "OPEN",
      },
    });
    return res.json(expense);
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
})

app.patch("/expenses/:id", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    }
  })
  if (!expense) return res.status(404).json({ error: "Expense not found" });

  const decision = await cerbos.checkResource({
    principal: req.user,
    resource: {
      kind: "expense",
      id: expense.id,
      attributes: {
        vendor: expense.vendor,
        region: expense.region,
        amount: expense.amount,
        status: expense.status,
        ownerId: expense.owner.id,
        createdAt: expense.createdAt.toISOString(),
        approvedBy: expense.approvedBy?.id ?? null
      }
    },
    actions: ["update"],
  });
  metrics.serverChecks++;

  if (decision.isAllowed("update")) {
    const updatedExpense = await prisma.expense.update({
      where: {
        id: req.params.id,
      },
      data: {
        vendor: req.body.vendor,
        region: req.body.region,
        amount: req.body.amount,
      },
    });
    return res.json(updatedExpense);
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/expenses/:id/approve", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    }
  })
  if (!expense) return res.status(404).json({ error: "Expense not found" });

  const decision = await cerbos.checkResource({
    principal: req.user,
    resource: {
      kind: "expense",
      id: expense.id,
      attributes: {
        vendor: expense.vendor,
        region: expense.region,
        amount: expense.amount,
        status: expense.status,
        ownerId: expense.owner.id,
        createdAt: expense.createdAt.toISOString(),
        approvedBy: expense.approvedBy?.id ?? null
      }
    },
    actions: ["approve"],
  });

  if (decision.isAllowed("approve")) {
    await prisma.expense.update({
      where: {
        id: expense.id,
      },
      data: {
        status: "APPROVED",
        approvedBy: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.json(expense);
  }
  return res.status(401).json({ error: "Unauthorized" });
});

app.post("/expenses/:id/reject", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    }
  })
  if (!expense) return res.status(404).json({ error: "Expense not found" });

  const decision = await cerbos.checkResource({
    principal: req.user,
    resource: {
      kind: "expense",
      id: expense.id,
      attributes: {
        vendor: expense.vendor,
        region: expense.region,
        amount: expense.amount,
        status: expense.status,
        ownerId: expense.owner.id,
        createdAt: expense.createdAt.toISOString(),
        approvedBy: expense.approvedBy?.id ?? null
      }
    },
    actions: ["approve"],
  });

  if (decision.isAllowed("approve")) {
    await prisma.expense.update({
      where: {
        id: expense.id,
      },
      data: {
        status: "REJECTED",
        approvedBy: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.json(expense);
  }
  return res.status(401).json({ error: "Unauthorized" });
});

app.delete("/expenses/:id", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    }
  })
  if (!expense) return res.status(404).json({ error: "Expense not found" });


  const decision = await cerbos.checkResource({
    principal: req.user,
    resource: {
      kind: "expense",
      id: expense.id,
      attributes: {
        vendor: expense.vendor,
        region: expense.region,
        amount: expense.amount,
        status: expense.status,
        ownerId: expense.owner.id,
        createdAt: expense.createdAt.toISOString(),
        approvedBy: expense.approvedBy?.id ?? null
      }
    },
    actions: ["delete"],
  });
  metrics.serverChecks++;

  if (decision.isAllowed("delete")) {
    await prisma.expense.delete({
      where: {
        id: expense.id
      }
    })
    return res.json({
      message: "expense deleted",
    });
  }
  return res.status(401).json({ error: "Unauthorized" });
});

app.get('/me', (req, res) => {
  res.json(req.user)
})

app.get("/_/metrics", (req, res) => {
  return res.json(metrics);
});
app.post("/_/metrics/reset", (req, res) => {
  metrics = {
    serverChecks: 0,
  };
  return res.json();
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
  console.log("Run 'npm run reset' to reset the DB with seed data")
});
