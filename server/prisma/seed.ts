import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const users = [
  {
    id: "sally",
    roles: ["USER"],
    attributes: {
      department: "SALES",
      region: "EMEA",
    },
  },
  {
    id: "ian",
    roles: ["ADMIN"],
    attributes: {
      department: "IT",
    },
  },
  {
    id: "frank",
    roles: ["USER"],
    attributes: {
      department: "FINANCE",
      region: "EMEA",
    },
  },
  {
    id: "derek",
    roles: ["USER", "MANAGER"],
    attributes: {
      department: "FINANCE",
      region: "EMEA",
    },
  },
  {
    id: "simon",
    roles: ["USER", "MANAGER"],
    attributes: {
      department: "SALES",
      region: "NA",
    },
  },
  {
    id: "mark",
    roles: ["USER", "MANAGER"],
    attributes: {
      department: "SALES",
      region: "EMEA",
    },
  },
  {
    id: "sydney",
    roles: ["USER"],
    attributes: {
      department: "SALES",
      region: "NA",
    },
  },
];

const fiveMinutesAgo = new Date();
fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

const twoHoursAgo = new Date();
twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

const expenses = [
  {
    id: "expense1",
    attributes: {
      ownerId: "sally",
      createdAt: twoMonthsAgo.toISOString(),
      vendor: "Flux Water Gear",
      region: "EMEA",
      amount: 500,
      status: "OPEN",
    },
  },
  {
    id: "expense2",
    attributes: {
      ownerId: "sally",
      createdAt: twoHoursAgo.toISOString(),
      vendor: "Vortex Solar",
      region: "EMEA",
      amount: 2500,
      status: "APPROVED",
      approvedBy: "frank",
    },
  },
  {
    id: "expense3",
    attributes: {
      ownerId: "sally",
      createdAt: fiveMinutesAgo.toISOString(),
      vendor: "Global Airlines",
      region: "EMEA",
      amount: 12000,
      status: "OPEN",
    },
  },
  {
    id: "expense4",
    attributes: {
      ownerId: "frank",
      createdAt: "2021-10-01T10:00:00.021-05:00",
      vendor: "Vortex Solar",
      region: "EMEA",
      amount: 2421,
      status: "OPEN",
    },
  },
  {
    id: "expense5",
    attributes: {
      ownerId: "sally",
      createdAt: twoHoursAgo.toISOString(),
      vendor: "Vortex Solar",
      region: "EMEA",
      amount: 2500,
      status: "REJECTED",
      approvedBy: "frank",
    },
  },
];

async function main() {

  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        roles: JSON.stringify(user.roles),
        department: user.attributes.department,
        region: user.attributes.region,
      }
    })
  }

  for (const expense of expenses) {
    await prisma.expense.create({
      data: {
        id: expense.id,
        owner: {
          connect: {
            id: expense.attributes.ownerId,
          },
        },
        createdAt: expense.attributes.createdAt,
        vendor: expense.attributes.vendor,
        region: expense.attributes.region,
        amount: expense.attributes.amount,
        status: expense.attributes.status,
        approvedBy: expense.attributes.approvedBy ? {
          connect: {
            id: expense.attributes.approvedBy,
          },
        } : undefined,
      },
    })
  }



}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })