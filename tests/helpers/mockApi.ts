import type { Page, Route } from "@playwright/test";

type Role = "diner" | "franchisee" | "admin";

type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: Array<{ role: Role; objectId?: string }>;
};

const mockMenu = [
  { id: "1", title: "Veggie", image: "pizza1.png", price: 0.0038, description: "A garden of delight" },
  { id: "2", title: "Pepperoni", image: "pizza2.png", price: 0.0042, description: "Spicy treat" },
];

const mockUsers: Record<string, MockUser> = {
  "d@jwt.com": {
    id: "3",
    name: "Kai Chen",
    email: "d@jwt.com",
    password: "a",
    roles: [{ role: "diner" }],
  },
  "f@jwt.com": {
    id: "7",
    name: "Fran Chisee",
    email: "f@jwt.com",
    password: "a",
    roles: [{ role: "franchisee", objectId: "2" }],
  },
  "a@jwt.com": {
    id: "1",
    name: "Ada Min",
    email: "a@jwt.com",
    password: "a",
    roles: [{ role: "admin" }],
  },
};

const apiDocs = {
  endpoints: [
    {
      requiresAuth: false,
      method: "GET",
      path: "/api/order/menu",
      description: "Get pizza menu",
      example: "curl /api/order/menu",
      response: mockMenu,
    },
  ],
};

function requireMethod(route: Route, method: string) {
  if (route.request().method() !== method) {
    throw new Error(`Expected ${method} but got ${route.request().method()} for ${route.request().url()}`);
  }
}

