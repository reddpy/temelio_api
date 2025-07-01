import { Hono } from "hono";
import NonProfitObj, { OpStatus } from "./nonprofit_obj";

const app = new Hono();

const nonprofit_data = new NonProfitObj();

app.post("/nonprofit/create", async (c) => {
  const body = await c.req.json();

  const result = nonprofit_data.add({
    name: body.name,
    email: body.email,
    address: body.address,
  });

  if (result.msg === OpStatus.ERROR_DUP) {
    c.status(303); //see other status code for duplicates
  }

  return c.json(result);
});

export default app;
