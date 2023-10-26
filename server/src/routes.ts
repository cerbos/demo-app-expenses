import { PlanKind, queryPlanToPrisma } from "@cerbos/orm-prisma";
import express from "express";
import { cerbos } from "./cerbos";
import { prisma } from "./db";
import { tracer } from "./tracing";

const router = express.Router();

// Metrics
interface CheckLog {
  ts: Date;
  location: "server";
  principalId: string;
  resourceKind: string;
  resourceId: string;
  action: string;
  allowed: boolean;
}

let serverChecks: CheckLog[] = [];

router.get("/expenses", async (req, res) => {
  const span = tracer.startSpan("planResources");
  span.setAttributes({
    principalId: req.user.id,
    principalRoles: req.user.roles,
    resourceKind: "expense",
    actions: ["view"],
  });
  const queryPlan = await cerbos.planResources({
    principal: req.user,
    resource: { kind: "expense" },
    action: "view",
  });
  span.end();

  // METRICS FOR DEMO
  serverChecks.push({
    ts: new Date(),
    location: "server",
    principalId: req.user.id,
    resourceKind: "expense",
    resourceId: "LIST",
    action: "view",
    allowed: true,
  });

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

  if (filters.kind === PlanKind.ALWAYS_ALLOWED) {
    const expenses = await prisma.expense.findMany({
      include: {
        owner: true,
        approvedBy: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json(expenses);
  } else if (filters.kind === PlanKind.ALWAYS_DENIED) {
    res.json({ expenses: [] });
  } else {
    const expenses = await prisma.expense.findMany({
      where: filters.filters,
      include: {
        owner: true,
        approvedBy: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return res.json(expenses);
  }
});

router.get("/expenses/:id", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    },
  });
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  const span = tracer.startSpan("checkResource");
  span.setAttributes({
    principalId: req.user.id,
    principalRoles: req.user.roles,
    resourceKind: "expense",
    resourceId: expense.id,
    actions: ["view", "view:approver"],
  });
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
        approvedBy: expense.approvedBy?.id ?? null,
      },
    },
    actions: ["view", "view:approver"],
  });
  span.end();
  // METRICS FOR DEMO
  ["view", "view:approver"].map((action) =>
    serverChecks.push({
      ts: new Date(),
      location: "server",
      principalId: req.user.id,
      resourceKind: "expense",
      resourceId: expense.id,
      action,
      allowed: decision.isAllowed(action) || false,
    })
  );

  const permissions = {
    canViewApprover: decision.isAllowed("view:approver"),
  };

  if (decision.isAllowed("view")) {
    if (!decision.isAllowed("view:approver")) {
      return res.json({
        expense: {
          ...expense,
          approvedBy: undefined,
        },
        permissions,
      });
    } else {
      return res.json({ expense, permissions });
    }
  }
  return res.status(401).json({ error: "Unauthorized" });
});

router.post("/expenses", async (req, res) => {
  const span = tracer.startSpan("checkResource");
  span.setAttributes({
    principalId: req.user.id,
    principalRoles: req.user.roles,
    resourceKind: "expense",
    actions: ["create"],
  });
  const decision = await cerbos.checkResource({
    principal: req.user,
    resource: {
      kind: "expense",
      id: "new",
      attributes: {},
    },
    actions: ["create"],
  });
  span.end();
  // METRICS FOR DEMO
  ["create"].map((action) =>
    serverChecks.push({
      ts: new Date(),
      location: "server",
      principalId: req.user.id,
      resourceKind: "expense",
      resourceId: "new",
      action,
      allowed: decision.isAllowed(action) || false,
    })
  );

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
});

router.patch("/expenses/:id", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    },
  });
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  const span = tracer.startSpan("checkResource");
  span.setAttributes({
    principalId: req.user.id,
    principalRoles: req.user.roles,
    resourceKind: "expense",
    resourceId: expense.id,
    actions: ["update"],
  });
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
        approvedBy: expense.approvedBy?.id ?? null,
      },
    },
    actions: ["update"],
  });
  span.end();
  // METRICS FOR DEMO
  ["update"].map((action) =>
    serverChecks.push({
      ts: new Date(),
      location: "server",
      principalId: req.user.id,
      resourceKind: "expense",
      resourceId: expense.id,
      action,
      allowed: decision.isAllowed(action) || false,
    })
  );

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

router.post("/expenses/:id/approve", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    },
  });
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  const span = tracer.startSpan("checkResource");
  span.setAttributes({
    principalId: req.user.id,
    principalRoles: req.user.roles,
    resourceKind: "expense",
    resourceId: expense.id,
    actions: ["approve"],
  });
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
        approvedBy: expense.approvedBy?.id ?? null,
      },
    },
    actions: ["approve"],
  });
  // METRICS FOR DEMO
  ["approve"].map((action) =>
    serverChecks.push({
      ts: new Date(),
      location: "server",
      principalId: req.user.id,
      resourceKind: "expense",
      resourceId: expense.id,
      action,
      allowed: decision.isAllowed(action) || false,
    })
  );
  span.end();

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

router.post("/expenses/:id/reject", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    },
  });
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  const span = tracer.startSpan("checkResource");
  span.setAttributes({
    principalId: req.user.id,
    principalRoles: req.user.roles,
    resourceKind: "expense",
    resourceId: expense.id,
    actions: ["approve"],
  });
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
        approvedBy: expense.approvedBy?.id ?? null,
      },
    },
    actions: ["approve"],
  });
  // METRICS FOR DEMO
  ["approve"].map((action) =>
    serverChecks.push({
      ts: new Date(),
      location: "server",
      principalId: req.user.id,
      resourceKind: "expense",
      resourceId: expense.id,
      action,
      allowed: decision.isAllowed(action) || false,
    })
  );
  span.end();

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

router.delete("/expenses/:id", async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      owner: true,
      approvedBy: true,
    },
  });
  if (!expense) return res.status(404).json({ error: "Expense not found" });

  const span = tracer.startSpan("checkResource");
  span.setAttributes({
    principalId: req.user.id,
    principalRoles: req.user.roles,
    resourceKind: "expense",
    resourceId: expense.id,
    actions: ["delete"],
  });
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
        approvedBy: expense.approvedBy?.id ?? null,
      },
    },
    actions: ["delete"],
  });
  span.end();
  // METRICS FOR DEMO
  ["delete"].map((action) =>
    serverChecks.push({
      ts: new Date(),
      location: "server",
      principalId: req.user.id,
      resourceKind: "expense",
      resourceId: expense.id,
      action,
      allowed: decision.isAllowed(action) || false,
    })
  );

  if (decision.isAllowed("delete")) {
    await prisma.expense.delete({
      where: {
        id: expense.id,
      },
    });
    return res.json({
      message: "expense deleted",
    });
  }
  return res.status(401).json({ error: "Unauthorized" });
});

router.get("/me", async (req, res) => {
  res.json({
    user: req.user,
  });
});

router.get("/_/usage", (req, res) => {
  return res.json({ server: serverChecks });
});

router.post("/_/usage/reset", (req, res) => {
  serverChecks = [];
  return res.json();
});

export default router;
