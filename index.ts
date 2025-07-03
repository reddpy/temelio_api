import { Hono } from "hono";
import NonProfitObj, { OpStatus, OpCode } from "./nonprofit_obj";

const app = new Hono();

const nonprofit_data = new NonProfitObj();

app.post("/nonprofit/create", async (c) => {
  const body = await c.req.json();

  const result = nonprofit_data.add({
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    address: String(body.address).trim(),
  });

  if (result.msg === OpStatus.ERROR_DUP) {
    c.status(303); //see other status code for duplicates
  }

  return c.json(result);
});

app.patch("/nonprofit/update", async (c) => {
  const body = await c.req.json();

  if (!body.email) {
    return c.json({ error: "Email is required" }, 400);
  }

  const hasUpdates = body.name || body.address || body.updated_email;
  if (!hasUpdates) {
    c.status(400);

    return c.json({
      operation: OpCode.UPDATE,
      msg: OpStatus.NO_FIELDS,
      non_profit: {
        ...body,
        name: "missing",
        address: "missing",
        updated_email: "missing",
      },
    });
  }

  const updateData = {
    name: body.name?.trim(),
    email: body.email.trim(),
    address: body.address?.trim(),
    updated_email: body.updated_email?.trim(),
  };

  const result = nonprofit_data.update(updateData.email, updateData);

  if (result.msg === OpStatus.NOT_FOUND) {
    c.status(404);
    return c.json(result);
  }

  c.status(200);
  return c.json(result);
});

export default app;