export async function basicInit(
  page: Page,
  options?: { initialUserEmail?: keyof typeof mockUsers; startPath?: string },
) {
  const initialUser = options?.initialUserEmail ? mockUsers[options.initialUserEmail] : null;

  if (initialUser) {
    await page.addInitScript(() => localStorage.setItem("token", "seed-token"));
  } else {
    await page.addInitScript(() => localStorage.removeItem("token"));
  }

  let loggedInUser: MockUser | null = initialUser;
  let nextOrderId = 21;
  let nextStoreId = 100;

  const franchiseList = {
    franchises: [
      {
        id: "2",
        name: "LotaPizza",
        admins: [{ id: "7", name: "Fran Chisee", email: "f@jwt.com" }],
        stores: [
          { id: "4", name: "Lehi", totalRevenue: 1.1 },
          { id: "5", name: "Springville", totalRevenue: 2.2 },
        ],
      },
      {
        id: "3",
        name: "PizzaCorp",
        admins: [{ id: "11", name: "Corp Boss", email: "boss@jwt.com" }],
        stores: [{ id: "7", name: "Spanish Fork", totalRevenue: 0.7 }],
      },
    ],
    more: false,
  };

  const dinerOrders = [
    {
      id: "10",
      franchiseId: "2",
      storeId: "4",
      date: "2026-02-16T00:00:00.000Z",
      items: [{ menuId: "1", description: "Veggie", price: 0.0038 }],
    },
  ];

  await page.route(/\/version\.json$/, async (route) => {
    await route.fulfill({ json: { version: "20260216.000000" } });
  });

  await page.route(/\/api\/auth$/, async (route) => {
    const method = route.request().method();

    if (method === "DELETE") {
      loggedInUser = null;
      await route.fulfill({ status: 200, json: {} });
      return;
    }

    const body = route.request().postDataJSON() as Record<string, string>;

    if (method === "PUT") {
      const user = mockUsers[body.email];
      if (!user || body.password !== user.password) {
        await route.fulfill({ status: 401, json: { message: "Unauthorized" } });
        return;
      }
      loggedInUser = user;
      await route.fulfill({ json: { user, token: "token-login" } });
      return;
    }

    if (method === "POST") {
      const user: MockUser = {
        id: "99",
        name: body.name,
        email: body.email,
        password: body.password,
        roles: [{ role: "diner" }],
      };
      loggedInUser = user;
      await route.fulfill({ json: { user, token: "token-register" } });
      return;
    }

    await route.fulfill({ status: 405, json: { message: "method not allowed" } });
  });

  await page.route(/\/api\/user\/me$/, async (route) => {
    requireMethod(route, "GET");
    await route.fulfill({ json: loggedInUser });
  });

  await page.route(/\/api\/order\/menu$/, async (route) => {
    requireMethod(route, "GET");
    await route.fulfill({ json: mockMenu });
  });

  await page.route(/\/api\/order$/, async (route) => {
    const method = route.request().method();

    if (method === "GET") {
      await route.fulfill({ json: { id: "3", dinerId: loggedInUser?.id ?? "3", orders: dinerOrders } });
      return;
    }

    requireMethod(route, "POST");
    const orderReq = route.request().postDataJSON() as Record<string, unknown>;
    const orderRes = {
      order: { ...orderReq, id: String(nextOrderId++) },
      jwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock",
    };
    dinerOrders.push({
      ...(orderRes.order as any),
      date: "2026-02-16T01:00:00.000Z",
    });
    await route.fulfill({ json: orderRes });
  });

  await page.route(/\/api\/order\/verify$/, async (route) => {
    requireMethod(route, "POST");
    await route.fulfill({ json: { message: "valid", payload: { sub: "pizza", iss: "factory" } } });
  });

  await page.route(/\/api\/franchise\?.*$/, async (route) => {
    requireMethod(route, "GET");
    const url = new URL(route.request().url());
    const nameFilter = url.searchParams.get("name") || "*";

    const normalized = nameFilter.replace(/\*/g, "").toLowerCase();
    const filtered = normalized
      ? franchiseList.franchises.filter((f) => f.name.toLowerCase().includes(normalized))
      : franchiseList.franchises;

    await route.fulfill({ json: { ...franchiseList, franchises: filtered } });
  });

  await page.route(/\/api\/franchise$/, async (route) => {
    requireMethod(route, "POST");
    const req = route.request().postDataJSON() as { name: string; admins: Array<{ email: string }> };
    const adminEmail = req.admins?.[0]?.email ?? "owner@jwt.com";
    const created = {
      id: String(franchiseList.franchises.length + 10),
      name: req.name,
      admins: [{ id: "99", name: "New Admin", email: adminEmail }],
      stores: [],
    };
    franchiseList.franchises.unshift(created);
    await route.fulfill({ json: created });
  });

  await page.route(/\/api\/franchise\/[^/]+\/store\/[^/]+$/, async (route) => {
    requireMethod(route, "DELETE");
    const match = route.request().url().match(/\/api\/franchise\/([^/]+)\/store\/([^/]+)/);
    const franchiseId = match?.[1];
    const storeId = match?.[2];
    const franchise = franchiseList.franchises.find((f) => f.id === franchiseId);
    if (franchise) {
      franchise.stores = franchise.stores.filter((s) => s.id !== storeId);
    }
    await route.fulfill({ status: 200, json: null });
  });

  await page.route(/\/api\/franchise\/[^/]+\/store$/, async (route) => {
    requireMethod(route, "POST");
    const req = route.request().postDataJSON() as { name: string };
    const match = route.request().url().match(/\/api\/franchise\/([^/]+)\/store/);
    const franchiseId = match?.[1];
    const franchise = franchiseList.franchises.find((f) => f.id === franchiseId);
    const store = {
      id: String(nextStoreId++),
      name: req.name,
      totalRevenue: 0,
    };
    if (franchise) {
      franchise.stores.push(store);
    }
    await route.fulfill({ json: store });
  });

  await page.route(/\/api\/franchise\/[^/?]+$/, async (route) => {
    const method = route.request().method();
    if (method === "DELETE") {
      const match = route.request().url().match(/\/api\/franchise\/([^/?]+)/);
      const id = match?.[1];
      const idx = franchiseList.franchises.findIndex((f) => f.id === id);
      if (idx >= 0) {
        franchiseList.franchises.splice(idx, 1);
      }
      await route.fulfill({ status: 200, json: {} });
      return;
    }

    requireMethod(route, "GET");
    const match = route.request().url().match(/\/api\/franchise\/([^/?]+)/);
    const userId = match?.[1];

    if (userId === "7") {
      await route.fulfill({ json: [franchiseList.franchises[0]] });
      return;
    }

    await route.fulfill({ json: [] });
  });

  await page.route(/\/api\/docs$/, async (route) => {
    requireMethod(route, "GET");
    await route.fulfill({ json: apiDocs });
  });

  await page.goto(options?.startPath ?? "/");
}
